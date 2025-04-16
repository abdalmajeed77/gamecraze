// app/product/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";

const Product = () => {
  const { id } = useParams();
  const router = useRouter();
  const { products, addToCart, token, isLoadingProducts } = useAppContext();
  const [mainImage, setMainImage] = useState(null);
  const [productData, setProductData] = useState(null);
  const [priceOptions, setPriceOptions] = useState([]);
  const [selectedPriceOption, setSelectedPriceOption] = useState(null);
  const [priceFetchError, setPriceFetchError] = useState(null);

  useEffect(() => {
    if (!isLoadingProducts) {
      const product = products.find((p) => p._id === id);
      setProductData(product);
      if (product && product.imageUrl) {
        setMainImage(product.imageUrl);
      }
    }
  }, [id, products, isLoadingProducts]);

  useEffect(() => {
    if (productData) {
      const fetchPriceOptions = async () => {
        try {
          const response = await fetch(`/api/product/priceOptions?productId=${productData._id}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          if (data.success) {
            setPriceOptions(data.priceOptions || []);
            setSelectedPriceOption(data.priceOptions?.[0] || null);
            setPriceFetchError(null);
          } else {
            throw new Error(data.message || "Failed to fetch price options");
          }
        } catch (error) {
          console.error("Fetch error:", error.message);
          setPriceFetchError(error.message);
          setPriceOptions([]);
          setSelectedPriceOption(null);
        }
      };
      fetchPriceOptions();
    }
  }, [productData]);

  const handlePriceOptionChange = (event) => {
    const selectedIndex = event.target.selectedIndex;
    setSelectedPriceOption(priceOptions[selectedIndex]);
  };

  const handleBuyNow = () => {
    addToCart(productData._id);
    if (!token) {
      localStorage.setItem("intendedRoute", "/cart");
      router.push("/login");
    } else {
      router.push("/cart");
    }
  };

  if (isLoadingProducts) {
    return (
      <>
        <Navbar />
        <Loading />
        <Footer />
      </>
    );
  }

  if (products.length === 0) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">No products available</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!productData) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">Product not found</p>
        </div>
        <Footer />
      </>
    );
  }

  const displayPrice =
    selectedPriceOption?.price ?? productData.offerPrice ?? productData.price ?? 0;

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="px-5 lg:px-16 xl:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4">
              <Image
                src={mainImage || productData.imageUrl || "/default-image.png"}
                alt={productData.name || "Product image"}
                className="w-full h-auto object-cover mix-blend-multiply"
                width={1280}
                height={720}
              />
            </div>
            {productData.imageUrl && (
              <div className="grid grid-cols-4 gap-4">
                <div
                  onClick={() => setMainImage(productData.imageUrl)}
                  className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10"
                >
                  <Image
                    src={productData.imageUrl}
                    alt="Thumbnail"
                    className="w-full h-auto object-cover mix-blend-multiply"
                    width={1280}
                    height={720}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
              {productData.name || "Unnamed Product"}
            </h1>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Image
                  key={index}
                  className="h-4 w-4"
                  src={
                    index < Math.floor(productData.rating || 4.5)
                      ? assets.star_icon
                      : assets.star_dull_icon
                  }
                  alt="star"
                />
              ))}
              <p>({productData.rating?.toFixed(1) || "4.5"})</p>
            </div>
            <p className="text-gray-600 mt-3">
              {productData.description || "No description available"}
            </p>
            <div className="mt-6">
              <p className="text-3xl font-medium">
                ${displayPrice.toFixed(2)}
                {productData.price && productData.price !== displayPrice && (
                  <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                    ${productData.price.toFixed(2)}
                  </span>
                )}
              </p>
              {priceOptions.length > 0 ? (
                <div className="mt-4">
                  <label htmlFor="price-options" className="block text-gray-600 font-medium">
                    Select Price Option
                  </label>
                  <select
                    id="price-options"
                    value={selectedPriceOption ? selectedPriceOption.price : ""}
                    onChange={handlePriceOptionChange}
                    className="mt-2 p-2 border rounded w-full max-w-xs"
                  >
                    {priceOptions.map((option, index) => (
                      <option key={index} value={option.price}>
                        {option.description}: ${option.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : priceFetchError ? (
                <p className="mt-4 text-red-500">
                  {priceFetchError}. Using default price.
                </p>
              ) : (
                <p className="mt-4 text-gray-600">Loading price options...</p>
              )}
            </div>
            <hr className="bg-gray-600 my-6" />
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72">
                <tbody>

                </tbody>
              </table>
            </div>
            <div className="flex items-center mt-10 gap-4">
              <button
                onClick={() => addToCart(productData._id)}
                className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-4 mt-16">
            <p className="text-3xl font-medium">
              Featured <span className="font-medium text-orange-600">Products</span>
            </p>
            <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
            {products.slice(0, 5).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <button
            onClick={() => router.push("/all-products")}
            className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
          >
            See More
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;