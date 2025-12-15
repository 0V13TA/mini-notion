<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { supabase } from '$lib/supabaseClient';
    import Sidebar from '$lib/components/Sidebar.svelte';

    let { children } = $props();
    
    // State
    let pages = $state<any[]>([]);
    let user = $state<any>(null);
    let isSidebarOpen = $state(true);

    async function loadData() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            goto('/login');
            return;
        }
        user = session.user;

        // Fetch pages
        const res = await fetch('/api/pages', {
            headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (res.ok) pages = await res.json();
    }

    async function createPage() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch('/api/pages', {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.access_token}` }
        });
        
        if (res.ok) {
            const newPage = await res.json();
            pages = [newPage, ...pages]; // Update sidebar immediately
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
