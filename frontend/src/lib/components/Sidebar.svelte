<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from '$lib/types';
	import {
		Plus,
		FileText,
		Settings,
		LogOut,
		Search,
		ChevronsLeft,
		MoreHorizontal,
		Star,
		Trash,
		Pencil
	} from 'lucide-svelte';

	// Props
	let {
		pages = [],
		user = null,
		session = null,
		isOpen = $bindable(true),
		onCreatePage,
		onLogout
	} = $props();

	// Derived State
	let favoritePages = $derived(pages.filter((p: PageData) => p.isFavorite));
	let privatePages = $derived(pages.filter((p: PageData) => !p.isFavorite));

	// UI State
	let activeMenuId = $state<string | null>(null);
	let renamingId = $state<string | null>(null);
	let renameValue = $state('');

	function toggle() {
		isOpen = !isOpen;
	}

	function getToken() {
		return session?.access_token ? `Bearer ${session.access_token}` : '';
	}

	async function handleRename(id: string) {
		const p = pages.find((p: PageData) => p.id === id);
		if (p) p.title = renameValue;
		renamingId = null;
		activeMenuId = null;
		await fetch(`/api/pages/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json', Authorization: getToken() },
			body: JSON.stringify({ title: renameValue })
		});
	}

	async function toggleFavorite(id: string, currentStatus: boolean) {
		activeMenuId = null;
		const p = pages.find((p: PageData) => p.id === id);
		if (p) p.isFavorite = !currentStatus;
		await fetch(`/api/pages/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json', Authorization: getToken() },
			body: JSON.stringify({ isFavorite: !currentStatus })
		});
	}

	async function deletePage(id: string) {
		if (!confirm('Are you sure?')) return;
		activeMenuId = null;
		const index = pages.findIndex((p: PageData) => p.id === id);
		if (index > -1) pages.splice(index, 1);
		await fetch(`/api/pages/${id}`, {
			method: 'DELETE',
			headers: { Authorization: getToken() }
		});
	}

	function startRename(p: PageData) {
		renamingId = p.id;
		renameValue = p.title || '';
		activeMenuId = null;
		setTimeout(() => document.getElementById(`rename-${p.id}`)?.focus(), 50);
	}
</script>

