<script lang="ts">
	import { page } from '$app/stores';
	import { Plus, FileText, Settings, LogOut, Search, ChevronsLeft, Menu } from 'lucide-svelte';

	// Props using Svelte 5 syntax
	// isOpen is 'bindable' so the parent can toggle it too if needed
	let { pages = [], user = null, isOpen = $bindable(true), onCreatePage, onLogout } = $props();

	function toggle() {
		isOpen = !isOpen;
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
		<button class="menu-item">
			<Search size={16} />
			<span>Search</span>
		</button>
		<button class="menu-item">
			<Settings size={16} />
			<span>Settings</span>
		</button>
	</div>

	<div class="sidebar-section">
		<div class="section-header">
			<span>Private</span>
			<button class="add-btn" onclick={onCreatePage} title="Create new page">
				<Plus size={14} />
			</button>
		</div>

		<div class="page-list">
			{#if pages.length === 0}
				<div class="empty-msg">No pages yet</div>
			{/if}

			{#each pages as p}
				<a href="/p/{p.id}" class="page-item" class:active={$page.url.pathname === `/p/${p.id}`}>
					{#if p.icon}
						<span class="emoji-icon">{p.icon}</span>
					{:else}
						<FileText size={16} class="muted-icon" />
					{/if}

					<span class="page-title truncate">{p.title || 'Untitled'}</span>
				</a>
			{/each}
		</div>
	</div>

	<div class="sidebar-footer">
		<button class="menu-item" onclick={onLogout}>
			<LogOut size={16} />
			<span>Log out</span>
		</button>
	</div>
</aside>

{#if !isOpen}
	<div class="mobile-toggle">
		<button class="icon-btn" onclick={toggle}>
			<Menu size={20} />
		</button>
	</div>
{/if}

<style>
	/* --- STRUCTURE --- */
	.sidebar {
		width: 240px;
		height: 100vh;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;

		/* THEME ADAPTATION */
		/* Use a slightly darkened/mixed version of the bg for contrast */
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

	/* --- HEADER --- */
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
	.collapse-btn:hover {
		opacity: 1 !important;
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
		opacity: 0; /* Hidden by default, shown on hover */
		transition: opacity 0.2s;
	}

	/* --- MENU ITEMS --- */
	.sidebar-menu {
		padding: 4px 0;
		margin-bottom: 12px;
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

	/* --- PAGE LIST SECTION --- */
	.sidebar-section {
		flex: 1;
		overflow-y: auto;
		padding-bottom: 20px;
	}

	.section-header {
		padding: 8px 16px 4px 16px;
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

	.page-list {
		display: flex;
		flex-direction: column;
	}

	.page-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 16px;
		text-decoration: none;

		color: var(--color-text);
		font-size: var(--text-small);
		opacity: 0.75;
		border-left: 3px solid transparent; /* Marker for active state */
	}

	.page-item:hover {
		background: color-mix(in srgb, var(--color-text), transparent 96%);
		opacity: 1;
	}

	.page-item.active {
		background: color-mix(in srgb, var(--color-primary), transparent 92%);
		color: var(--color-primary); /* Highlight text */
		opacity: 1;
		font-weight: var(--font-weight-bold);
		border-left-color: var(--color-primary);
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
	.empty-msg {
		padding: 0 16px;
		font-size: 0.8rem;
		opacity: 0.4;
		font-style: italic;
	}

	/* --- FOOTER --- */
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

	/* Floating Toggle Button (when closed) */
	.mobile-toggle {
		position: absolute;
		top: 12px;
		left: 12px;
		z-index: 50;
	}
</style>
