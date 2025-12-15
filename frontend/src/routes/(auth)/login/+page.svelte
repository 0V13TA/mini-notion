<script lang="ts">
	import { signInLocal, signInWithGoogle } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let errorMessage = $state('');

	async function handleLogin(event: Event) {
		event.preventDefault();
		loading = true;
		errorMessage = '';

		const { error } = await signInLocal(email, password);

		if (error) {
			errorMessage = error.message;
			loading = false;
		} else {
			goto('/');
		}
	}

	async function handleGoogleLogin() {
		try {
			await signInWithGoogle();
		} catch (error) {
			errorMessage = 'Error logging in with Google ' + error;
		}
	}
</script>

<div class="page-container">
	<div class="auth-card">
		<div class="header">
			<h2>Welcome Back</h2>
			<p>Sign in to your workspace</p>
		</div>

		<form onsubmit={handleLogin}>
			<div class="form-group">
				<label for="email">Email</label>
				<input id="email" type="email" placeholder="john@example.com" required bind:value={email} />
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					placeholder="••••••••"
					required
					bind:value={password}
				/>
			</div>

			{#if errorMessage}
				<div class="error-message">
					{errorMessage}
				</div>
			{/if}

			<button type="submit" disabled={loading}>
				{loading ? 'Signing in...' : 'Sign In'}
			</button>
		</form>

		<div class="divider">
			<span>or</span>
		</div>

		<button type="button" class="secondary-btn" onclick={handleGoogleLogin}>
			Sign in with Google
		</button>

		<div class="footer-link">
			<p>Don't have an account? <a href="/signup">Create one</a></p>
		</div>
	</div>
</div>

<style>
	/* Using the same theme variables for consistency */
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
		max-width: 400px;
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
		margin: 0 0 0.5rem 0;
	}

	.header p {
		font-size: var(--text-small);
		opacity: 0.8;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	label {
		font-size: 0.9rem;
		font-weight: var(--font-weight-bold);
		color: var(--color-text);
	}

	input {
		padding: 0.75rem;
		border: 3px solid var(--color-text);
		border-radius: 8px;
		background: transparent;
		color: var(--color-text);
		font-family: inherit;
		font-size: 1rem;
		outline: none;
		transition: all 0.2s;
	}

	input:focus {
		border-color: var(--color-primary);
		box-shadow:
			0 0 0 3px var(--color-bg),
			0 0 0 6px var(--color-primary);
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
		transition: all 0.2s;
		box-shadow: 4px 4px 0px var(--color-text);
	}

	button:hover:not(:disabled) {
		transform: translate(-2px, -2px);
		box-shadow: 6px 6px 0px var(--color-text);
		filter: brightness(1.1);
	}

	button:active:not(:disabled) {
		transform: translate(2px, 2px);
		box-shadow: 2px 2px 0px var(--color-text);
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		box-shadow: none;
	}

	/* Secondary Button (Google) */
	.secondary-btn {
		background-color: transparent;
		color: var(--color-text);
		border: 3px solid var(--color-text);
		box-shadow: none;
	}

	.secondary-btn:hover:not(:disabled) {
		background-color: rgba(var(--color-text-rgb), 0.05);
		box-shadow: none;
		transform: none;
	}

	.divider {
		display: flex;
		align-items: center;
		text-align: center;
		margin: 1.5rem 0;
		color: var(--color-text);
		opacity: 0.6;
		font-size: 0.8rem;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		border-bottom: 2px solid var(--color-text);
	}

	.divider span {
		padding: 0 10px;
		font-weight: bold;
		text-transform: uppercase;
	}

	.error-message {
		color: #ef4444;
		background-color: rgba(239, 68, 68, 0.1);
		padding: 0.75rem;
		border-radius: 6px;
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
		text-align: center;
		border: 2px solid #ef4444;
	}

	.footer-link {
		margin-top: 1.5rem;
		text-align: center;
		font-size: 0.9rem;
	}

	.footer-link a {
		color: var(--color-primary);
		font-weight: bold;
		text-decoration: none;
	}

	.footer-link a:hover {
		text-decoration: underline;
	}
</style>
