"use client";
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      setMessage("");
      return;
    }

    try {
      const response = await axios.post("/api/login/forgot-password", { email });
      if (response.data.success) {
        setError("");
        setMessage(response.data.message);
      } else {
        setError(response.data.message || "Failed to send reset link.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      toast.error(error.message);
    }
    setEmail(""); // Clear input after attempt
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-[url('/gaming-bg.jpg')] bg-cover bg-center">
      <div className="bg-gray-800 bg-opacity-80 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all hover:scale-105">
        {/* Logo or Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-yellow-400 tracking-wider animate-pulse">
            GameZone
          </h1>
          <p className="text-yellow-200 mt-2">Reset your password</p>
        </div>

        {/* Form */}
        <form onSubmit={handleForgotPassword} className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all placeholder-gray-400"
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 12h5l-9-9-9 9h5v7a2 2 0 002 2h4a2 2 0 002-2v-7z"
                />
              </svg>
            </span>
          </div>

          {/* Success/Error Message */}
          {message && (
            <p className="text-green-500 text-sm text-center animate-fade-in">
              {message}
            </p>
          )}
          {error && (
            <p className="text-red-500 text-sm text-center animate-fade-in">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-yellow-600 text-gray-900 font-semibold rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all shadow-lg hover:shadow-yellow-500/50"
          >
            Send Reset Link
          </button>
        </form>

        {/* Additional Links */}
        <div className="mt-4 text-center text-yellow-200">
          <p>
            Remembered your password?{" "}
            <a href="/login" className="text-yellow-400 hover:underline">
              Login Here
            </a>
          </p>
          <p className="mt-2">
            Need an account?{" "}
            <a href="/login/register" className="text-yellow-400 hover:underline">
              Register Now
            </a>
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

export default ForgotPasswordPage;