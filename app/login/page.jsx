"use client";
import React, { useState } from 'react';


const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    // Simulated login validation
    if (username === 'gamer' && password === 'play123') {
      setError('');
      alert('Login Successful! Welcome to the GameZone!');
    } else {
      setError('Invalid credentials. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-[url('/gaming-bg.jpg')] bg-cover bg-center">
      <div className="bg-gray-800 bg-opacity-80 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all hover:scale-105">
        {/* Logo or Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-yellow-400 tracking-wider animate-pulse">
            GameZone
          </h1>
          <p className="text-yellow-200 mt-2">Login to your gaming adventure</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all placeholder-gray-400"
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all placeholder-gray-400"
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.761 0-5 2.239-5 5h10c0-2.761-2.239-5-5-5z" />
              </svg>
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center animate-fade-in">{error}</p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 bg-yellow-600 text-gray-900 font-semibold rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all shadow-lg hover:shadow-yellow-500/50"
          >
            Login
          </button>
        </form>

        {/* Additional Links */}
        <div className="mt-4 text-center text-yellow-200">
          <p>
            New to GameZone?{' '}
            <a href="/login/register" className="text-yellow-400 hover:underline">Register Now</a>
          </p>
          <p className="mt-2">
            <a href="/login/forget-password" className="text-yellow-400 hover:underline">Forgot Password?</a>
          </p>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;