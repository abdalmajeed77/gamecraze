'use client';
import { useEffect, useState } from 'react';
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AllProducts = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/product/list');
                const data = await response.json();
                if (data.success) {
                    setProducts(data.products); // Access the products array correctly
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError('Failed to fetch products');
            }
        };

        fetchProducts();
    }, []);

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
                <div className="flex flex-col items-end pt-12">
                    <p className="text-2xl font-medium">All products</p>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-12 pb-14 w-full">
                    {error ? (
                        <p>{error}</p>
                    ) : products && products.length > 0 ? (
                        products.map((product, index) => <ProductCard key={index} product={product} />)
                    ) : (
                        <p>No products available.</p>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AllProducts;