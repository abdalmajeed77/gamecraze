'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";

const MyOrders = () => {
  const { currency, getToken } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
        <div className="space-y-5">
          <h2 className="text-lg font-medium mt-6">My Orders</h2>
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
                className="mt-4 text-orange-600 underline"
              >
                Retry
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="max-w-5xl border-t border-gray-300 text-sm">
              {orders.map((order, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300">
                  <div className="flex-1 flex gap-5 max-w-80">
                    <Image
                      className="max-w-16 max-h-16 object-cover"
                      src={assets.box_icon}
                      alt="Order package"
                    />
                    <p className="flex flex-col gap-3">
                      <span className="font-medium text-base">
                        {order.items?.map((item) => `${item.product?.name || "Unknown"} x ${item.quantity}`).join(", ")}
                      </span>
                      <span>Items: {order.items?.length || 0}</span>
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">{order.address?.fullName || "N/A"}</span>
                      <br />
                      <span>{order.address?.area || ""}</span>
                      <br />
                      <span>{order.address ? `${order.address.city}, ${order.address.state}` : "N/A"}</span>
                      <br />
                      <span>{order.address?.phoneNumber || "N/A"}</span>
                    </p>
                  </div>
                  <p className="font-medium my-auto">{currency}{order.amount?.toFixed(2) || "0.00"}</p>
                  <div>
                    <p className="flex flex-col">
                      <span>Method: {order.paymentMethod || "COD"}</span>
                      <span>Date: {new Date(order.date).toLocaleDateString()}</span>
                      <span>Payment: {order.paymentStatus || "Pending"}</span>
                    </p>
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