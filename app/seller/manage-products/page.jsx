"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    priceOptions: [],
  });
  const [newPriceOption, setNewPriceOption] = useState({ price: "", description: "" });
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products");
        console.log("API Response:", response.data);

        if (response.data && response.data.success) {
          const fetchedProducts = response.data.data || [];
          setProducts(fetchedProducts);
          setFilteredProducts(fetchedProducts); // Initialize filtered products
        } else if (response.data && response.data.message) {
          toast.error(response.data.message);
        } else {
          toast.error("Unexpected response from server");
        }
      } catch (error) {
        console.error("Fetch error:", error.response || error);
        toast.error("Failed to fetch products: " + (error.response?.data?.message || error.message));
      }
    };
    fetchProducts();
  }, []);

  // Handle "Press" action (placeholder functionality)
  const handlePress = (product) => {
    console.log("Press action for product:", product);
    toast.success(`Pressed product: ${product.name}`);
  };

  // Handle editing a product
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      price: product.price || 0,
      priceOptions: product.priceOptions.map((option) => ({
        ...option,
        _id: option._id || undefined,
      })),
    });
    setNewPriceOption({ price: "", description: "" });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle price option changes
  const handlePriceOptionChange = (index, field, value) => {
    const updatedPriceOptions = [...formData.priceOptions];
    updatedPriceOptions[index] = {
      ...updatedPriceOptions[index],
      [field]: field === "price" ? parseFloat(value) || 0 : value,
    };
    setFormData((prev) => ({ ...prev, priceOptions: updatedPriceOptions }));
  };

  // Add a new price option
  const handleAddPriceOption = () => {
    if (!newPriceOption.price || !newPriceOption.description) {
      toast.error("New price option must have a price and description");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      priceOptions: [
        ...prev.priceOptions,
        {
          price: parseFloat(newPriceOption.price) || 0,
          description: newPriceOption.description,
        },
      ],
    }));
    setNewPriceOption({ price: "", description: "" });
  };

  // Remove a price option
  const handleRemovePriceOption = (index) => {
    const updatedPriceOptions = formData.priceOptions.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, priceOptions: updatedPriceOptions }));
  };

  // Update product (triggered by "Press" button)
  const handlePressUpdate = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product to update");
      return;
    }

    if (formData.priceOptions.length === 0) {
      toast.error("At least one price option is required");
      return;
    }

    try {
      const updateData = new FormData();
      updateData.append("productId", selectedProduct._id);
      if (formData.name) updateData.append("name", formData.name);
      if (formData.description) updateData.append("description", formData.description);
      if (formData.category) updateData.append("category", formData.category);
      if (formData.price) updateData.append("price", formData.price);

      // Append price options as arrays
      formData.priceOptions.forEach((option) => {
        updateData.append("priceOptionIds[]", option._id || "");
        updateData.append("priceOptionPrices[]", option.price || 0);
        updateData.append("priceOptionDescriptions[]", option.description || "");
      });

      const response = await axios.put("/api/products", updateData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setSelectedProduct(null);
        setFormData({
          name: "",
          description: "",
          category: "",
          price: 0,
          priceOptions: [],
        });
        setNewPriceOption({ price: "", description: "" });
        const updatedResponse = await axios.get("/api/products");
        const updatedProducts = updatedResponse.data.data || [];
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts); // Update filtered products after edit
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to update product: " + (error.response?.data?.message || error.message));
    }
  };

  // Handle delete
  const handleDelete = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await axios.delete("/api/products", {
          data: { productId },
        });
        if (response.data.success) {
          toast.success(response.data.message);
          const updatedProducts = products.filter((product) => product._id !== productId);
          setProducts(updatedProducts);
          setFilteredProducts(updatedProducts); // Update filtered products after delete
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("Failed to delete product: " + (error.response?.data?.message || error.message));
      }
    }
  };

  // Handle category filter change
  const handleCategoryFilter = (e) => {
    const value = e.target.value;
    setCategoryFilter(value);
    applyFilters(value, searchQuery);
  };

  // Handle search query change
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    applyFilters(categoryFilter, value);
  };

  // Apply filters to products
  const applyFilters = (category, search) => {
    let updatedProducts = [...products];

    if (category) {
      updatedProducts = updatedProducts.filter(
        (product) => product.category === category
      );
    }

    if (search) {
      updatedProducts = updatedProducts.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredProducts(updatedProducts);
  };

  // Get unique categories for the filter dropdown
  const uniqueCategories = [
    ...new Set(products.map((product) => product.category)),
  ].filter(Boolean); // Remove undefined or null categories

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold text-gold-600 mb-6">Manage Products</h1>

      {/* Filter and Search Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <select
          value={categoryFilter}
          onChange={handleCategoryFilter}
          className="w-full md:w-1/3 p-2 bg-gold-50 text-gold-600 rounded border border-gold-200"
        >
          <option value="">All Categories</option>
          {uniqueCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by product name..."
          className="w-full md:w-2/3 p-2 bg-gold-50 text-gold-600 rounded border border-gold-200"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
        {filteredProducts.length === 0 ? (
          <p className="text-gold-600">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gold-600">
              <thead>
                <tr className="bg-gold-100">
                  <th className="p-3">Name</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-gold-700">Price Options</th>
                  <th className="p-3">Base Price</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Image</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gold-200">
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">{product.description}</td>
                    <td className="p-3">
                      {product.priceOptions.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {product.priceOptions.map((option, index) => (
                            <li key={index} className="text-gold-700">
                              ${option.price.toFixed(2)} - {option.description}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gold-600">No price options available.</p>
                      )}
                    </td>
                    <td className="p-3">${product.price.toFixed(2)}</td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        "No image"
                      )}
                    </td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Product Form */}
      {selectedProduct && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gold-600 mb-4">
            Editing Product: {selectedProduct.name}
          </h2>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-gold-700 font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 bg-gold-50 text-gold-600 rounded border border-gold-200"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gold-700 font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 bg-gold-50 text-gold-600 rounded border border-gold-200"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-gold-700 font-medium mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 bg-gold-50 text-gold-600 rounded border border-gold-200"
              />
            </div>

            {/* Base Price */}
            <div>
              <label className="block text-gold-700 font-medium mb-1">Base Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-2 bg-gold-50 text-gold-600 rounded border border-gold-200"
                step="0.01"
              />
            </div>

            {/* Current Price Options */}
            <div>
              <label className="block text-gold-700 font-medium mb-1">Current Price Options</label>
              {formData.priceOptions.length > 0 ? (
                <ul className="list-disc pl-5 mb-4">
                  {formData.priceOptions.map((option, index) => (
                    <li key={index} className="text-gold-700 flex justify-between items-center mb-2">
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={option.price || 0}
                          onChange={(e) => handlePriceOptionChange(index, "price", e.target.value)}
                          className="w-1/3 p-2 bg-gold-50 text-gold-600 rounded border border-gold-200"
                          step="0.01"
                        />
                        <input
                          type="text"
                          value={option.description || ""}
                          onChange={(e) => handlePriceOptionChange(index, "description", e.target.value)}
                          className="w-2/3 p-2 bg-gold-50 text-gold-600 rounded border border-gold-200"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePriceOption(index)}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gold-600">No price options available.</p>
              )}
            </div>

            {/* Add New Price Option */}
            <div>
              <label className="block text-gold-700 font-medium mb-1">Add New Price Option</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="number"
                  value={newPriceOption.price}
                  onChange={(e) => setNewPriceOption((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="Price Value"
                  className="w-1/3 p-2 bg-gold-50 text-gold-600 rounded border border-gold-200"
                  step="0.01"
                />
                <input
                  type="text"
                  value={newPriceOption.description}
                  onChange={(e) => setNewPriceOption((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description (e.g., Small Size)"
                  className="w-2/3 p-2 bg-gold-50 text-gold-600 rounded border border-gold-200"
                />
              </div>
              <button
                type="button"
                onClick={handleAddPriceOption}
                className="bg-gold-600 text-white px-3 py-1 rounded hover:bg-gold-700"
              >
                Add Price Option
              </button>
            </div>

            <button
              type="button"
              onClick={handlePressUpdate}
              className="w-full py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700"
            >
              Press to Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedProduct(null);
                setFormData({
                  name: "",
                  description: "",
                  category: "",
                  price: 0,
                  priceOptions: [],
                });
                setNewPriceOption({ price: "", description: "" });
              }}
              className="w-full py-2 bg-gray-600 text-white font-medium rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const config = {
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#FDF6E3",
          100: "#FBEAC5",
          200: "#F9DD9B",
          600: "#D4A017",
          700: "#B78C14",
        },
      },
    },
  },
};

export default ManageProducts;