<script lang="ts">
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';
	import Navbar from '$lib/components/Navbar.svelte';
	import Block from '$lib/components/Block.svelte';
	import type { PageData, BlockType } from '$lib/types';

	// State
	let pageData = $state<PageData | null>(null);
	let loading = $state(true);
	let saveTimeout: NodeJS.Timeout;

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
		clearTimeout(saveTimeout);

		saveTimeout = setTimeout(async () => {
			// Get the session from Supabase
			const {
				data: { session }
			} = await supabase.auth.getSession();

			//Check if session and access_token actually exist
			if (!session?.access_token) {
				console.error('No active session found. Cannot save.');
				return;
			}

			if (pageData === null) {
				console.error('No page data to save.');
				return;
			}

			console.log('Saving with token...');
			await fetch(`/api/pages/${pageData.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					// This will now only fire if the token is present
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

	function addNewBlock(index: number) {
		if (!pageData) return;
		const currentBlock = pageData.content[index];

		// "Exit List" Logic: If inside a list/todo but it's empty, turn it into a paragraph
		if (
			(currentBlock.type === 'list' || currentBlock.type === 'todo') &&
			currentBlock.content.trim() === ''
		) {
			currentBlock.type = 'paragraph';
			delete currentBlock.properties;
			savePage();
			return;
		}

		// 2. Default to paragraph
		let newType: BlockType['type'] = 'paragraph';
		let newProperties: BlockType['properties'] = {};

		// 3. Logic: If current is a list or todo, copy that style
		if (currentBlock.type === 'list') {
			newType = 'list';
			newProperties = { listType: currentBlock.properties?.listType };
		} else if (currentBlock.type === 'todo') {
			newType = 'todo';
			newProperties = { checked: false }; // Always start new todos as unchecked
		}
		// Note: We deliberately don't copy 'heading' types, as hitting Enter after a title usually starts a paragraph.

		const newBlock: BlockType = {
			id: crypto.randomUUID(),
			type: newType,
			content: '',
			properties: newProperties
		};

		// 4. Insert after the current index
		pageData.content.splice(index + 1, 0, newBlock);

		// 5. Trigger save
		savePage();
	}
</script>

{#if loading}
	<div class="loading">Loading...</div>
{:else if pageData}
	<div class="editor-layout">
		<Navbar title={pageData.title} icon={pageData.icon} isFavorite={false} />

		<div class="scroller">
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
					{#if pageData.content}
						{#each pageData.content as block, i (block.id)}
							<Block
								bind:block={pageData.content[i]}
								onEnter={() => addNewBlock(i)}
								onUpdate={savePage}
							/>
						{/each}
					{/if}
				</div>
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
		overflow: hidden; /* FIX: Prevent the whole page from scrolling */
	}

	/* New Class: Handles scrolling for content only */
	.scroller {
		flex: 1; /* Takes up all remaining vertical space below Navbar */
		overflow-y: auto; /* Enables vertical scrolling */
		width: 100%;
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
