"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const MyOrders = () => {
  const { currency, token, router } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      if (!token) {
        setError("Please log in to view orders");
        localStorage.setItem("intendedRoute", "/my-orders");
        router.push("/login");
        setLoading(false);
        return;
      }
      const response = await axios.get("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("fetchOrders: Error:", err);
      setError(err.response?.data?.message || "Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-6 min-h-screen flex flex-col">
        <h2 className="text-2xl font-medium mt-6 text-gray-800">My Orders</h2>
        <div className="flex-1 mt-6">
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="text-center text-red-500">
              <p>{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  fetchOrders();
                }}
                className="mt-4 text-orange-600 underline hover:text-orange-700 transition"
              >
                Retry
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>No orders found.</p>
              <button
                onClick={() => router.push("/all-products")}
                className="mt-4 text-orange-600 underline hover:text-orange-700 transition"
              >
                Shop Now
              </button>
            </div>
          ) : (
            <div className="max-w-5xl bg-white border border-gray-300 rounded-lg overflow-hidden">
              <div className="hidden md:grid grid-cols-7 gap-4 p-4 bg-gray-100 text-gray-700 font-medium text-sm">
                <div className="col-span-2">Product</div>
                <div>Quantity</div>
                <div>Email/ID</div>
                <div>Price</div>
                <div>Total</div>
                <div>Details</div>
              </div>
              {orders.map((order, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 border-b border-gray-300 items-center text-sm"
                >
                  <div className="col-span-2 flex items-center gap-4">
                    <Image
                      className="w-12 h-12 object-cover rounded"
                      src={order.items?.[0]?.product?.imageUrl || assets.box_icon}
                      alt="Order item"
                      width={48}
                      height={48}
                    />
                    <span className="font-medium">
                      {order.items
                        ?.map((item) => item.product?.name || "Unknown")
                        .join(", ")}
                    </span>
                  </div>
                  <div>
                    {order.items?.reduce((total, item) => total + item.quantity, 0)}
                  </div>
                  <div>
                    {order.items?.[0]?.emailOrId || "N/A"}
                  </div>
                  <div>
                    {currency}
                    {order.items?.[0]?.selectedPrice?.toFixed(2) || "0.00"}
                  </div>
                  <div className="font-medium">
                    {currency}
                    {order.amount?.toFixed(2) || "0.00"}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>Method: {order.paymentMethod || "COD"}</span>
                    <span>Date: {new Date(order.date).toLocaleDateString()}</span>
                    <span>Status: {order.paymentStatus || "Pending"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;