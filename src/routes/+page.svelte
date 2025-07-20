<script lang="ts">
		import { onMount } from 'svelte';
		import TdClientManager from '$lib/TdClientManager';
		import { goto } from '$app/navigation';
    onMount(async () => {
			if(localStorage.getItem('api_id')){
				(await TdClientManager.getSingletonInstance()).getClient();
			}else{
				goto("../configure",{replaceState:true})
			}
    });
</script>

<h1>Welcome to Telegram Web Play</h1>
