"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "$";
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Load token from cookies synchronously to avoid race conditions
  useEffect(() => {
    const storedToken = Cookies.get("token");
    if (storedToken) {
      console.log("AppContext: Loaded token from cookies:", storedToken.substring(0, 20) + "...");
      setToken(storedToken);
    } else {
      console.log("AppContext: No token found in cookies");
      setToken(null);
    }
  }, []);

  // Verify authentication
  const verifyAuth = async () => {
    try {
      if (!token) {
        console.log("verifyAuth: No token available");
        toast.error("No authentication token found");
        return false;
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify`
        : "/api/auth/verify";
      console.log("verifyAuth: Sending request to", apiUrl, "with token:", token.substring(0, 20) + "...");
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log("verifyAuth: Response:", response.data);
      if (response.data.verified) {
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          role: response.data.user.role,
        });
        return true;
      }
      console.log("verifyAuth: Verification failed:", response.data);
      toast.error("Verification failed: " + (response.data.message || "Unknown error"));
      return false;
    } catch (error) {
      console.error("verifyAuth: Error:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Authentication verification failed: " + (error.response?.data?.message || error.message));
      return false;
    }
  };

  // Fetch products
  const fetchProductData = async () => {
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

  // Fetch user data
  const fetchUserData = async () => {
    if (!token) {
      console.log("fetchUserData: No token, skipping");
      return;
    }
    try {
      console.log("fetchUserData: Fetching with token:", token.substring(0, 20) + "...");
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log("fetchUserData: Response:", data);
      if (data.success && data.data) {
        setUserData(data.data);
        setUser({
          id: data.data.id,
          email: data.data.email,
          role: data.data.role,
        });
        setCartItems(data.data.cartItems || {});
        setIsSeller(data.data.role === "seller");
      } else {
        toast.error(data.message || "Failed to fetch user data");
        setCartItems({});
      }
    } catch (error) {
      console.error("fetchUserData: Error:", error);
      toast.error(error.response?.data?.message || "Error fetching user data");
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Fetch cart data
  const fetchCartData = async () => {
    if (!token) {
      console.log("fetchCartData: No token, skipping");
      return;
    }
    try {
      console.log("fetchCartData: Fetching with token:", token.substring(0, 20) + "...");
      const { data } = await axios.get("/api/cart/update", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log("fetchCartData: Response:", data);
      if (data.success) {
        setCartItems(data.data || {});
      } else {
        toast.error(data.message || "Failed to fetch cart data");
      }
    } catch (error) {
      console.error("fetchCartData: Error:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.message || "Error fetching cart data");
      if (error.response?.status === 401) {
        console.warn("fetchCartData: 401 Unauthorized, redirecting to login");
        toast.error("Session expired. Please log in again.");
        logout();
      } else if (error.response?.status === 500) {
        toast.error("Server error fetching cart. Please try again later.");
      }
    }
  };

  // Add to cart
  const addToCart = async (itemId, cartItemDetails = {}) => {
    let cartData = { ...cartItems };
    if (!cartData[itemId]) {
      cartData[itemId] = { quantity: 1, ...cartItemDetails };
    } else {
      cartData[itemId].quantity += 1;
      cartData[itemId] = { ...cartData[itemId], ...cartItemDetails };
    }
    setCartItems(cartData);

    if (!token) {
      localStorage.setItem("cartItems", JSON.stringify(cartData));
      toast.success("Item added to cart");
      return;
    }

    try {
      console.log("addToCart: Updating cart with:", { itemId, cartData });
      const { data } = await axios.post(
        "/api/cart/update",
        { cartData },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      if (data.success) {
        toast.success("Item added to cart");
      } else {
        toast.error(data.message || "Failed to update cart");
      }
    } catch (error) {
      console.error("addToCart: Error:", error);
      toast.error(error.response?.data?.message || "Error updating cart");
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Update cart quantity
  const updateCartQuantity = async (itemId, quantity) => {
    let cartData = { ...cartItems };
    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = { ...cartData[itemId], quantity };
    }
    setCartItems(cartData);

    if (!token) {
      localStorage.setItem("cartItems", JSON.stringify(cartData));
      toast.success("Cart updated");
      return;
    }

    try {
      const { data } = await axios.post(
        "/api/cart/update",
        { cartData },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      if (data.success) {
        toast.success("Cart updated");
      } else {
        toast.error(data.message || "Failed to update cart");
      }
    } catch (error) {
      console.error("updateCartQuantity: Error:", error);
      toast.error(error.response?.data?.message || "Error updating cart");
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Get cart count
  const getCartCount = () => {
    return Object.values(cartItems).reduce((total, item) => total + (item.quantity > 0 ? item.quantity : 0), 0);
  };

  // Get cart amount
  const getCartAmount = () => {
    const totalAmount = Object.entries(cartItems).reduce((total, [itemId, item]) => {
      const itemInfo = products.find((product) => product._id === itemId);
      const price = item.selectedPrice || itemInfo?.offerPrice || itemInfo?.price || 0;
      return item.quantity > 0 ? total + price * item.quantity : total;
    }, 0);
    return Number(totalAmount.toFixed(2));
  };

  // Logout
  const logout = async () => {
    try {
      console.log("logout: Sending logout request");
      await axios.post("/api/logout", {}, { withCredentials: true });
      console.log("logout: Logout request successful");
      Cookies.remove("token", { path: "/" });
      setToken(null);
      setUser(null);
      setUserData(null);
      setIsSeller(false);
      setCartItems({});
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("logout: Error:", error);
      toast.error("Failed to log out");
    }
  };

  // Merge guest cart
  const mergeGuestCart = async () => {
    const guestCart = JSON.parse(localStorage.getItem("cartItems") || "{}");
    if (Object.keys(guestCart).length > 0) {
      let cartData = { ...cartItems, ...guestCart };
      setCartItems(cartData);
      if (token) {
        try {
          console.log("mergeGuestCart: Merging with token:", token.substring(0, 20) + "...");
          const { data } = await axios.post(
            "/api/cart/update",
            { cartData },
            { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
          );
          if (data.success) {
            localStorage.removeItem("cartItems");
            toast.success("Guest cart merged");
          }
        } catch (error) {
          console.error("mergeGuestCart: Error:", error);
          toast.error(error.response?.data?.message || "Error merging cart");
        }
      }
    }
  };

  // Fetch data on token change
  useEffect(() => {
    if (token) {
      console.log("AppContext: Token changed, fetching data:", token.substring(0, 20) + "...");
      fetchUserData();
      fetchCartData();
      mergeGuestCart();
    } else {
      console.log("AppContext: No token, resetting state");
      setUserData(null);
      setIsSeller(false);
      setCartItems(JSON.parse(localStorage.getItem("cartItems") || "{}"));
    }
  }, [token]);

  // Fetch products on mount
  useEffect(() => {
    fetchProductData();
  }, []);

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
    setUserData,
    fetchUserData,
    fetchCartData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
    isLoadingProducts,
    verifyAuth,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;