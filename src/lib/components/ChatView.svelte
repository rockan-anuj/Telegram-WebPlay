<script lang="ts">
	import { type TdApi } from '$lib/types/td_api';
	import TdClientManager from '$lib/TdClientManager';
	import { onMount } from 'svelte';
	import ChatHeader from '$lib/components/ChatHeader.svelte';
	import type { TdObject } from 'tdweb';
	import MessageItemWrapper from '$lib/components/messages/MessageItemWrapper.svelte';
	let { className,currentChat } = $props<{ className: string,currentChat:TdApi.Chat }>();
	let chatItem = $derived(currentChat as TdApi.Chat);
	let tdClientManager: TdClientManager = $state(TdClientManager.myInstance as TdClientManager);
	let messageList: TdApi.message[] = $state([]);


	let loadMoreAnchor = $state('Loading messages...');
	let loadMoreElem: HTMLDivElement;
	let loading: boolean = false;

	const loadMorePassObserver = new IntersectionObserver(
		async (entries) => {
			if (entries[0].isIntersecting && !loading) {
				loading = true;
				fetchChatHistory(false);
			}
		},
		{ threshold: 1.0 }
	);

	async function fetchChatHistory(includeLast : boolean) {
		await tdClientManager.getClient().send({
			'@type': 'getChatHistory',
			chat_id: chatItem.id,
			from_message_id: messageList[messageList.length-1]?.id || chatItem.last_message?.id || 0,
			offset: includeLast?-1:0,
			limit: 50,
			only_local: true
		} as TdApi.getChatHistory as TdObject).then(chatsResponse => {
			if ((chatsResponse['@type'] === 'messages')) {
				let messages = (chatsResponse as unknown as TdApi.messages).messages;
				messages?.forEach(value => {
					messageList.push(value);
				});
				loading = false;
				loadMorePassObserver.observe(loadMoreElem);
			}else{
				console.log(chatsResponse);
			}
		});
	}

	onMount(async () => {
		tdClientManager = await TdClientManager.getSingletonInstance();
		await fetchChatHistory(true);
	})

	
</script>
<div class={className + " flex flex-col translate-z-2"}>
	<ChatHeader client={tdClientManager.getClient()} onOpen={()=>{}} chatItemProp={currentChat}/>
	<div class="flex-1 overflow-y-scroll p-4 gap-2 flex flex-col-reverse ">
		{#each messageList as message (message.id)}
			<MessageItemWrapper client={tdClientManager.getClient()} messageItem={message} />
			{/each}
		<div bind:this={loadMoreElem} class="m-2 flex w-full text-gray-400 justify-center">{loadMoreAnchor}</div>
	</div>


</div>