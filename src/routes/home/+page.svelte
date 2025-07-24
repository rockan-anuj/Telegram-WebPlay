<script lang="ts">
	import ChatItem from '$lib/components/ChatItem.svelte';
	import { onMount } from 'svelte';
	import TdClientManager from '$lib/TdClientManager.js';
	import type { TdApi } from '$lib/types/td_api';
	import type { TdObject } from 'tdweb';
	import { goto } from '$app/navigation';
	import type { OrderedChat } from '$lib/utils/TelegramUtils';
	import ChatView from '$lib/components/ChatView.svelte';

	let chatList: OrderedChat[] = [];
	let tdClientManager: TdClientManager;

	let chatOpen = true;

	function showList() {
		let client = tdClientManager.getClient();
		console.log('Fetching Chats');
		client.send({
			'@type': 'loadChats',
			chat_list: {
				'@type': 'chatListMain'
			},
			limit: 10
		} as TdApi.loadChats as TdObject).then((r) => {
			console.log(r);
		});
	}

	function sortOrderedChat() {
		chatList = chatList.sort((a, b) => {
			const orderA = parseInt(a.order, 10);
			const orderB = parseInt(b.order, 10);
			return orderB - orderA;
		});
	}

	function setCallBack() {
		tdClientManager.setCallback((update) => {
				if (update['@type'] === 'updateAuthorizationState') {
					let updateType = (update['authorization_state']) as TdApi.AuthorizationState;
					if ((updateType['@type'] === 'authorizationStateWaitPhoneNumber') || (updateType['@type'] === 'authorizationStateWaitCode')) {
						goto('../login', { replaceState: true });
					}
					if (updateType['@type'] === 'authorizationStateReady') {
						showList();
					}
				} else if (update['@type'] === 'updateNewChat') {
					const newChat = update.chat as unknown as TdApi.Chat;

					if (!chatList.some(chat => chat.chatItem.id === newChat.id)) {
						chatList = [...chatList, { order: '0', chatItem: newChat } as OrderedChat];
					}
					sortOrderedChat();
				} else if (update['@type'] === 'updateChatLastMessage') {
					const chatId = update.chat_id;
					const updatedLastMessage = update.last_message as unknown as TdApi.Message;
					chatList = chatList.map(chat => {
						if (chat.chatItem.id === chatId) {
							const updatedChatItem = {
								...chat.chatItem,
								last_message: updatedLastMessage
							};
							return { ...chat, chatItem: updatedChatItem };
						}
						return chat;
					});
					sortOrderedChat();
				} else if (update['@type'] === 'updateChatPosition') {
					const updateChatPosition = update as unknown as TdApi.updateChatPosition;
					chatList = chatList.map(chat => {
						if (chat.chatItem.id === update.chat_id) {
							return { ...chat, order: updateChatPosition.position.order };
						}
						return chat;
					});
					sortOrderedChat();
				}
				console.log(update);
			}
		);
	}

	onMount(async () => {
		tdClientManager = await TdClientManager.getSingletonInstance();
		setCallBack();
	});
</script>

<div class="h-dvh w-dvw flex flex-col bg-gradient-to-b from-[#334242] to-[#181918]">
	<div
		class="px-8 pt-8 rounded-b-2xl absolute top-0 w-full pb-4 flex flex-row items-center gap-4 md:gap-10 backdrop-blur-2xl bg-[#22334422]">
		<img class="shadow-[0_0_100px_#A7BA88] object-cover rounded-full size-10" src="./logo.svg" alt="logo">
		<p class="text-white text-3xl pl-2 font-semibold">Chats</p>
	</div>
	<div class="overflow-y-scroll pt-22 flex  flex-col">
		<div class=" p-4 gap-4 flex flex-col ">
			{#each chatList as chat (chat.chatItem.id)}
				<ChatItem client={tdClientManager.getClient()} chatItemProp={chat.chatItem} />
			{/each}
		</div>
	</div>
	{#if chatOpen}
		<ChatView className="absolute w-svw h-svh bg-gradient-to-b from-[#334242] to-[#181918]">

		</ChatView>
	{/if}
</div>