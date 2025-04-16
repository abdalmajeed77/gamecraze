"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "$";
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // Initialize as null
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Load token from localStorage only on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, []);

  const fetchProductData = async () => {
    console.log("Fetching product data...");
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data?.message || "Failed to fetch products");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchUserData = async () => {
    if (!token) {
      console.log("No token available for fetchUserData");
      return;
    }
    console.log("Fetching user data with token:", token);
    try {
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.data) {
        setUserData(data.data);
        setUser({
          id: data.data.id,
          email: data.data.email,
          role: data.data.role,
        });
        setCartItems(data.data.cartItems || {});
        setIsSeller(data.data.role === "seller");
        console.log("User data fetched successfully:", data.data);
      } else {
        toast.error(data.message || "Failed to fetch user data");
        setCartItems({});
      }
    } catch (error) {
      console.error("Fetch user data error:", error);
      const errorMessage = error.response?.data?.message || "Error fetching user data";
      toast.error(errorMessage);
      if (error.response?.status === 401) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        router.push("/login");
        toast.error("Session expired. Please log in again.");
      }
    }
  };

  const fetchCartData = async () => {
    if (!token) {
      console.log("No token available for fetchCartData");
      return;
    }
    console.log("Fetching cart data with token:", token);
    try {
      const { data } = await axios.get("/api/cart/update", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setCartItems(data.data || {});
        console.log("Cart data fetched successfully:", data.data);
      } else {
        toast.error(data.message || "Failed to fetch cart data");
        setCartItems({});
      }
    } catch (error) {
      console.error("Fetch cart data error:", error);
      const errorMessage = error.response?.data?.message || "Error fetching cart data";
      toast.error(errorMessage);
      if (error.response?.status === 401) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        router.push("/login");
        toast.error("Session expired. Please log in again.");
      }
    }
  };

  const addToCart = async (itemId) => {
    const cartData = { ...cartItems };
    cartData[itemId] = (cartData[itemId] || 0) + 1;
    setCartItems(cartData);

    if (token) {
      try {
        const { data } = await axios.post(
          "/api/cart/update",
          { cartData },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          toast.success("Item added to cart");
        } else {
          toast.error(data.message || "Failed to update cart");
        }
      } catch (error) {
        console.error("Add to cart error:", error);
        toast.error(error.response?.data?.message || "Error updating cart");
      }
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    const cartData = { ...cartItems };
    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);

    if (token) {
      try {
        const { data } = await axios.post(
          "/api/cart/update",
          { cartData },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          toast.success("Cart updated");
        } else {
          toast.error(data.message || "Failed to update cart");
        }
      } catch (error) {
        console.error("Update cart quantity error:", error);
        toast.error(error.response?.data?.message || "Error updating cart");
      }
    }
  };

  const getCartCount = () => {
    return Object.values(cartItems).reduce((total, count) => total + (count > 0 ? count : 0), 0);
  };

  const getCartAmount = () => {
    const totalAmount = Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
      const itemInfo = products.find((product) => product._id === itemId);
      return itemInfo && quantity > 0 ? total + itemInfo.offerPrice * quantity : total;
    }, 0);
    return Number(totalAmount.toFixed(2));
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserData();
      fetchCartData();
    } else {
      setUserData(null);
      setIsSeller(false);
      setCartItems({});
    }
  }, [token]);

  const value = {
    user,
    setUser,
    token,
    setToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
    isLoadingProducts,
    fetchCartData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;