'use client'
import React, { useState } from "react";
import PriceOptions from "@/components/PriceOptions"; // Importing PriceOptions component

import { assets } from "@/assets/assets"; // Importing assets

import Image from "next/image";
import { useAppContext } from "@/context/AppContext"; // Importing AppContext

import axios from "axios";
import toast from "react-hot-toast";

const AddProduct = () => {
  const { getToken } = useAppContext();

  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Earphone');
const [priceOptions, setPriceOptions] = useState([{ price: '', description: '' }]); // Initialize priceOptions
const [imageUrl, setImageUrl] = useState(''); // Initialize imageUrl
const [price, setPrice] = useState(''); // Initialize price


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (priceOptions.some(option => !option.price || !option.description)) {
      toast.error("All price options must be filled out.");
      return;
    }

    const formData = new FormData();

    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', category);
        formData.append('price', price); // Append price
        formData.append('imageUrl', imageUrl); // Append imageUrl
        priceOptions.forEach((option) => {
            formData.append('priceOptions[]', option.price); // Append price options as individual fields
            formData.append('priceOptions[]', option.description);


    });

    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    try {
      const { token } = await getToken();
      const { data } = await axios.post('/api/product/add', formData, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success(data.message);
        setFiles([]);
        setName('');
        setDescription('');
        setCategory('');
        setPriceOptions([{ price: '', description: '' }]); // Reset price options
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input onChange={(e) => {
                  const updatedFiles = [...files];
                  updatedFiles[index] = e.target.files[0];
                  setFiles(updatedFiles);
                }} type="file" id={`image${index}`} hidden />
                <Image
                  key={index}
                  className="max-w-24 cursor-pointer"
                  src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area}
                  alt=""
                  width={100}
                  height={100}
                />
              </label>
            ))}
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
            defaultValue={category}
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
