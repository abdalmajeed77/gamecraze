"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import AppContextProvider, { useAppContext } from "../context/AppContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppContextProvider>
          <AuthWrapper>{children}</AuthWrapper>
        </AppContextProvider>
      </body>
    </html>
  );
}

const AuthWrapper = ({ children }) => {
  const { requireAuth } = useAppContext();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const publicRoutes = [
    "/",
    "/all-products",
    "/register",
    "/login",
    "/forgot-password",
    "/seller",
  ];

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      if (
        publicRoutes.includes(pathname) ||
        pathname.startsWith("/product/") ||
        pathname.startsWith("/seller")
      ) {
        setIsCheckingAuth(false);
        return;
      }
      await requireAuth(pathname);
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [pathname]);

  if (
    isCheckingAuth &&
    !publicRoutes.includes(pathname) &&
    !pathname.startsWith("/product/") &&
    !pathname.startsWith("/seller")
  ) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};