<script lang="ts">
	import { onMount } from 'svelte';
	import type { BlockType } from '$lib/types';

	let { block = $bindable(), onEnter, onUpdate, onDelete } = $props();

	// State for the Slash Menu
	let showCommandMenu = $state(false);
	let element: HTMLDivElement;

	onMount(() => {
		if (block.content === '') {
			element?.focus();
		}
	});

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === '/') {
			showCommandMenu = true;
		}

		if (e.key === 'Enter' && !e.shiftKey && !showCommandMenu) {
			e.preventDefault();
			onEnter();
		}

		if (e.key === 'Backspace' && block.content === '') {
			// Optional: logic to delete block if empty (handled by parent usually)
		}

		if (e.key === 'Backspace') {
			if (block.content === '') {
				e.preventDefault();
				onDelete(true); // true = backspace (go to previous)
			}
		}

		if (e.key === 'Delete') {
			if (block.content === '') {
				e.preventDefault();
				onDelete(false); // false = delete (pull next or stay)
			}
		}

		if (e.key === 'Escape') {
			showCommandMenu = false;
		}
	}

	function handleInput(e: Event) {
		// One-way bind to avoid cursor jumping
		block.content = (e.currentTarget as HTMLElement).innerText;
		onUpdate();
	}

	// Helper to safely update block type
	function setType(type: BlockType['type'], props: BlockType['properties'] = {}) {
		block.type = type;
		block.properties = { ...block.properties, ...props };
		showCommandMenu = false;
		onUpdate();
		// Refocus the element after change
		setTimeout(() => element?.focus(), 0);
	}
</script>

<div class="block-wrapper" class:todo-block={block.type === 'todo'}>
	{#if block.type === 'todo'}
		<input
			type="checkbox"
			checked={block.properties?.checked || false}
			onchange={(e) => {
				block.properties = { ...block.properties, checked: e.currentTarget.checked };
				onUpdate();
			}}
		/>
	{/if}

	<div
		bind:this={element}
		bind:textContent={block.content}
		contenteditable="true"
		role="textbox"
		tabindex="0"
		class="editor-node"
		class:h1={block.type === 'heading' && block.properties?.headingLevel === 1}
		class:h2={block.type === 'heading' && block.properties?.headingLevel === 2}
		class:h3={block.type === 'heading' && block.properties?.headingLevel === 3}
		class:bullet-list={block.type === 'list' && block.properties?.listType === 'bullet'}
		class:numbered-list={block.type === 'list' && block.properties?.listType === 'numbered'}
		class:todo-text={block.type === 'todo'}
		class:paragraph={block.type === 'paragraph'}
		data-placeholder="Type '/' for commands"
		oninput={handleInput}
		onkeydown={handleKeyDown}
	>
		{block.content}
	</div>

	{#if showCommandMenu}
		<div class="slash-menu" contenteditable="false">
			<div class="menu-title">Basic Blocks</div>
			<button onclick={() => setType('heading', { headingLevel: 1 })}> Heading 1 </button>
			<button onclick={() => setType('heading', { headingLevel: 2 })}> Heading 2 </button>
			<button onclick={() => setType('heading', { headingLevel: 3 })}> Heading 3 </button>
			<button onclick={() => setType('list', { listType: 'bullet' })}> Bulleted List </button>
			<button onclick={() => setType('list', { listType: 'numbered' })}> Numbered List </button>
			<button onclick={() => setType('todo')}> To-do List </button>
			<button onclick={() => setType('paragraph')}> Paragraph </button>
		</div>
	{/if}
</div>

<style>
	.block-wrapper {
		position: relative;
		display: flex;
		align-items: flex-start; /* Align checkbox with text top */
		margin: 2px 0;
	}

	.editor-node {
		outline: none;
		padding: 3px 2px;
		min-height: 1.5em;
		width: 100%;
		line-height: 1.5;
		empty-cells: show; /* Helps with empty states */
	}

	/* Empty state placeholder */
	.paragraph:empty::before {
		content: attr(data-placeholder);
		color: #999;
		pointer-events: none;
		float: left; /* Ensures it doesn't block clicks */
	}

	/* TYPOGRAPHY */
	.h1 {
		font-size: 1.8em;
		font-weight: 700;
		margin-top: 0.5em;
	}
	.h2 {
		font-size: 1.4em;
		font-weight: 600;
		margin-top: 0.4em;
	}
	.h3 {
		font-size: 1.2em;
		font-weight: 600;
		margin-top: 0.3em;
	}

	/* LISTS */
	.bullet-list {
		display: list-item;
		list-style-type: disc;
		margin-left: 1.5em;
	}
	.numbered-list {
		display: list-item;
		list-style-type: decimal;
		margin-left: 1.5em;
	}

	/* TODO */
	.todo-block {
		gap: 8px;
	}
	.todo-block input {
		margin-top: 6px;
		cursor: pointer;
	}
	.todo-text {
		text-decoration: none;
	}

	/* SLASH MENU */
	.slash-menu {
		position: absolute;
		top: 100%;
		left: 0;
		width: 200px;
		background: var(--color-bg, white);
		border: 1px solid #ddd;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border-radius: 6px;
		z-index: 50;
		display: flex;
		flex-direction: column;
		padding: 4px;
		max-height: 300px;
		overflow-y: auto;
	}
	.menu-title {
		font-size: 0.75rem;
		color: #888;
		padding: 4px 8px;
		font-weight: 600;
		text-transform: uppercase;
	}
	.slash-menu button {
		background: none;
		border: none;
		text-align: left;
		padding: 8px 12px;
		font-size: 0.9rem;
		cursor: pointer;
		border-radius: 4px;
		color: var(--color-text, black);
	}
	.slash-menu button:hover {
		background: rgba(0, 0, 0, 0.05);
	}
</style>
