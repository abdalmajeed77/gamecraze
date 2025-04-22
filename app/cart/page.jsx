"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import Image from "next/image";
import { assets } from "@/assets/assets";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import StripeCheckout from "react-stripe-checkout";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const Cart = () => {
  const { currency, token, cartItems, updateCartQuantity, getCartAmount, products, user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
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
  const [formData, setFormData] = useState({
    email: user?.email || "",
    phone: "",
    paymentMethod: "Stripe",
    transactionImage: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.log("Cart: No token, redirecting to login");
        localStorage.setItem("intendedRoute", "/cart");
        router.push("/login");
        return;
      }
      try {
        console.log("Cart: Fetching cart data with token:", token.substring(0, 20) + "...");
        const cartResponse = await axios.get("/api/cart/update", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        if (!cartResponse.data.success) {
          setError(cartResponse.data.message || "Failed to fetch cart");
          return;
        }

        const settingsResponse = await axios.get("/api/payment-settings");
        if (settingsResponse.data.success) {
          setPaymentSettings(settingsResponse.data.paymentSettings);
          const enabledMethod = Object.keys(settingsResponse.data.paymentSettings.paymentMethods).find(
            (method) => settingsResponse.data.paymentSettings.paymentMethods[method]
          ) || settingsResponse.data.paymentSettings.customMethods.find((m) => m.isActive)?.type || "Stripe";
          setFormData((prev) => ({ ...prev, paymentMethod: enabledMethod }));
        } else {
          setError(settingsResponse.data.message || "Failed to fetch payment settings");
        }
      } catch (err) {
        console.error("Cart: Error fetching data:", err);
        setError(err.response?.data?.message || "Error loading cart");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, router]);

  const handleCheckoutToggle = () => {
    if (Object.keys(cartItems).length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setShowCheckout(!showCheckout);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const createOrder = async () => {
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }
    if (["UPI", "BankTransfer"].includes(formData.paymentMethod) && !formData.transactionImage) {
      toast.error("Transaction proof image is required for UPI or Bank Transfer");
      return;
    }
    setSubmitting(true);
    try {
      const orderData = new FormData();
      orderData.append("items", JSON.stringify(
        Object.entries(cartItems).map(([itemId, item]) => ({
          product: itemId,
          quantity: item.quantity || 1,
          emailOrId: item.emailOrId || "",
          selectedPrice: item.selectedPrice || 0,
        }))
      ));
      orderData.append("amount", getCartAmount());
      orderData.append("paymentMethod", formData.paymentMethod);
      orderData.append("contact", JSON.stringify({
        email: formData.email,
        phone: formData.phone,
      }));
      if (formData.transactionImage) {
        orderData.append("transactionImage", formData.transactionImage);
      }

      console.log("Cart: Creating order:", { formData, cartItems });
      const response = await axios.post("/api/order/create", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      if (response.data.success) {
        toast.success("Order placed successfully!");
        setShowCheckout(false);
        router.push("/my-orders");
      } else {
        console.error("Cart: Order creation failed:", response.data);
        toast.error(response.data.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Cart: Error creating order:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      toast.error(err.response?.data?.message || "Error placing order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStripeToken = (token) => {
    console.log("Cart: Stripe token received:", token.id);
    const orderData = new FormData();
    orderData.append("stripeToken", token.id);
    createOrder();
  };

  const paypalInitialOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading />
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-6 min-h-screen flex flex-col items-center justify-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              router.refresh();
            }}
            className="mt-4 text-orange-600 underline hover:text-orange-700 transition"
          >
            Retry
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-6 min-h-screen flex flex-col">
        <h2 className="text-2xl font-medium mt-6 text-gray-800">Your Cart</h2>
        {Object.keys(cartItems).length === 0 ? (
          <div className="text-center text-gray-500 mt-6">
            <p>Your cart is empty.</p>
            <button
              onClick={() => router.push("/all-products")}
              className="mt-4 text-orange-600 underline hover:text-orange-700 transition"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col lg:flex-row gap-6">
            {/* Cart Items */}
            <div className="flex-1 max-w-5xl bg-white border border-gray-300 rounded-lg overflow-hidden">
              <div className="hidden md:grid grid-cols-6 gap-4 p-4 bg-gray-100 text-gray-700 font-medium text-sm">
                <div className="col-span-2">Product</div>
                <div>Email/ID</div>
                <div>Price</div>
                <div>Quantity</div>
                <div>Total</div>
              </div>
              {Object.entries(cartItems).map(([itemId, item]) => {
                const product = products.find((p) => p._id === itemId);
                const price = item.selectedPrice || product?.offerPrice || product?.price || 0;
                return (
                  <div
                    key={itemId}
                    className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border-b border-gray-300 items-center text-sm"
                  >
                    <div className="col-span-2 flex items-center gap-4">
                      <Image
                        className="w-12 h-12 object-cover rounded"
                        src={product?.imageUrl || assets.box_icon}
                        alt="Cart item"
                        width={48}
                        height={48}
                      />
                      <span className="font-medium">{product?.name || "Unknown Product"}</span>
                    </div>
                    <div>{item.emailOrId || "N/A"}</div>
                    <div>
                      {currency}
                      {price.toFixed(2)}
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity(itemId, parseInt(e.target.value))}
                        className="w-16 p-1 border rounded"
                      />
                    </div>
                    <div className="font-medium">
                      {currency}
                      {(price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
              <div className="p-4 flex justify-between items-center">
                <span className="text-lg font-medium">
                  Total: {currency}
                  {getCartAmount().toFixed(2)}
                </span>
                <button
                  onClick={handleCheckoutToggle}
                  className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                >
                  {showCheckout ? "Close Checkout" : "Proceed to Checkout"}
                </button>
              </div>
            </div>

            {/* Checkout Section */}
            {showCheckout && (
              <div className="flex-1 max-w-md bg-white border border-gray-300 rounded-lg p-6">
                <h3 className="text-xl font-medium text-gray-800 mb-4">Checkout</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {paymentSettings.paymentMethods.Stripe && (
                        <option value="Stripe">Stripe (Credit/Debit Card)</option>
                      )}
                      {paymentSettings.paymentMethods.PayPal && <option value="PayPal">PayPal</option>}
                      {paymentSettings.paymentMethods.UPI && paymentSettings.customMethods
                        .filter((m) => m.type === "UPI" && m.isActive)
                        .map((method, index) => (
                          <option key={`UPI-${index}`} value={`UPI-${method.details.upiId}`}>
                            UPI: {method.details.upiId}
                          </option>
                        ))}
                      {paymentSettings.paymentMethods.BankTransfer && paymentSettings.customMethods
                        .filter((m) => m.type === "BankTransfer" && m.isActive)
                        .map((method, index) => (
                          <option key={`BankTransfer-${index}`} value={`BankTransfer-${method.details.accountNumber}`}>
                            Bank: {method.details.bankName}, A/C: {method.details.accountNumber}
                          </option>
                        ))}
                      {paymentSettings.paymentMethods.Crypto && (
                        <option value="Crypto" disabled>
                          Cryptocurrency (Coming Soon)
                        </option>
                      )}
                    </select>
                  </div>
                  {["UPI", "BankTransfer"].some((type) => formData.paymentMethod.startsWith(type)) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transaction Proof</label>
                      <input
                        type="file"
                        name="transactionImage"
                        accept="image/*"
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                      {formData.transactionImage && (
                        <Image
                          src={URL.createObjectURL(formData.transactionImage)}
                          alt="Transaction proof"
                          width={100}
                          height={100}
                          className="mt-2 max-w-24 rounded"
                        />
                      )}
                      {formData.paymentMethod.startsWith("UPI") && (
                        <p className="text-sm text-gray-600 mt-2">
                          UPI ID: {formData.paymentMethod.split("-")[1]}
                        </p>
                      )}
                      {formData.paymentMethod.startsWith("BankTransfer") && (() => {
                        const accountNumber = formData.paymentMethod.split("-")[1];
                        const method = paymentSettings.customMethods.find(
                          (m) => m.type === "BankTransfer" && m.details.accountNumber === accountNumber
                        );
                        return (
                          <p className="text-sm text-gray-600 mt-2">
                            Bank: {method.details.bankName}<br />
                            Account: {method.details.accountNumber}<br />
                            IFSC: {method.details.ifscCode}
                          </p>
                        );
                      })()}
                    </div>
                  )}
                  {formData.paymentMethod === "Stripe" && (
                    <StripeCheckout
                      token={handleStripeToken}
                      stripeKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
                      amount={getCartAmount() * 100}
                      currency="USD"
                      email={formData.email}
                      description="Recharge Payment"
                      disabled={submitting || Object.keys(cartItems).length === 0}
                    >
                      <button
                        type="button"
                        disabled={submitting || Object.keys(cartItems).length === 0}
                        className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600 disabled:bg-gray-400 transition"
                      >
                        {submitting ? "Processing..." : "Pay with Stripe"}
                      </button>
                    </StripeCheckout>
                  )}
                  {formData.paymentMethod === "PayPal" && (
                    <PayPalScriptProvider options={paypalInitialOptions}>
                      <PayPalButtons
                        disabled={submitting || Object.keys(cartItems).length === 0}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [
                              {
                                amount: {
                                  value: getCartAmount().toFixed(2),
                                  currency_code: "USD",
                                },
                              },
                            ],
                          });
                        }}
                        onApprove={async (data, actions) => {
                          const order = await actions.order.capture();
                          console.log("Cart: PayPal order captured:", order);
                          const orderData = new FormData();
                          orderData.append("paypalOrderId", order.id);
                          createOrder();
                        }}
                        onError={(err) => {
                          console.error("Cart: PayPal error:", err);
                          toast.error("PayPal payment failed");
                          setSubmitting(false);
                        }}
                      />
                    </PayPalScriptProvider>
                  )}
                  {["UPI", "BankTransfer"].some((type) => formData.paymentMethod.startsWith(type)) && (
                    <button
                      type="button"
                      onClick={createOrder}
                      disabled={submitting || Object.keys(cartItems).length === 0}
                      className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600 disabled:bg-gray-400 transition"
                    >
                      {submitting ? "Processing..." : "Submit Order"}
                    </button>
                  )}
                </form>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Cart;