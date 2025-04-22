"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const PaymentSettings = () => {
  const { token } = useAppContext();
  const [paymentSettings, setPaymentSettings] = useState({
    paymentMethods: {
      Stripe: true,
      PayPal: true,
      UPI: true,
      BankTransfer: true,
      Crypto: false,
    },
    customMethods: [],
  });
  const [newCustomMethod, setNewCustomMethod] = useState({
    type: "UPI",
    details: { upiId: "", bankName: "", accountNumber: "", ifscCode: "" },
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const response = await axios.get("/api/payment-settings");
        if (response.data.success) {
          setPaymentSettings(response.data.paymentSettings);
        } else {
          setError(response.data.message || "Failed to fetch payment settings");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error loading settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token, router]);

  const handlePaymentMethodToggle = (method) => {
    setPaymentSettings((prev) => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: !prev.paymentMethods[method],
      },
    }));
  };

  const handleCustomMethodChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      setNewCustomMethod((prev) => ({ ...prev, type: value }));
    } else {
      setNewCustomMethod((prev) => ({
        ...prev,
        details: { ...prev.details, [name]: value },
      }));
    }
  };

  const addCustomMethod = () => {
    if (newCustomMethod.type === "UPI" && !newCustomMethod.details.upiId) {
      toast.error("UPI ID is required");
      return;
    }
    if (
      newCustomMethod.type === "BankTransfer" &&
      (!newCustomMethod.details.bankName ||
        !newCustomMethod.details.accountNumber ||
        !newCustomMethod.details.ifscCode)
    ) {
      toast.error("All bank details are required");
      return;
    }
    setPaymentSettings((prev) => ({
      ...prev,
      customMethods: [...prev.customMethods, newCustomMethod],
    }));
    setNewCustomMethod({
      type: "UPI",
      details: { upiId: "", bankName: "", accountNumber: "", ifscCode: "" },
      isActive: true,
    });
  };

  const toggleCustomMethod = (index) => {
    setPaymentSettings((prev) => ({
      ...prev,
      customMethods: prev.customMethods.map((method, i) =>
        i === index ? { ...method, isActive: !method.isActive } : method
      ),
    }));
  };

  const savePaymentSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await axios.post(
        "/api/payment-settings",
        paymentSettings,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success("Payment settings updated");
        setPaymentSettings(response.data.paymentSettings);
      } else {
        toast.error(response.data.message || "Failed to update settings");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-medium mb-6 text-gray-800">Payment Settings</h2>
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-4">Predefined Payment Methods</h3>
        <div className="space-y-4">
          {Object.keys(paymentSettings.paymentMethods).map((method) => (
            <div key={method} className="flex items-center gap-4">
              <input
                type="checkbox"
                id={method}
                checked={paymentSettings.paymentMethods[method]}
                onChange={() => handlePaymentMethodToggle(method)}
                className="h-5 w-5 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor={method} className="text-sm font-medium text-gray-700">
                {method === "BankTransfer" ? "Bank Transfer" : method}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h3 className="text-xl font-medium text-gray-800 mb-4">Custom Payment Methods</h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Method Type</label>
            <select
              name="type"
              value={newCustomMethod.type}
              onChange={handleCustomMethodChange}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="UPI">UPI</option>
              <option value="BankTransfer">Bank Transfer</option>
            </select>
          </div>
          {newCustomMethod.type === "UPI" ? (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">UPI ID</label>
              <input
                type="text"
                name="upiId"
                value={newCustomMethod.details.upiId}
                onChange={handleCustomMethodChange}
                className="p-2 border border-gray-300 rounded"
                placeholder="e.g., yourname@upi"
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={newCustomMethod.details.bankName}
                  onChange={handleCustomMethodChange}
                  className="p-2 border border-gray-300 rounded"
                  placeholder="e.g., State Bank"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={newCustomMethod.details.accountNumber}
                  onChange={handleCustomMethodChange}
                  className="p-2 border border-gray-300 rounded"
                  placeholder="e.g., 1234567890"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={newCustomMethod.details.ifscCode}
                  onChange={handleCustomMethodChange}
                  className="p-2 border border-gray-300 rounded"
                  placeholder="e.g., SBIN0001234"
                />
              </div>
            </>
          )}
          <button
            onClick={addCustomMethod}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
          >
            Add Custom Method
          </button>
          {paymentSettings.customMethods.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-medium text-gray-800 mb-2">Added Custom Methods</h4>
              {paymentSettings.customMethods.map((method, index) => (
                <div key={index} className="flex items-center gap-4 mb-2">
                  <input
                    type="checkbox"
                    id={`custom-${index}`}
                    checked={method.isActive}
                    onChange={() => toggleCustomMethod(index)}
                    className="h-5 w-5 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor={`custom-${index}`} className="text-sm font-medium text-gray-700">
                    {method.type === "UPI"
                      ? `UPI: ${method.details.upiId}`
                      : `Bank: ${method.details.bankName}, A/C: ${method.details.accountNumber}`}
                  </label>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={savePaymentSettings}
            disabled={settingsLoading}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400 transition"
          >
            {settingsLoading ? "Saving..." : "Save Payment Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;