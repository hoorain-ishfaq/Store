"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronFirst,
  ChevronLast,
  BarChart3,
  ShoppingCart,
  Settings,
  Package,
  Home,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Sidebar({ setSidebarWidth }) {
  const [isOpen, setIsOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Update theme dynamically
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (setSidebarWidth) setSidebarWidth(!isOpen ? 220 : 80); // Pass width to parent
  };
  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    { icon: <Home size={22} />, text: "Dashboard", path: "/dashboard" },
    { icon: <BarChart3 size={22} />, text: "Analytics", path: "/analytics" },
    { icon: <ShoppingCart size={22} />, text: "Orders", path: "/orders" },
    { icon: <Package size={22} />, text: "Products", path: "/products" },
    { icon: <Settings size={22} />, text: "Settings", path: "/settings" },
  ];

  return (
    <motion.aside
      animate={{ width: isOpen ? 220 : 80 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 dark:text-white text-black flex flex-col justify-between p-4 shadow-md z-50"
    >
      <div>
        {/* Logo */}
        <div className="relative flex items-center justify-between mb-6">
          <motion.div
            animate={{ width: isOpen ? 240 : 40 }}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            {isOpen ? (
              <motion.img
                key="full-logo"
                src="/images/noir-logolarge.jpg"
                alt="Logo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="w-60 h-auto cursor-pointer select-none object-contain"
              />
            ) : (
              <motion.img
                key="small-logo"
                src="/images/n-logosmall.jpg"
                alt="Logo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="w-24 h-auto mx-auto cursor-pointer select-none object-contain"
              />
            )}
          </motion.div>

          {isOpen && (
            <motion.button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <ChevronFirst size={24} />
            </motion.button>
          )}
        </div>
        {!isOpen && (
          <motion.button
            onClick={toggleSidebar}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 -right-3 transform -translate-y-1/2 
               p-2 rounded-md bg-white dark:bg-gray-800 shadow 
               hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <ChevronLast size={24} />
          </motion.button>
        )}

        {/* Menu Items */}
        <nav className="flex flex-col gap-3 mt-4">
          {menuItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              text={item.text}
              path={item.path}
              isOpen={isOpen}
            />
          ))}
        </nav>
      </div>

      {/* Theme + Logout */}
      <div className="flex flex-col gap-3 mt-6">
        <div
          onClick={toggleTheme}
          className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        >
          {darkMode ? <Moon size={22} /> : <Sun size={22} />}
          {isOpen && (
            <span className="text-sm font-medium">
              {darkMode ? "Dark Mode" : "Light Mode"}
            </span>
          )}
        </div>

        <div
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        >
          <LogOut size={22} />
          {isOpen && (
            <span className="text-lg font-light cursor-pointer dark:text-gray-200">
              <strong>Logout</strong>
            </span>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

// SidebarItem Component
function SidebarItem({ icon, text, path, isOpen }) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === path;

  return (
    <div
      onClick={() => router.push(path)}
      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
        isActive
          ? "bg-gray-200 dark:bg-gray-700 font-semibold"
          : "hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
    >
      {icon}
      {isOpen && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}
