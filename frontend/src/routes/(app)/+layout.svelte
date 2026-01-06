<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import type { Session, User } from '@supabase/supabase-js';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { PageData } from '$lib/types';

	let { children } = $props();

	// 1. STATE
	let pages = $state<PageData[]>([]);
	let user = $state<User | null>(null);
	let isSidebarOpen = $state(true);
	let sessionData = $state<Session | null>(null);

	// SHARE STATE: Allow Navbar to access and toggle the sidebar
	setContext('appState', {
		get isOpen() {
			return isSidebarOpen;
		},
		toggleSidebar: () => (isSidebarOpen = !isSidebarOpen),
		// New Function: Allows any page to update the central list (for Sidebar)
		updatePage: (id: string, updates: PageData) => {
			const index = pages.findIndex((p) => p.id === id);
			if (index !== -1) {
				// Merge updates into the existing page object
				pages[index] = { ...pages[index], ...updates };
			}
		}
	});

	// 2. FETCH
	async function loadData() {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		if (!session) {
			goto('/login');
			return;
		}
		user = session.user;
		sessionData = session;

		const res = await fetch('/api/pages', {
			headers: { Authorization: `Bearer ${session.access_token}` }
		});
		if (res.ok) {
			pages = await res.json();
		}
	}

	// 3. CREATE
	async function createPage() {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		if (!session) return;

		const res = await fetch('/api/pages', {
			method: 'POST',
			headers: { Authorization: `Bearer ${session.access_token}` }
		});
		if (res.ok) {
			const newPage = await res.json();
			pages = [newPage, ...pages];
			goto(`/p/${newPage.id}`);
		}
	}

	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/login');
	}

	onMount(() => {
		loadData();
	});
</script>

<div class="app-layout">
	<Sidebar
		bind:isOpen={isSidebarOpen}
		{pages}
		{user}
		session={sessionData}
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
