"use client";

import React, { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill out all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }
      
      if (data.token) {
        localStorage.setItem('authToken', data.token); 
        window.location.href = '/'; 
      } else {
        throw new Error('Login successful, but no token received.');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white border border-neutral-200 rounded-lg shadow-sm">
        <div className="text-center">
          <a href="/" className="text-3xl font-bold text-black tracking-tighter">
            Grailify
          </a>
          <h2 className="mt-4 text-xl text-neutral-800">Welcome Back</h2>
          <p className="mt-2 text-sm text-neutral-600">Sign in to continue to your account.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-neutral-400"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-600">
          Don't have an account?{' '}
          <a href="/signup" className="font-medium text-black hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
