<script lang="ts">
	import { signUpLocal, signInWithGoogle } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	let loading = $state(false);
	let errorMessage = $state('');

	// --- Password Validation Logic ($derived runes) ---
	const specialChars = /[!@#$%^&*(),.?":{}|<>]/;

	let hasMinLength = $derived(password.length >= 8);
	let hasUpper = $derived(/[A-Z]/.test(password));
	let hasLower = $derived(/[a-z]/.test(password));
	let hasSpecial = $derived(specialChars.test(password));
	let passwordsMatch = $derived(confirmPassword ? password === confirmPassword : true);

	let isPasswordValid = $derived(hasMinLength && hasUpper && hasLower && hasSpecial);

	async function handleSignup(event: Event) {
		event.preventDefault();
		loading = true;
		errorMessage = '';

		if (!isPasswordValid) {
			errorMessage = 'Please meet all password requirements below.';
			loading = false;
			return;
		}

		if (password !== confirmPassword) {
			errorMessage = 'Passwords do not match.';
			loading = false;
			return;
		}

		const result = await signUpLocal(email, password);

		if (result?.error) {
			errorMessage = result.error.message || 'Signup failed';
		} else {
			goto('/');
		}
		loading = false;
	}

	async function handleGoogleSignup() {
		try {
			await signInWithGoogle();
		} catch (error) {
			errorMessage = 'Error signing up with Google ' + error;
		}
	}
</script>

<div class="page-container">
	<div class="signup-card">
		<div class="header">
			<h2>Create Account</h2>
			<p>Join Mini-Notion today</p>
		</div>

		<form onsubmit={handleSignup}>
			<div class="form-group">
				<label for="email">Email</label>
				<input id="email" type="email" placeholder="john@example.com" required bind:value={email} />
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					required
					bind:value={password}
					class:invalid-input={password.length > 0 && !isPasswordValid}
				/>

				<div class="password-requirements">
					<p>Password must contain:</p>
					<ul>
						<li class:valid={hasMinLength}>At least 8 characters</li>
						<li class:valid={hasUpper}>One uppercase letter</li>
						<li class:valid={hasLower}>One lowercase letter</li>
						<li class:valid={hasSpecial}>One special character (!@#$%...)</li>
					</ul>
				</div>
			</div>

			<div class="form-group">
				<label for="confirmPassword">Confirm Password</label>
				<input
					id="confirmPassword"
					type="password"
					required
					bind:value={confirmPassword}
					class:invalid-input={confirmPassword.length > 0 && !passwordsMatch}
				/>
				{#if confirmPassword.length > 0 && !passwordsMatch}
					<span class="field-error">Passwords do not match</span>
				{/if}
			</div>

			{#if errorMessage}
				<div class="error-message">
					{errorMessage}
				</div>
			{/if}

			<button type="submit" disabled={loading || !isPasswordValid || !passwordsMatch}>
				{loading ? 'Creating Account...' : 'Sign Up'}
			</button>
		</form>

		<div class="divider">
			<span>or</span>
		</div>

		<button type="button" class="secondary-btn" onclick={handleGoogleSignup}>
			Sign up with Google
		</button>

		<div class="footer-link">
			<p>Already have an account? <a href="/login">Log in</a></p>
		</div>
	</div>
</div>

<style>
	.page-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-bg);
		color: var(--color-text);
		font-family: var(--font-main);
		transition:
			background-color 0.3s ease,
			color 0.3s ease;
		padding: 1rem;
	}

	.signup-card {
		width: 100%;
		max-width: 420px;
		padding: 2rem;
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
		margin-bottom: 1.25rem;
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
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	input:focus {
		border-color: var(--color-primary);
		box-shadow:
			0 0 0 3px var(--color-bg),
			0 0 0 6px var(--color-primary);
	}

	input.invalid-input {
		border-color: #ef4444;
	}
	input.invalid-input:focus {
		box-shadow:
			0 0 0 3px var(--color-bg),
			0 0 0 6px #ef4444;
	}

	.password-requirements {
		margin-top: 0.5rem;
		font-size: 0.8rem;
		background-color: rgba(var(--color-secondary-rgb), 0.1);
		padding: 0.75rem;
		border-radius: 8px;
		border: 2px solid var(--color-secondary);
	}

	.password-requirements p {
		font-weight: bold;
		margin-bottom: 0.25rem;
	}

	.password-requirements ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.password-requirements li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--color-text);
		opacity: 0.7;
		transition: all 0.2s ease;
	}

	.password-requirements li::before {
		content: '○';
		display: inline-block;
		width: 14px;
		font-weight: bold;
	}

	.password-requirements li.valid {
		color: var(--color-primary);
		opacity: 1;
		font-weight: var(--font-weight-bold);
	}

	.password-requirements li.valid::before {
		content: '✓';
		color: var(--color-primary);
	}

	.field-error {
		font-size: 0.8rem;
		color: #ef4444;
		font-weight: bold;
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

	/* Secondary Button for Google */
	.secondary-btn {
		background-color: transparent;
		color: var(--color-text);
		border: 3px solid var(--color-text);
		box-shadow: none;
		margin-top: 0; /* remove margin top if handled by layout */
	}

	.secondary-btn:hover:not(:disabled) {
		background-color: rgba(var(--color-text-rgb), 0.05);
		box-shadow: none;
		transform: none;
		filter: brightness(0.9); /* slight dim */
	}

	/* Divider Styles */
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
