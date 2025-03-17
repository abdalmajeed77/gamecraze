'use client'

import axios from 'axios';
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
}

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});

const fetchProductData = async () => {
  console.log("Fetching product data..."); // Debugging log

    try {
      const { data } = await axios.get('/api/product/list');
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data?.message || "Failed to fetch products");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching products");
    }
  };

const fetchUserData = async () => {
  console.log("Fetching user data..."); // Debugging log

    try {
      if (user.publicMetadata.role === 'seller') {
        setIsSeller(true);
      }
      const tokenResponse = await getToken();
      const token = tokenResponse?.token;
      if (!token) {
        throw new Error("Failed to retrieve token");
      }
      const { data } = await axios.get('/api/user/data', { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setUserData(data.user);
        setCartItems(data.user.cartItems);
      } else {
        toast.error(data.message || "Failed to fetch user data");
      }
    } catch (error) {
      toast.error(error.response.data.message || "Error fetching user data");
    }
  };

  const addToCart = async (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    if (user) {
      try {
        const tokenResponse = await getToken();
        const token = tokenResponse?.token;
        const { data } = await axios.post('/api/cart/update', { cartData }, { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) {
          toast.success('Item added to cart');
        } else {
          toast.error(data.message || "Failed to update cart");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Error updating cart");
      }
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    if (quantity === 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
    if (user) {
      try {
        const tokenResponse = await getToken();
        const token = tokenResponse?.token;
        const { data } = await axios.post('/api/cart/update', { cartData }, { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) {
          toast.success('Cart Updated');
        } else {
          toast.error(data.message || "Failed to update cart");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Error updating cart");
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const key in cartItems) {
      if (cartItems[key] > 0) {
        totalCount += cartItems[key];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const key in cartItems) {
      const itemInfo = products.find((product) => product._id === key);
      if (itemInfo && cartItems[key] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[key];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const value = {
    user, getToken,
    currency, router,
    isSeller, setIsSeller,
    userData, fetchUserData,
    products, fetchProductData,
    cartItems, setCartItems,
    addToCart, updateCartQuantity,
    getCartCount, getCartAmount
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
