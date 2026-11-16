/**
 * The sign-in / sign-up card. Both pages share it; `mode` picks the texts,
 * the fields and the endpoint. After success it goes to `?next=` (sign-in)
 * or onboarding (sign-up, to add the first website).
 */

import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useLoginMutation, useSignupMutation } from './api';
import { OwlMark } from '@/components/layout/Brand';
import ErrorNotice from '@/components/layout/ErrorNotice';
import { Button } from '@/components/ui/button';

/** Same rule as the API (internal/auth): 10 to 200 characters. */
const MIN_PASSWORD = 10;

const TEXT = {
  login: { kicker: 'WELCOME BACK', title: 'Good to see you.', intro: 'Sign in to see what’s happening on your website.', submit: 'Sign in' },
  signup: {
    kicker: 'A SAFER WEBSITE STARTS HERE',
    title: 'Create your account',
    intro: 'Start with one website, free. No card needed.',
    submit: 'Create account',
  },
};

/** Only same-site paths are allowed after login (no open redirect). */
function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/app/live';
}

export default function AuthCard({ mode }: { mode: 'login' | 'signup' }) {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [login, loginState] = useLoginMutation();
  const [signup, signupState] = useSignupMutation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(search.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isSignup = mode === 'signup';
  const state = isSignup ? signupState : loginState;
  const text = TEXT[mode];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (isSignup) await signup({ name, email, password }).unwrap();
      else await login({ email, password }).unwrap();
      navigate(isSignup ? '/onboarding' : safeNext(search.get('next')));
    } catch {
      // The error is shown under the form (state.error).
    }
  }

  return (
    <main className="auth-page">
      <Link className="auth-back" to="/">
        <ArrowLeft size={15} /> Back to HTTPowl
      </Link>
      <section className="auth-card">
        <div className="auth-logo">
          <OwlMark />
          <span>
            httpowl<span>.</span>
          </span>
        </div>
        <div className="section-kicker">{text.kicker}</div>
        <h1>{text.title}</h1>
        <p>{text.intro}</p>

        <form onSubmit={submit} className="auth-form">
          {isSignup && (
            <label>
              Your name
              <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ana Petrova" maxLength={100} />
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@yourwebsite.com"
              required
            />
          </label>
          <label>
            Password
            <span className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isSignup ? `At least ${MIN_PASSWORD} characters` : 'Your password'}
                minLength={isSignup ? MIN_PASSWORD : undefined}
                maxLength={200}
                required
              />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </span>
          </label>
          {!isSignup && (
            <div className="form-meta">
              <span>
                <LockKeyhole size={13} /> Secure sign in
              </span>
              <a href="mailto:hello@httpowl.net?subject=Password%20reset">Forgot password?</a>
            </div>
          )}
          <ErrorNotice error={state.error} fallback="That didn’t work. Check your details and try again." />
          <Button className="auth-submit" type="submit" disabled={state.isLoading}>
            {text.submit}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </form>

        <div className="auth-switch">
          {isSignup ? (
            <>
              Already have an account? <Link to="/login">Sign in</Link>
            </>
          ) : (
            <>
              New to HTTPowl? <Link to="/signup">Create an account</Link>
            </>
          )}
        </div>
      </section>
      <p className="auth-footer">
        By continuing, you agree to our <a href="mailto:hello@httpowl.net?subject=Terms">Terms</a> and{' '}
        <a href="mailto:hello@httpowl.net?subject=Privacy">Privacy Policy</a>.
      </p>
    </main>
  );
}
