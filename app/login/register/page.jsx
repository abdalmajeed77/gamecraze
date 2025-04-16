"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phoneNumber: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/register", formData);
      if (response.data.success) {
        toast.success(response.data.message);
        router.push("/login");
      } else {
        setError(response.data.message || "Registration failed.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 bg-opacity-80 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-yellow-400 text-center mb-6">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Phone Number (optional)"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
          <div>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
            >
              <option value="user">User</option>
              <option value="seller">Seller</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-yellow-600 text-gray-900 font-semibold rounded-lg"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;