<script>
	import Navbar from '$lib/components/Navbar.svelte';

	let pageTitle = 'Project Roadmap';
	let pageIcon = '🚀';
</script>

<div class="page-layout">
	<Navbar title={pageTitle} icon={pageIcon} />

	<div class="editor-container"></div>
</div>
