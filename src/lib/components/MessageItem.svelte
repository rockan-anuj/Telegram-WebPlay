<script lang="ts">
	import type { TdApi } from '$lib/types/td_api';
	import TdClient, { type TdObject } from 'tdweb';
	import { onDestroy, onMount } from 'svelte';

	let displayImageUrl: string = $state('../user.svg');
	let { chatItemProp, client } = $props<{ chatItemProp: TdApi.chat, client: TdClient }>();
	let chatItem = $derived(chatItemProp as TdApi.chat);

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

<div class="w-full rounded-2xl bg-[#ffffff11] h-20 flex flex-row items-center px-4">
	<img class="w-12 h-12 rounded-full" alt="profile" src={displayImageUrl} />

	<div class="px-3 flex-1 h-max overflow-hidden">
		<p class="font-semibold text-white">{title}</p>
		<p class="text-xs text-gray-300 truncate">{subtitle}</p>
	</div>

	<p class="text-xs mb-5 text-gray-300">{time}</p>
</div>
