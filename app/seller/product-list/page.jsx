'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";

const ProductList = () => {
    const { router, getToken, user } = useAppContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSellerProducts = async () => {
        try {
            setLoading(true);
            const token = await getToken();  // Assumes getToken returns the token string
            if (!token) {
                throw new Error("No authentication token found. Please log in.");
            }
            const response = await axios.get('/api/product/list', { 
                headers: { Authorization: `Bearer ${token}` } 
            });

            if (response.data && response.data.success) {
                setProducts(response.data.products || []);
            } else {
                toast.error(response.data.message || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            if (error.response?.status === 401) {
                router.push('/login');  // Redirect to login if unauthorized
                toast.error('Session expired. Please log in again.');
            } else {
                toast.error(error.message || 'An error occurred while fetching products');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchSellerProducts();
        }
    }, [user]);

    if (loading) return <Loading />;

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between">
            <div className="w-full md:p-10 p-4">
                <h2 className="pb-4 text-lg font-medium">All Products</h2>
                {products.length === 0 ? (
                    <div className="text-center py-10">
                        <p>No products found.</p>
                        <button 
                            onClick={() => router.push('/seller/add-product')} 
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Add Your First Product
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                        <table className="table-fixed w-full overflow-hidden">
                            <thead className="text-gray-900 text-sm text-left">
                                <tr>
                                    <th className="w-2/3 md:w-2/5 px-4 py-3 font-medium truncate">Product</th>
                                    <th className="px-4 py-3 font-medium truncate max-sm:hidden">Category</th>
                                    <th className="px-4 py-3 font-medium truncate">Price</th>
                                    <th className="px-4 py-3 font-medium truncate max-sm:hidden">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-500">
                                {products.map((product) => (
                                    <tr key={product._id} className="border-t border-gray-500/20">
                                        <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                                            <div className="bg-gray-500/10 rounded p-2">
                                                <Image
                                                    src={Array.isArray(product.image) && product.image.length > 0 ? product.image[0] : '/placeholder.jpg'}
                                                    alt={product.name}
                                                    className="w-16 h-16 object-cover"
                                                    width={64}
                                                    height={64}
                                                />
                                            </div>
                                            <span className="truncate w-full">{product.name}</span>
                                        </td>
                                        <td className="px-4 py-3 max-sm:hidden">{product.category}</td>
                                        <td className="px-4 py-3">${product.price}</td>
                                        <td className="px-4 py-3 max-sm:hidden">
                                            <button 
                                                onClick={() => router.push(`/product/${product._id}`)} 
                                                className="flex items-center gap-1 px-1.5 md:px-3.5 py-2 bg-orange-600 text-white rounded-md"
                                                aria-label="Visit product page"
                                            >
                                                <span className="hidden md:block">Visit</span>
                                                <Image
                                                    className="h-3.5 w-3.5"
                                                    src={assets.redirect_icon}
                                                    alt="Redirect icon"
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ProductList;