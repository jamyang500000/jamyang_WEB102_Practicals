'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/authContext';

export function LoginForm({ onSuccess, switchToSignup }) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password);
    setIsLoading(false);
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          {...register('email', { required: 'Email is required' })}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="mb-4">
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          {...register('password', { required: 'Password is required' })}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-red-500 text-white py-3 rounded-md font-medium hover:bg-red-600 transition disabled:opacity-50"
      >
        {isLoading ? 'Logging in...' : 'Log in'}
      </button>

      <div className="mt-4 text-center">
        <p className="text-gray-500 text-sm">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={switchToSignup}
            className="text-red-500 font-medium hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </form>
  );
}

export function SignupForm({ onSuccess, switchToLogin }) {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerUser({
      username: data.username,
      email: data.email,
      password: data.password,
    });
    setIsLoading(false);
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  const password = watch('password');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Username"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          {...register('username', {
            required: 'Username is required',
            minLength: { value: 3, message: 'At least 3 characters' },
            pattern: {
              value: /^[a-zA-Z0-9_]+$/,
              message: 'Only letters, numbers and underscores',
            },
          })}
        />
        {errors.username && (
          <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
        )}
      </div>

      <div className="mb-3">
        <input
          type="email"
          placeholder="Email address"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="mb-3">
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'At least 6 characters' },
          })}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="mb-4">
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match',
          })}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-red-500 text-white py-3 rounded-md font-medium hover:bg-red-600 transition disabled:opacity-50"
      >
        {isLoading ? 'Creating account...' : 'Sign up'}
      </button>

      <div className="mt-4 text-center">
        <p className="text-gray-500 text-sm">
          Already have an account?{' '}
          <button
            type="button"
            onClick={switchToLogin}
            className="text-red-500 font-medium hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </form>
  );
}