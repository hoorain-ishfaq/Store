"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronFirst,
  ChevronLast,
  BarChart3,
  ShoppingCart,
  Users,
  Package,
  Home,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleSidebar = () => setIsOpen(!isOpen);
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
    { icon: <Home size={22} />, text: "Home" },
    { icon: <BarChart3 size={22} />, text: "Analytics" },
    { icon: <ShoppingCart size={22} />, text: "Orders" },
    { icon: <Users size={22} />, text: "Customers" },
    { icon: <Package size={22} />, text: "Products" },
  ];

  return (
    <motion.aside
      animate={{ width: isOpen ? 220 : 80 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-900 dark:text-white text-black flex flex-col justify-between p-4 h-screen shadow-md"
    >
      <div>
        <div className="relative flex items-center justify-between mb-6">
          {/* Logo with animation */}
          <motion.div
            animate={{ width: isOpen ? 240 : 40 }}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            {isOpen ? (
              <motion.img
                key="full-logo"
                src="/images/noir-logolarge.jpg"
                alt="Noirwear Logo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-60 h-auto -mt-7 -mb-8 cursor-pointer select-none object-contain"
              />
            ) : (
              <motion.img
                key="small-logo"
                src="/images/n-logosmall.jpg"
                alt="Noirwear Icon"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="w-24 mt-4 left-2 h-auto mx-auto cursor-pointer select-none object-contain"
              />
            )}
          </motion.div>

          {/* Collapse button */}
          {isOpen && (
            <motion.button
              onClick={toggleSidebar}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <ChevronFirst size={24} />
            </motion.button>
          )}
        </div>

        {/* ChevronLast button when sidebar is closed */}
        {!isOpen && (
          <motion.button
            onClick={toggleSidebar}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 left-12 transform -translate-y-1/2 translate-x-1/2 p-2 rounded-r-md 
      dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <ChevronLast size={24} />
          </motion.button>
        )}

        <nav className="flex flex-col gap-3">
          {menuItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              text={item.text}
              isOpen={isOpen}
            />
          ))}
        </nav>
      </div>

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
          className="flex items-center gap-3 p-2 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <LogOut size={22} />
          {isOpen && (
            <span className="text-lg font-light cursor-pointer">
              <strong>Logout</strong>
            </span>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

function SidebarItem({ icon, text, isOpen }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors">
      {icon}
      {isOpen && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}
