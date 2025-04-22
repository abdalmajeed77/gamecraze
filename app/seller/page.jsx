'use client'
import React, { useState } from "react";
import PriceOptions from "@/components/PriceOptions";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const AddProduct = () => {
  const { token } = useAppContext(); // Use token directly instead of getToken

  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('GamePass');
  const [priceOptions, setPriceOptions] = useState([{ price: '', description: '' }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (priceOptions.some(option => !option.price || !option.description)) {
      toast.error("All price options must have a price and description.");
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', category);
    priceOptions.forEach((option) => {
      formData.append('priceOptions[]', option.price);
      formData.append('priceOptions[]', option.description);
    });

    if (files[0]) {
      formData.append('images', files[0]);
    } else {
      toast.error("Please upload an image.");
      return;
    }

    // Log FormData entries for debugging
    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      if (!token) {
        toast.error("Please log in to add a product.");
        return;
      }
      console.log("Using token:", token.substring(0, 20) + "...");
      const { data } = await axios.post('/api/product/add', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (data.success) {
        toast.success(data.message);
        setFiles([]);
        setName('');
        setDescription('');
        setCategory('GamePass');
        setPriceOptions([{ price: '', description: '' }]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Frontend error:", error);
      toast.error(error.response?.data?.message || "Failed to add product.");
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <label htmlFor="image0">
              <input
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setFiles([e.target.files[0]]);
                    console.log("Selected image:", e.target.files[0].name);
                  }
                }}
                type="file"
                id="image0"
                hidden
                accept="image/*"
              />
              <Image
                className="max-w-24 cursor-pointer"
                src={files[0] ? URL.createObjectURL(files[0]) : assets.upload_area}
                alt=""
                width={100}
                height={100}
              />
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-description">
            Product Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          ></textarea>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            required
          >
            <option value="GamePass">Game Pass</option>
            <option value="GiftCards">Gift Cards</option>
            <option value="Subscriptions">Subscriptions</option>
            <option value="DLCs">DLCs (Downloadable Content)</option>
            <option value="GamingAccessories">Gaming Accessories</option>
            <option value="GameKeys">Game Keys</option>
          </select>
        </div>
        <PriceOptions priceOptions={priceOptions} setPriceOptions={setPriceOptions} />
        <button type="submit" className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded">
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddProduct;