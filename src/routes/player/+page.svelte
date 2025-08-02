<script lang="ts">
	import TdClientManager from '$lib/TdClientManager.js';
	import { onMount } from 'svelte';
	import { type TdApi } from '$lib/types/td_api';
	import { goto } from '$app/navigation';
	import { PlayerUtils } from '$lib/utils/PlayerUtils';

	let videoElem: HTMLVideoElement = null as unknown as HTMLVideoElement;
	let errorMessage: string|undefined = $state();
	let tdClientManager: TdClientManager = $state(TdClientManager.myInstance as TdClientManager);
	let currentPlayMessage = JSON.parse(localStorage.getItem('currentPlayMessage') || '{}') as TdApi.message;
	let tdPlayer = new PlayerUtils(videoElem);

	function canBePlayed(currentPlayMessage: TdApi.message) {
		return currentPlayMessage.content['@type'] === 'messageDocument' || currentPlayMessage.content['@type'] === 'messageVideo';
	}

	async function playVideo(currentPlayMessage: TdApi.message) {
		if (currentPlayMessage.content['@type'] === 'messageDocument') {
			await tdPlayer.playDocumentVideo(tdClientManager.getClient(), currentPlayMessage, videoElem);
		}
	}

	async function startPlaying() {
		console.log(currentPlayMessage);
		if (currentPlayMessage.id && canBePlayed(currentPlayMessage)) {
			await playVideo(currentPlayMessage);
		} else {
			await goto('../home', { replaceState: true });
		}
	}

	function setCallBack() {
		tdClientManager.setCallback((update) => {
				if (update['@type'] === 'updateAuthorizationState') {
					let updateType = (update['authorization_state']) as TdApi.AuthorizationState;
					if (updateType['@type'] === 'authorizationStateReady') {
						startPlaying();
					}
				}
				if (update['@type'] === 'updateFile') {
					console.log(update);
					const updateFile = (update as unknown as TdApi.updateFile).file;
					if (updateFile.local.is_downloading_active) {
						console.log('Download prog:', updateFile.local.path, updateFile.local.downloaded_size);
					} else if (!updateFile.local.is_downloading_active && updateFile.local.downloaded_size > 1000000) {
						console.log('Download completed:', updateFile.local.path);
					}
				}
			}
		);
	}


	onMount(async () => {
		tdClientManager = await TdClientManager.getSingletonInstance();
		if(tdClientManager.isInitialized()) {
			await startPlaying();
		}

		setCallBack();
	});
</script>

<div class="h-dvh w-dvw flex flex-col md:flex-row bg-gradient-to-b from-[#334242] to-[#181918]">
	<div class="flex-grow flex items-center justify-center">
		<video bind:this={videoElem} class="w-full h-full bg-black" controls autoplay>
			<track kind="captions">
		</video>
	</div>
	{#if errorMessage}
		<div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-800 text-white p-3 rounded-lg shadow-lg z-50">
			{errorMessage}
		</div>
	{/if}
</div>