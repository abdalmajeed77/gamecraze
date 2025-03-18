
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

const CategoryBar = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("/api/product/categories");
        if (data.success) {
          setCategories(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="bg-gray-200 py-2 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-4">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500">No categories available</p>
        ) : (
          categories.map((category, index) => (
            <Link
              key={index}
              href={`/products?category=${encodeURIComponent(category)}`}
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-200"
            >
              {category}
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryBar;