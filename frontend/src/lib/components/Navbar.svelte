<script lang="ts">
	import { Slash, MoreHorizontal, Star, Share, Menu } from 'lucide-svelte';
	import { getContext } from 'svelte';

	// Added 'onToggleFavorite' to props
	let { title = 'Untitled', icon = null, isFavorite = false, onToggleFavorite } = $props();

	// Updated to use the new 'appState' context key
	const appState = getContext<any>('appState');
</script>

<nav class="navbar">
	<div class="left-section">
		{#if !appState.isOpen}
			<button
				class="nav-btn icon-only menu-btn"
				onclick={appState.toggleSidebar}
				title="Open sidebar"
			>
				<Menu size={18} />
			</button>
		{/if}

		<div class="breadcrumb-item">
			<span class="workspace-name">My Workspace</span>
		</div>

		<span class="separator"><Slash size={14} /></span>

		<div class="breadcrumb-item page-item">
			{#if icon}<span class="page-icon">{icon}</span>{:else}<span class="default-icon">📄</span
				>{/if}
			<span class="page-title truncate">{title}</span>
		</div>
	</div>

	<div class="right-section">
		<span class="last-edited">Edited just now</span>

		<button class="nav-btn" title="Share">
			<Share size={16} />
			<span class="btn-text">Share</span>
		</button>

		<button class="nav-btn icon-only" title="Favorite" onclick={onToggleFavorite}>
			<Star size={16} class={isFavorite ? 'filled' : ''} />
		</button>

		<button class="nav-btn icon-only" title="More options">
			<MoreHorizontal size={16} />
		</button>
	</div>
</nav>

<style>
	.navbar {
		height: 45px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 12px;
		position: sticky;
		top: 0;
		background: var(--color-bg);
		color: var(--color-text);
		font-family: var(--font-main);
		z-index: 10;
		border-bottom: 1px solid color-mix(in srgb, var(--color-text), transparent 95%);
	}

	.left-section {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: var(--text-small);
		color: var(--color-text);
		overflow: hidden;
	}

	/* Optional: Add spacing for the menu button */
	.menu-btn {
		margin-right: 4px;
	}

	.breadcrumb-item {
		display: flex;
		align-items: center;
		padding: 4px 6px;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		opacity: 0.8;
	}

	.breadcrumb-item:hover {
		opacity: 1;
		background: color-mix(in srgb, var(--color-primary), transparent 90%);
	}

	.workspace-name {
		border-bottom: 1px solid transparent;
	}
	.breadcrumb-item:hover .workspace-name {
		border-color: var(--color-text);
	}

	.separator {
		display: flex;
		align-items: center;
		opacity: 0.4;
		color: var(--color-text);
	}

	.page-icon,
	.default-icon {
		margin-right: 6px;
		font-size: 1.1em;
		line-height: 1;
	}

	.page-title {
		font-weight: var(--font-weight-bold);
		max-width: 200px;
	}

	.right-section {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.last-edited {
		font-size: 0.7rem;
		color: var(--color-text);
		opacity: 0.5;
		margin-right: 8px;
		display: none;
	}
	@media (min-width: 600px) {
		.last-edited {
			display: block;
		}
	}

	.nav-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		padding: 4px 8px;
		border-radius: 4px;
		cursor: pointer;
		color: var(--color-text);
		font-family: var(--font-main);
		font-size: var(--text-small);
		opacity: 0.8;
		transition: all 0.2s;
	}

	.nav-btn:hover {
		opacity: 1;
		background: color-mix(in srgb, var(--color-primary), transparent 90%);
	}

	.nav-btn.icon-only {
		padding: 6px;
	}

	.truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.filled) {
		fill: var(--color-accent);
		color: var(--color-accent);
		filter: drop-shadow(0 0 2px var(--color-accent));
	}
</style>
