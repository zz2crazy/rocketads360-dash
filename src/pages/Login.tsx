import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Logo } from '../components/Logo';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { signInWithEmail } from '../services/supabase/auth';
import { AuthenticationError } from '../services/supabase/errors';
import { debug } from '../lib/debug';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    
    debug.group('login', 'Processing login submission');
    console.log('Login submission started', { email }); // Debug log
    
    setError('');
    setIsLoading(true);
    setIsSubmitting(true);

    try {
      debug.info('login', `Attempting login for: ${email}`);
      console.log('Initiating sign in process...'); // Debug log
      
      const { profile } = await signInWithEmail(email, password);
      
      debug.info('login', 'Login successful, profile:', profile);
      console.log('Sign in successful, navigating to dashboard...'); // Debug log
      
      navigate(profile.role === 'customer' ? '/customer' : '/employee');
    } catch (err) {
      debug.error('login', 'Login error:', err);
      console.error('Login error details:', err); // Debug log
      
      setError(err instanceof AuthenticationError 
        ? err.message 
        : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
      debug.groupEnd('login');
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 will-change-transform">
      <div className="max-w-md w-full">
        <Logo className="justify-center mb-8" />
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <p className="text-gray-600">
            Sign in to manage your orders
          </p>
        </div>
        <div className="card p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-center text-red-600">
                <svg className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium ml-2">{error}</p>
              </div>
            </div>)}
          <form onSubmit={handleSubmit} className="space-y-6" id="login-form">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field will-change-transform"
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
                aria-disabled={isSubmitting}
                data-testid="email-input"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field will-change-transform"
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
                aria-disabled={isSubmitting}
                data-testid="password-input"
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center will-change-transform"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
              data-testid="submit-button"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}