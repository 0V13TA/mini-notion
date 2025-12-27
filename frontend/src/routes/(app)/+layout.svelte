<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { Session } from '@supabase/supabase-js';

	let { children } = $props();

	// 1. STATE: Holds the list of pages from the DB
	let pages = $state<any[]>([]);
	let user = $state<any>(null);
	let isSidebarOpen = $state(true);
	let ses = $state<Session | null>(null);

	// 2. FETCH: The function that talks to your API
	async function loadData() {
		const {
			data: { session }
		} = await supabase.auth.getSession();

		ses = session;
		if (!session) {
			goto('/login');
			return;
		}
		user = session.user;

		// GET /api/pages (Returns all pages, sorted by newest)
		const res = await fetch('/api/pages', {
			headers: { Authorization: `Bearer ${session.access_token}` }
		});

		if (res.ok) {
			pages = await res.json(); // <--- This populates the sidebar
		}
	}

	// 3. CREATE: Adds a new page and updates the list immediately
	async function createPage() {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		if (!session) return;

		const res = await fetch('/api/pages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${session.access_token}`
			}
		});

		if (res.ok) {
			const newPage = await res.json();
			// Add new page to the TOP of the list
			pages = [newPage, ...pages];
			goto(`/p/${newPage.id}`);
		}
	}

	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/login');
	}

	// Run fetch on load
	onMount(() => {
		loadData();
	});
</script>

<div class="app-layout">
	<Sidebar
		bind:isOpen={isSidebarOpen}
		{pages}
		{user}
		session={ses}
		onCreatePage={createPage}
		onLogout={handleLogout}
	/>

	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.app-layout {
		display: flex;
		height: 100vh;
		width: 100vw;
		background-color: var(--color-bg);
		color: var(--color-text);
		overflow: hidden;
	}

	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
	}
</style>
