"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setToken, setUserData, fetchCartData } = useAppContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !password) {
      setError("Please enter both username and password.");
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`
        : "/api/login";

      console.log("handleLogin: Sending login request to", apiUrl);
      const response = await axios.post(
        apiUrl,
        { email: username, password },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      const data = response.data;
      console.log("handleLogin: Login response:", {
        success: data.success,
        userId: data.userId,
        role: data.role,
        token: data.token ? data.token.substring(0, 20) + "..." : "No token",
      });

      if (data.success && data.token) {
        // Set token in cookies
        Cookies.set("token", data.token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        console.log("handleLogin: Token set in cookies:", data.token.substring(0, 20) + "...");

        // Update context
        await setToken(data.token);
        await setUserData({
          id: data.userId,
          email: username,
          role: data.role,
        });
        console.log("handleLogin: Context updated with user data");

        // Fetch cart data
        await fetchCartData();
        console.log("handleLogin: Cart data fetched");

        toast.success(data.message || "Login successful!");
        const intendedRoute = localStorage.getItem("intendedRoute") || "/all-products";
        localStorage.removeItem("intendedRoute");
        router.push(intendedRoute);
      } else {
        setError(data.message || "Login failed.");
        toast.error(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("handleLogin: Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-[url('/gaming-bg.jpg')] bg-cover bg-center">
      <div className="bg-gray-800 bg-opacity-80 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all hover:scale-105">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-yellow-400 tracking-wider animate-pulse">
            GAMECART
          </h1>
          <p className="text-yellow-200 mt-2">Login to your gaming adventure</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              placeholder="Username (Email)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all placeholder-gray-400"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all placeholder-gray-400"
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center animate-fade-in">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-yellow-600 text-gray-900 font-semibold rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all shadow-lg hover:shadow-yellow-500/50 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center text-yellow-200">
          <p className="mt-2">
            New to GameZone?{" "}
            <a href="/register" className="text-yellow-400 hover:underline">
              Register Now
            </a>
          </p>
          <p className="mt-2">
            <a href="/forgot-password" className="text-yellow-400 hover:underline">
              Forgot Password?
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;