<aside class="sidebar" class:closed={!isOpen}>
	<div class="sidebar-header" onclick={toggle} role="button" tabindex="0">
		<div class="user-switcher">
			{#if user?.user_metadata?.avatar_url}
				<img src={user.user_metadata.avatar_url} alt="User" class="avatar-img" />
			{:else}
				<div class="avatar-placeholder">
					{user?.email?.[0].toUpperCase() || 'U'}
				</div>
			{/if}
			<span class="username truncate">
				{user?.user_metadata?.full_name || 'My Workspace'}
			</span>
		</div>
		<button
			class="icon-btn collapse-btn"
			onclick={(e) => {
				e.stopPropagation();
				toggle();
			}}
		>
			<ChevronsLeft size={18} />
		</button>
	</div>

	<div class="sidebar-menu">
		<button class="menu-item"><Search size={16} /> <span>Search</span></button>
		<button class="menu-item"><Settings size={16} /> <span>Settings</span></button>
	</div>

	<div class="scrolling-container">
		{#if favoritePages.length > 0}
			<div class="sidebar-section">
				<div class="section-header">Favorites</div>
				<div class="page-list">
					{#each favoritePages as p (p.id)}
						{@render pageItem(p)}
					{/each}
				</div>
			</div>
		{/if}

		<div class="sidebar-section">
			<div class="section-header">
				<span>Private</span>
				<button class="add-btn" onclick={onCreatePage}><Plus size={14} /></button>
			</div>
			<div class="page-list">
				{#each privatePages as p (p.id)}
					{@render pageItem(p)}
				{/each}
				{#if privatePages.length === 0 && favoritePages.length === 0}
					<div class="empty-msg">No pages created</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="sidebar-footer">
		<button class="menu-item" onclick={onLogout}>
			<LogOut size={16} /> <span>Log out</span>
		</button>
	</div>
</aside>

{#snippet pageItem(p: PageData)}
	<div class="page-item-wrapper">
		{#if renamingId === p.id}
			<input
				id="rename-{p.id}"
				class="rename-input"
				type="text"
				bind:value={renameValue}
				onkeydown={(e) => e.key === 'Enter' && handleRename(p.id)}
				onblur={() => handleRename(p.id)}
			/>
		{:else}
			<a href="/p/{p.id}" class="page-item" class:active={$page.url.pathname === `/p/${p.id}`}>
				{#if p.icon}
					<span class="emoji-icon">{p.icon}</span>
				{:else}
					<FileText size={16} class="muted-icon" />
				{/if}

				<span class="page-title truncate">
					{p.title || 'Untitled'}
				</span>
			</a>

			<button
				class="options-trigger"
				onclick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					activeMenuId = activeMenuId === p.id ? null : p.id;
				}}
			>
				<MoreHorizontal size={14} />
			</button>
		{/if}

		{#if activeMenuId === p.id}
			<div class="menu-overlay" onclick={() => (activeMenuId = null)} role="presentation"></div>
			<div class="context-menu">
				<button class="ctx-btn" onclick={() => toggleFavorite(p.id, p.isFavorite)}>
					<Star size={14} class={p.isFavorite ? 'filled' : ''} />
					{p.isFavorite ? 'Unfavorite' : 'Add to Favorites'}
				</button>
				<button class="ctx-btn" onclick={() => startRename(p)}>
					<Pencil size={14} /> Rename
				</button>
				<div class="divider"></div>
				<button class="ctx-btn delete" onclick={() => deletePage(p.id)}>
					<Trash size={14} /> Delete
				</button>
			</div>
		{/if}
	</div>
{/snippet}

<style>
	/* ... Copy the rest of your styles unchanged ... */
	/* Make sure to REMOVE styles for .mobile-toggle if present */
	.sidebar {
		width: 240px;
		height: 100vh;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		background: color-mix(in srgb, var(--color-bg), var(--color-text) 3%);
		color: var(--color-text);
		font-family: var(--font-main);
		border-right: 1px solid color-mix(in srgb, var(--color-text), transparent 92%);
		transition:
			width 0.3s cubic-bezier(0.25, 1, 0.5, 1),
			opacity 0.2s;
		overflow: hidden;
		position: relative;
	}
	.sidebar.closed {
		width: 0;
		opacity: 0;
		border: none;
	}

	.scrolling-container {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.sidebar-header {
		height: 45px;
		padding: 0 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		transition: background 0.2s;
	}
	.sidebar-header:hover {
		background: color-mix(in srgb, var(--color-text), transparent 95%);
	}
	.sidebar-header:hover .collapse-btn {
		opacity: 0.5;
	}

	.user-switcher {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: var(--text-small);
		font-weight: var(--font-weight-bold);
		overflow: hidden;
	}
	.avatar-placeholder {
		width: 20px;
		height: 20px;
		background: var(--color-primary);
		color: var(--color-bg);
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
	}
	.avatar-img {
		width: 20px;
		height: 20px;
		border-radius: 4px;
		object-fit: cover;
	}
	.collapse-btn {
		opacity: 0;
		transition: opacity 0.2s;
	}
	.collapse-btn:hover {
		opacity: 1 !important;
	}

	.sidebar-menu {
		padding: 4px 0;
		margin-bottom: 4px;
	}
	.menu-item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 6px 16px;
		border: none;
		background: none;
		color: var(--color-text);
		opacity: 0.7;
		font-family: var(--font-main);
		font-size: var(--text-small);
		cursor: pointer;
		transition: background 0.1s;
	}
	.menu-item:hover {
		background: color-mix(in srgb, var(--color-text), transparent 95%);
		opacity: 1;
	}

	.sidebar-section {
		padding-bottom: 8px;
	}
	.section-header {
		padding: 6px 16px 4px 16px;
		font-size: 0.75rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-text);
		opacity: 0.5;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.add-btn {
		background: none;
		border: none;
		padding: 2px;
		color: inherit;
		cursor: pointer;
		opacity: 0;
		border-radius: 4px;
		transition: all 0.2s;
	}
	.section-header:hover .add-btn {
		opacity: 1;
	}
	.add-btn:hover {
		background: color-mix(in srgb, var(--color-text), transparent 90%);
	}
	.empty-msg {
		padding: 0 16px;
		font-size: 0.8rem;
		opacity: 0.4;
		font-style: italic;
		margin-top: 4px;
	}

	.page-list {
		display: flex;
		flex-direction: column;
	}
	.page-item-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}
	.page-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 16px;
		padding-right: 28px;
		text-decoration: none;
		flex: 1;
		color: var(--color-text);
		font-size: var(--text-small);
		opacity: 0.75;
		border-left: 3px solid transparent;
	}
	.page-item:hover {
		background: color-mix(in srgb, var(--color-text), transparent 96%);
		opacity: 1;
	}
	.page-item.active {
		background: color-mix(in srgb, var(--color-primary), transparent 92%);
		color: var(--color-primary);
		opacity: 1;
		font-weight: var(--font-weight-bold);
		border-left-color: var(--color-primary);
	}

	.options-trigger {
		position: absolute;
		right: 8px;
		background: none;
		border: none;
		color: var(--color-text);
		opacity: 0;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		display: flex;
		align-items: center;
	}
	.page-item-wrapper:hover .options-trigger,
	.options-trigger:focus {
		opacity: 0.6;
	}
	.options-trigger:hover {
		background: rgba(0, 0, 0, 0.05);
		opacity: 1 !important;
	}

	.context-menu {
		position: absolute;
		top: 28px;
		right: 10px;
		background: var(--color-bg);
		border: 1px solid rgba(0, 0, 0, 0.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border-radius: 6px;
		padding: 4px;
		z-index: 100;
		min-width: 160px;
		display: flex;
		flex-direction: column;
	}
	.menu-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 99;
		cursor: default;
	}
	.ctx-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		border: none;
		background: none;
		font-size: 0.85rem;
		color: var(--color-text);
		cursor: pointer;
		border-radius: 4px;
		text-align: left;
	}
	.ctx-btn:hover {
		background: rgba(0, 0, 0, 0.05);
	}
	.ctx-btn.delete:hover {
		background: #ffebeb;
		color: #d32f2f;
	}
	.divider {
		height: 1px;
		background: rgba(0, 0, 0, 0.1);
		margin: 4px 0;
	}
	.rename-input {
		flex: 1;
		margin: 4px 8px;
		padding: 2px 6px;
		border: 1px solid var(--color-primary);
		border-radius: 3px;
		font-size: var(--text-small);
		background: var(--color-bg);
		color: var(--color-text);
		outline: none;
	}

	.sidebar-footer {
		border-top: 1px solid color-mix(in srgb, var(--color-text), transparent 95%);
		padding: 8px 0;
	}
	.truncate {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.icon-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text);
		opacity: 0.6;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.muted-icon {
		opacity: 0.7;
	}
	.emoji-icon {
		font-size: 1.1em;
		width: 16px;
		text-align: center;
		line-height: 1;
	}
	:global(.filled) {
		fill: var(--color-accent);
		color: var(--color-accent);
		opacity: 1;
	}
</style>
