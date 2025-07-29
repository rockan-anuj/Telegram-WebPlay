<script lang="ts">
	import type { TdApi } from '$lib/types/td_api';
	import { TelegramUtils } from '$lib/utils/TelegramUtils';
	import TdClient, { type TdObject } from 'tdweb';
	import { onDestroy, onMount } from 'svelte';

	let displayImageUrl: string = $state('../user.svg');
	let { chatItemProp, client , onOpen } = $props<{ chatItemProp: TdApi.chat, client: TdClient , onOpen: (chatItem: TdApi.chat) => void }>();
	let chatItem = $derived(chatItemProp as TdApi.chat);

	let title = $derived((chatItem) ? chatItem.title : 'Telegram');
	//let time = $derived((chatItem && chatItem.last_message) ? TelegramUtils.getTimeFromMsg(chatItem.last_message) : '');
	let profileFile = $derived((chatItem && chatItem.photo?.small) ? chatItem.photo.small : null);

	function setDisplayProfile(file: TdApi.file) {
		client.send({
			'@type': 'readFilePart',
			file_id: file.id,
			offset: 0,
			limit: 0
		} as TdApi.readFilePart as TdObject).then((response: TdObject) => {
			if (response['@type'] === 'filePart') {
				const filePart = response as unknown as TdApi.filePart;
				try {
					const blob = filePart.data;
					displayImageUrl = URL.createObjectURL(blob);
				} catch (e) {
					console.error('Error reading file content:', e);
				}
			}
		});
	}

	function downloadAndSetProfile(profileFile: TdApi.file) {
		client.send({
			'@type': 'downloadFile',
			file_id: profileFile.id,
			priority: 1,
			synchronous: true
		} as TdApi.downloadFile as TdObject).then((r: TdObject) => {
			console.log(r);
			if (r['@type'] === 'file') {
				const file = (r as unknown as TdApi.file);
				console.log(file);
				if (profileFile && !displayImageUrl.startsWith('blob:')) {
					setDisplayProfile(file);
				}
			}
		});
	}

	onMount(() => {
		if (chatItem.photo?.minithumbnail?.data) {
			displayImageUrl = `data:image/jpeg;base64,${chatItem.photo.minithumbnail.data}`;
		}

		if (client && profileFile?.id) {
			if(profileFile.local.is_downloading_completed){
				if (profileFile && !displayImageUrl.startsWith('blob:')) {
					setDisplayProfile(profileFile);
				}
			}else{
				if(!profileFile.local.is_downloading_active){
					downloadAndSetProfile(profileFile);
				}
			}
		}
	})
	onDestroy(() => {
		if (displayImageUrl && displayImageUrl.startsWith('blob:')) {
			URL.revokeObjectURL(displayImageUrl);
			console.log(`Revoked object URL: ${displayImageUrl}`);
		}
	});
</script>

<div onclick={onOpen} class="w-full rounded-b-2xl shadow-lg bg-[#ffffff11] h-20 flex flex-row items-center px-4" tabindex="0" role="button"  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}>
	<img class="w-12 h-12 rounded-full" alt="profile" src={displayImageUrl} />

	<div class="px-3 flex-1 h-max overflow-hidden">
		<p class="font-semibold text-white">{title}</p>
	</div>
</div>
