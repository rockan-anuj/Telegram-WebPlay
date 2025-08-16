<script lang="ts">
	import TdClientManager from '$lib/TdClientManager.js';
	import { onMount } from 'svelte';
	import { type TdApi } from '$lib/types/td_api';
	import { PlayerUtils } from '$lib/utils/PlayerUtils';

	let errorMessage: string | undefined = $state();

	import type { LayoutLoad } from '../$lib/types';
	import type { TdObject } from 'tdweb';
	import DocumentItem from '$lib/components/messages/DocumentItem.svelte';
	import ChatItem from '$lib/components/ChatItem.svelte';
	import MessageItemWrapper from '$lib/components/messages/MessageItemWrapper.svelte';

	let { data } = $props<{ data: LayoutLoad }>();
	let tdClientManager: TdClientManager = data.tdClientManager as TdClientManager;

	let currentPlayMessage = JSON.parse(localStorage.getItem('currentPlayMessage') || '{}') as TdApi.message;
	let tdPlayer: PlayerUtils | undefined;

	let status = $state("VLC VideoPlayer is required to play the video.")

	function readCurrentVideoFile(offset: number, length: number): Promise<ArrayBuffer> {
		if (tdPlayer) {
			return tdPlayer.getFileChunkOfVideo(offset, length);
		}
		return Promise.reject(new Error('Player is not initialized'));
	}

	function setCallBack() {
		tdClientManager.setCallback((update) => {
				if (update['@type'] === 'updateFile') {
					console.log(update);
					const updateFile = (update as unknown as TdApi.updateFile).file;
					if (updateFile.local.is_downloading_active) {
						console.log('Download prog:', updateFile.local.path, updateFile.local.downloaded_size);
						status = "Loading video part " + updateFile.local.downloaded_prefix_size/1024 + " KB";
					} else if (!updateFile.local.is_downloading_active && updateFile.local.downloaded_size > 100) {
						console.log('Download completed:', updateFile.local.path);
						status = "Playing video part in VLC " + updateFile.local.downloaded_prefix_size/1024 + " KB";
					}
				}
			}
		);
	}

	onMount(async () => {
		console.log(tdClientManager.isInitialized() ? 'TDLib is initialized' : 'TDLib is not initialized');
		while (!tdClientManager.isInitialized()) {
			await new Promise(resolve => setTimeout(resolve, 400));
		}
		tdPlayer = new PlayerUtils(tdClientManager, currentPlayMessage);
		window.readCurrentVideoFile = readCurrentVideoFile;
		setCallBack();
		console.log('Player is initialized');
	});

	function openVlc() {
		tdClientManager.getClient()
			.send({
				'@type': 'getMessage',
				chat_id: currentPlayMessage.chat_id,
				message_id: currentPlayMessage.id
			} as TdApi.getMessage as TdObject)
			.then((r) => {
				if (r['@type'] === 'message') {
					let msg = r as unknown as TdApi.message;
					const msgDoc = msg?.content as TdApi.messageDocument;
					try{
						window.electronAPI.videoReady(msgDoc.document.document.size);
					}catch (e) {
						console.log(e);
						status = "Browser is not supported. Please use Windows Client to play the video.";
					}
				}
			});
	}
</script>

<div class="h-dvh w-dvw justify-center items-center flex flex-col md:flex-row bg-gradient-to-b from-[#334242] to-[#181918]">
	<div class="flex-col gap-4 flex items-center justify-center">
		<MessageItemWrapper client={tdClientManager.getClient()} messageItem={currentPlayMessage} />

		<button onclick={openVlc} class="text-3xl bg-primary-400 px-10 py-4 rounded-full text-secondary-500 hover:scale-101">Play in VLC</button>
		<div class="p-10 bg-secondary-500 rounded-2xl border-1 border-slate-300 text-center text-gray-400 hover:scale-101">
			<p class="">{status}</p>
		</div>
	</div>
	{#if errorMessage}
		<div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-800 text-white p-3 rounded-lg shadow-lg z-50">
			{errorMessage}
		</div>
	{/if}
</div>