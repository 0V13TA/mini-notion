<script lang="ts">
	import { uploadUserAvatar, initProfile, supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let username = $state('');
	let files: FileList | null = $state(null);
	let previewUrl: string | null = $state(null);
	// NEW: State to hold the Google avatar
	let initialAvatar: string | null = $state(null);

	let loading = $state(false);
	let errorMessage = $state('');

	// Handle file preview (local upload)
	$effect(() => {
		if (files && files.length > 0) {
			previewUrl = URL.createObjectURL(files[0]);
		} else {
			previewUrl = null;
		}
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	});

	onMount(async () => {
		// 1. Check Session
		const {
			data: { session }
		} = await supabase.auth.getSession();
		if (!session) {
			goto('/login');
			return;
		}

		// 2. NEW: Check if Profile Already Exists
		const { data: profile } = await supabase
			.from('profiles')
			.select('username')
			.eq('id', session.user.id)
			.single();

		// If they already have a profile, kick them to the dashboard
		if (profile) {
			goto('/');
			return;
		}

		// 3. Prefill Logic (Only runs if they DON'T have a profile)
		const metadata = session.user.user_metadata;
		if (metadata?.avatar_url || metadata?.picture) {
			initialAvatar = metadata.avatar_url || metadata.picture;
		}
		if (metadata?.full_name) {
			username = metadata.full_name.replace(/\s+/g, '').toLowerCase();
		}
	});

	async function handleSetup(event: Event) {
		event.preventDefault();
		loading = true;
		errorMessage = '';

		try {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (!user) throw new Error('Not authenticated');

			let finalAvatarUrl = initialAvatar; // Default to Google image

			// 1. If user picked a NEW file, upload it and use that instead
			if (files && files.length > 0) {
				finalAvatarUrl = await uploadUserAvatar(user.id, files[0]);
			}

			// 2. Initialize Profile with the chosen URL
			await initProfile(username, finalAvatarUrl || undefined);

			goto('/');
		} catch (error: any) {
			console.error(error);
			errorMessage = error.message || 'Setup failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="page-container">
	<div class="auth-card">
		<div class="header">
			<h2>Welcome!</h2>
			<p>Step 2 of 2: Set up your profile</p>
		</div>

		<form onsubmit={handleSetup}>
			<div class="form-group">
				<label for="username">Choose a Username</label>
				<input id="username" type="text" placeholder="johndoe" required bind:value={username} />
			</div>

			<div class="form-group">
				<label for="avatar">Profile Picture</label>

				{#if previewUrl || initialAvatar}
					<div class="image-preview-container">
						<img src={previewUrl || initialAvatar} alt="Avatar preview" class="image-preview" />
					</div>
				{/if}

				<input id="avatar" type="file" accept="image/png, image/jpeg, image/gif" bind:files />
				{#if initialAvatar && !files}
					<p class="hint">Using your Google profile picture. Upload to change it.</p>
				{/if}
			</div>

			{#if errorMessage}
				<div class="error-message">{errorMessage}</div>
			{/if}

			<button type="submit" disabled={loading}>
				{loading ? 'Setting up...' : 'Finish'}
			</button>
		</form>
	</div>
</div>

<style>
	/* ... existing styles ... */
	.hint {
		font-size: 0.8rem;
		color: var(--color-text);
		opacity: 0.7;
		margin-top: 0.5rem;
		text-align: center;
	}
	/* Add your other styles from previous files here */
	.page-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-bg);
		color: var(--color-text);
		font-family: var(--font-main);
		padding: 1rem;
	}

	.auth-card {
		width: 100%;
		max-width: 420px;
		padding: 2.5rem;
		border: 3px solid var(--color-secondary);
		border-radius: 12px;
		background-color: var(--color-bg);
		box-shadow: 8px 8px 0px var(--color-secondary);
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
	}
	.header h2 {
		font-size: var(--text-h2);
		color: var(--color-primary);
		margin-bottom: 0.5rem;
	}
	.header p {
		opacity: 0.7;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	label {
		font-weight: var(--font-weight-bold);
		font-size: 0.9rem;
	}

	input {
		padding: 0.75rem;
		border: 3px solid var(--color-text);
		border-radius: 8px;
		background: transparent;
		color: var(--color-text);
		font-size: 1rem;
		outline: none;
	}

	input:focus {
		border-color: var(--color-primary);
		box-shadow:
			0 0 0 3px var(--color-bg),
			0 0 0 6px var(--color-primary);
	}

	input[type='file'] {
		border: 3px dashed var(--color-secondary);
		padding: 1rem;
		cursor: pointer;
	}

	.image-preview-container {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}
	.image-preview {
		width: 100px;
		height: 100px;
		object-fit: cover;
		border-radius: 50%;
		border: 4px solid var(--color-primary);
		box-shadow: 4px 4px 0px var(--color-secondary);
	}

	.error-message {
		color: #ef4444;
		background-color: rgba(239, 68, 68, 0.1);
		padding: 0.75rem;
		border-radius: 6px;
		font-size: 0.9rem;
		margin-bottom: 1rem;
		text-align: center;
		border: 2px solid #ef4444;
	}

	button {
		width: 100%;
		padding: 1rem;
		background-color: var(--color-primary);
		color: var(--color-bg);
		border: 3px solid transparent;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: var(--font-weight-bold);
		cursor: pointer;
		box-shadow: 4px 4px 0px var(--color-text);
		transition: all 0.2s;
	}

	button:hover:not(:disabled) {
		transform: translate(-2px, -2px);
		box-shadow: 6px 6px 0px var(--color-text);
	}

	button:disabled {
		opacity: 0.5;
		box-shadow: none;
		cursor: not-allowed;
	}
</style>
