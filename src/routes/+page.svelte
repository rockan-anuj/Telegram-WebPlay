<script lang="ts">
		import { onMount } from 'svelte';
		import TdClientManager from '$lib/TdClientManager';
		import { goto } from '$app/navigation';
		import type { TdApi } from '$lib/types/td_api';
    onMount(async () => {
			if(localStorage.getItem('api_id')){
				let tdClientManager = await TdClientManager.getSingletonInstance();
				tdClientManager.setCallback((update) => {
						if (update['@type'] === 'updateAuthorizationState') {
							let updateType = (update['authorization_state']) as TdApi.AuthorizationState;
							if (updateType['@type'] === 'authorizationStateWaitPhoneNumber') {
								goto("../login",{replaceState:true});
							}
							if (updateType['@type'] === 'authorizationStateWaitCode') {
								goto("../home",{replaceState:true});
							}
							if (updateType['@type'] === 'authorizationStateReady') {
								goto("../home",{replaceState:true});
							}
						}
					});
			}else{
				goto("../configure",{replaceState:true})
			}
    });
</script>

<h1>Welcome to Telegram Web Play</h1>
