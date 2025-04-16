'use client'
import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const OrderPlaced = () => {
  const { router } = useAppContext();
  const [countdown, setCountdown] = useState(5); // Countdown timer

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/my-orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [router]);

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-5">
      <div className="flex justify-center items-center relative">
        <Image className="absolute p-5" src={assets.checkmark} alt="checkmark" />
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-300 border-gray-200"></div>
      </div>
      <div className="text-center text-2xl font-semibold">Order Placed Successfully</div>
      <p className="text-gray-500">Redirecting to My Orders in {countdown} seconds...</p>
      <button
        onClick={() => router.push('/my-orders')}
        className="mt-2 text-orange-600 underline"
      >
        Go to My Orders Now
      </button>
    </div>
  );
};

export default OrderPlaced;