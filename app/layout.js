"use client";

import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import ClientProvider from "../components/ClientProvider";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../redux/slices/themeSlice";
import CartAuthSync from "@/components/CartAuthSync";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Hide Navbar/Footer on login, signup, and admin pages
  const hideLayout =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/admin"); // <-- hide for all admin pages

  // Adjust main padding only when navbar is visible
  const mainClassName = hideLayout ? "min-h-screen" : "mt-24 min-h-screen";

  return (
    <html lang="en">
      <body
        className={`text-white bg-gray-900 dark:bg-gray-900 transition-colors duration-300 ${
          hideLayout
            ? "bg-gradient-to-br from-gray-100 via-gray-200 to-white dark:from-gray-900 dark:via-gray-800 dark:to-black"
            : ""
        }`}
      >
        <ClientProvider>
          <ThemeInitializer />
          <CartAuthSync />
          {!hideLayout && <Navbar />}
          <main className={mainClassName}>{children}</main>
          {!hideLayout && <Footer />}
        </ClientProvider>
      </body>
    </html>
  );
}

/**
 * Initializes and applies the saved theme (light/dark) across the app.
 */
function ThemeInitializer() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    dispatch(setTheme(savedTheme));
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, [dispatch]);

  useEffect(() => {
    if (theme) {
      localStorage.setItem("theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  return null;
}
