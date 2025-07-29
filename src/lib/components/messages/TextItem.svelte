<script lang="ts">
	import type { TdApi } from '$lib/types/td_api';
	import { onMount } from 'svelte';
	import { TelegramUtils } from '$lib/utils/TelegramUtils';
	import type TdClient from 'tdweb';
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
</script>

<div class="w-full rounded-xl p-2 bg-[#ffffff11] flex flex-col">
	<p class="w-full font-semibold pl-2 pb-1 truncate" style={`color: ${colorTitle};`}>{messageSender}</p>
	<p class="text-gray-300 m-2 w-full break-all">{TelegramUtils.getTagFromMsg(message)}</p>
	<p class="text-xs w-full text-right pr-2 text-gray-300">{TelegramUtils.getTimeFromMsg(message)}</p>
</div>
