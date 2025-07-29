<script lang="ts">
	import type { TdApi } from '$lib/types/td_api';
	import TdClient, { type TdObject } from 'tdweb';
	import { onDestroy, onMount } from 'svelte';
	import { TelegramUtils } from '$lib/utils/TelegramUtils';

	let displayImageUrl: string = $state('../user.svg');
	let { messageItem, client } = $props<{ messageItem: TdApi.message, client: TdClient }>();
	let message = $derived(messageItem as TdApi.message);
	let colorTitle = $derived.by(() => {
		return `hsl(${[messageSender].reduce((acc, char) => (acc + char.charCodeAt(0)), 0) % 256}, 60%, 70%)`;
	});
	let messageSender = $state("");
	onMount(async () => {
		if (message.sender_id['@type'] == 'messageSenderUser') {
			let user = await client.send({
				'@type':"getUser",
				user_id: (message.sender_id as TdApi.messageSenderUser).user_id
			} as TdApi.getUser) as TdApi.user;
			messageSender = user.first_name + " " + user.last_name;
		}


	});


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

	function showImage(imageFile: TdApi.file) {
		if (client && imageFile?.id) {
			if (imageFile.local.is_downloading_completed) {
				if (imageFile && !displayImageUrl.startsWith('blob:')) {
					setDisplayProfile(imageFile);
				}
			} else {
				if (!imageFile.local.is_downloading_active) {
					downloadAndSetProfile(imageFile);
				}
			}
		}
	}


	onMount(() => {
	});
	onDestroy(() => {
		if (displayImageUrl && displayImageUrl.startsWith('blob:')) {
			URL.revokeObjectURL(displayImageUrl);
			console.log(`Revoked object URL: ${displayImageUrl}`);
		}
	});
</script>

<div class="w-full rounded-xl p-2 bg-[#ffffff11] flex flex-col">
	<p class="w-full font-semibold pl-2 pb-1  truncate" style={`color: ${colorTitle};`}>{messageSender}</p>
	<div class="w-full rounded-2xl bg-[#ffffff11] h-20 flex flex-row items-center px-4">
		<img class="w-12 h-12 rounded-full" alt="profile" src={displayImageUrl} />

		<div class="px-2 flex-1 h-max overflow-hidden">
			<p class="font-semibold text-white">File Name</p>
			<p class="text-xs text-gray-300 truncate"> FileInfo </p>
		</div>
	</div>
	<pre class="text-gray-300 m-2">{TelegramUtils.getTagFromMsg(message)}</pre>
	<p class="text-xs w-full text-right pr-2 text-gray-300">2121:221am</p>
</div>
