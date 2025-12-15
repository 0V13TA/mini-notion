<script lang="ts">
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';
	import Navbar from '$lib/components/Navbar.svelte';

	// State
	let pageData = $state<any>(null);
	let loading = $state(true);
	let saveTimeout: any;

	// Reactive ID: Refetch when URL changes (e.g. clicking a different sidebar link)
	$effect(() => {
		if ($page.params.id) {
			loadPage($page.params.id);
		}
	});

	async function loadPage(id: string) {
		loading = true;
		const {
			data: { session }
		} = await supabase.auth.getSession();
		if (!session) return;

		const res = await fetch(`/api/pages/${id}`, {
			headers: { Authorization: `Bearer ${session.access_token}` }
		});

		if (res.ok) {
			pageData = await res.json();
		} else {
			console.error('Page not found');
		}
		loading = false;
	}

	// Auto-Save Function (Debounced)
	async function savePage() {
		if (!pageData) return;

		// Clear pending save to avoid double-firing
		clearTimeout(saveTimeout);

		// Wait 1 second after typing stops, then save
		saveTimeout = setTimeout(async () => {
			const {
				data: { session }
			} = await supabase.auth.getSession();
			if (!session) return;

			console.log('Saving...'); // Debugging log
			await fetch(`/api/pages/${pageData.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session.access_token}`
				},
				body: JSON.stringify({
					title: pageData.title,
					icon: pageData.icon,
					content: pageData.content
				})
			});
			console.log('Saved!');
		}, 1000);
	}
</script>

{#if loading}
	<div class="loading">Loading...</div>
{:else if pageData}
	<div class="editor-layout">
		<Navbar title={pageData.title} icon={pageData.icon} isFavorite={false} />

		<div class="editor-content">
			<div class="cover-placeholder"></div>

			<div class="title-section">
				{#if pageData.icon}
					<div class="page-icon">{pageData.icon}</div>
				{/if}
				<input
					type="text"
					class="title-input"
					placeholder="Untitled"
					bind:value={pageData.title}
					oninput={savePage}
				/>
			</div>

			<div class="blocks-area">
				<p style="color: #999; font-style: italic;">(Blocks editor coming next...)</p>
				<pre>{JSON.stringify(pageData.content, null, 2)}</pre>
			</div>
		</div>
	</div>
{:else}
	<div class="error">Page not found</div>
{/if}

<style>
	.editor-layout {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: var(--color-bg);
		overflow-y: auto; /* Scroll the whole page */
	}

	.editor-content {
		max-width: 900px; /* Standard Notion width */
		width: 100%;
		margin: 0 auto;
		padding: 0 96px 30vh 96px; /* Bottom padding allows scrolling past end */
		display: flex;
		flex-direction: column;
	}

	.cover-placeholder {
		height: 10vh;
		width: 100%;
	}

	.title-section {
		margin-top: 20px;
		margin-bottom: 20px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.page-icon {
		font-size: 78px;
		margin-left: -4px;
	}

	.title-input {
		font-size: var(--text-h1); /* Huge Notion Title */
		font-weight: var(--font-weight-bold);
		border: none;
		background: none;
		outline: none;
		width: 100%;
		color: var(--color-text);
		padding: 0;
	}
	.title-input::placeholder {
		color: var(--color-text);
		opacity: 0.2;
	}

	.loading,
	.error {
		padding: 40px;
		text-align: center;
		color: var(--color-text);
		opacity: 0.5;
	}
</style>
