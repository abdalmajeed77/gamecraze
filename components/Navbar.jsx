"use client";
import React from "react";
import { assets, BagIcon, CartIcon, HomeIcon } from "../assets/assets";
import Link from "next/link";
import { useAppContext } from "../context/AppContext";
import Image from "next/image";

const Navbar = () => {
  const { user, setUser, setToken, isSeller, router, userData } = useAppContext();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setUser(null);
        setToken(null);
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push("/")}
        src={assets.logo}
        alt="logo"
      />
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Shop
        </Link>
        <Link href="/about-us" className="hover:text-gray-900 transition">
          About Us
        </Link>
        <Link href="/contact" className="hover:text-gray-900 transition">
          Contact
        </Link>
        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs border px-4 py-1.5 rounded-full"
          >
            Seller Dashboard
          </button>
        )}
      </div>
      <ul className="hidden md:flex items-center gap-4">
        <Image className="w-4 h-4" src={assets.search_icon} alt="search icon" />
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Welcome, {userData?.name || user.email}!
            </span>
            <div className="relative group">
              <Image src={assets.user_icon} alt="user icon" />
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md hidden group-hover:block z-10">
                <button
                  onClick={() => router.push("/")}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  <HomeIcon className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={() => router.push("/cart")}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  <CartIcon className="w-4 h-4" />
                  Cart
                </button>
                <button
                  onClick={() => router.push("/my-orders")}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  <BagIcon className="w-4 h-4" />
                  My Orders
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 hover:text-gray-900 transition"
          >
            <Image src={assets.user_icon} alt="user icon" />
            Account
          </button>
        )}
      </ul>
      <div className="flex items-center md:hidden gap-3">
        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs border px-4 py-1.5 rounded-full"
          >
            Seller Dashboard
          </button>
        )}
        {user ? (
          <div className="relative group">
            <Image src={assets.user_icon} alt="user icon" />
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md hidden group-hover:block z-10">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                <HomeIcon className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={() => router.push("/cart")}
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                <CartIcon className="w-4 h-4" />
                Cart
              </button>
              <button
                onClick={() => router.push("/my-orders")}
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                <BagIcon className="w-4 h-4" />
                My Orders
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 hover:text-gray-900 transition"
          >
            <Image src={assets.user_icon} alt="user icon" />
            Account
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;