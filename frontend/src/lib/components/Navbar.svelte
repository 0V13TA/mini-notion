<script lang="ts">
    import { Slash, MoreHorizontal, Star, Share } from 'lucide-svelte';

    // Props: We pass the page details down to this navbar
    let { title = 'Untitled', icon = null, isFavorite = false } = $props();
</script>

<nav class="navbar">
    <div class="left-section">
        <div class="breadcrumb-item">
            <span class="workspace-name">My Workspace</span>
        </div>
        
        <span class="separator">
            <Slash size={14} />
        </span>

        <div class="breadcrumb-item page-item">
            {#if icon}
                <span class="page-icon">{icon}</span>
            {:else}
                <span class="default-icon">📄</span>
            {/if}
            <span class="page-title truncate">{title}</span>
        </div>
    </div>

    <div class="right-section">
        <span class="last-edited">Edited just now</span>

        <button class="nav-btn" title="Share">
            <Share size={16} />
            <span class="btn-text">Share</span>
        </button>

        <button class="nav-btn icon-only" title="Favorite">
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
        
        /* THEME: Use global background and font */
        background: var(--color-bg);
        color: var(--color-text);
        font-family: var(--font-main);
        
        z-index: 10;
        /* Subtle border at bottom for definition */
        border-bottom: 1px solid color-mix(in srgb, var(--color-text), transparent 95%);
    }

    /* Left Side: Breadcrumbs */
    .left-section {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: var(--text-small);
        color: var(--color-text);
        overflow: hidden;
    }

    .breadcrumb-item {
        display: flex;
        align-items: center;
        padding: 4px 6px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        opacity: 0.8; /* Slightly muted by default */
    }
    
    .breadcrumb-item:hover {
        opacity: 1;
        /* THEME: Use a transparent primary color for hover */
        background: color-mix(in srgb, var(--color-primary), transparent 90%);
    }

    .workspace-name {
        /* Optional: Underline style */
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

    .page-icon, .default-icon {
        margin-right: 6px;
        font-size: 1.1em;
        line-height: 1;
    }

    .page-title {
        font-weight: var(--font-weight-bold);
        max-width: 200px;
    }

    /* Right Side: Actions */
    .right-section {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .last-edited {
        font-size: 0.7rem; /* Smaller than normal text */
        color: var(--color-text);
        opacity: 0.5;
        margin-right: 8px;
        display: none; 
    }
    @media (min-width: 600px) {
        .last-edited { display: block; }
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
        
        /* THEME: Text Color */
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

    /* THEME: Filled Star uses Accent Color */
    :global(.filled) {
        fill: var(--color-accent);
        color: var(--color-accent);
        filter: drop-shadow(0 0 2px var(--color-accent));
    }
</style>
