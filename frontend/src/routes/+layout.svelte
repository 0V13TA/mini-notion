<script lang="ts">
	import './layout.css';
	import { theme } from '$lib/stores/theme';
	import favicon from '$lib/assets/favicon.svg';

	$effect(() => {
		document.documentElement.setAttribute('data-theme', $theme);
	});

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
