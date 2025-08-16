<script lang="ts">
	import '../app.css';
	import type { LayoutProps } from '../../.svelte-kit/types/src/routes/$types';

	let { data, children }: LayoutProps = $props();
	console.log(data);
</script>

{@render children()}
