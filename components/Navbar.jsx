"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ThemeToggle from "./ThemeToggle";
import { ShoppingCart, User, Menu, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { removeItemFromCart } from "../redux/slices/cartSlice";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { motion, AnimatePresence } from "framer-motion";

const SearchBar = dynamic(() => import("./SearchBar"), { ssr: false });

export default function Navbar({ onToggle }) {
  const [showCart, setShowCart] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentUser = useCurrentUser();
  const cartItems = useSelector((state) => state.cart.items || []);
  const totalItems = cartItems.length;
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const isAdmin = currentUser?.isAdmin === true;

  useEffect(() => {
    if (typeof onToggle === "function") onToggle(sidebarOpen);
  }, [sidebarOpen, onToggle]);

  useEffect(() => {
    if (!currentUser || !pathname) return;
    if (isAdmin && pathname.startsWith("/user")) router.push("/admin");
    else if (!isAdmin && pathname.startsWith("/admin")) router.push("/login");
  }, [currentUser, isAdmin, pathname, router]);

  useEffect(() => {
    if (isAdmin) setShowCart(false);
  }, [isAdmin]);

  const handleDeleteItem = (item) => {
    if (!item) return;
    dispatch(removeItemFromCart(item));
    setShowDeleteConfirm(false);
  };

  const sidebarOptions = [
    { label: "Kids", path: "/kids" },
    { label: "Men", path: "/men" },
    { label: "Women", path: "/women" },
    { label: "Perfume", path: "/perfume" },
  ];

  const handleSidebarClick = (path) => {
    router.push(path);
    setSidebarOpen(false);
  };

  const handleCheckout = () => {
    setShowCart(false);
    router.push("/checkout");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-between px-6 py-6 z-50 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Menu icon visible but disabled for admin */}
          <button
            onClick={() => {
              if (!isAdmin) setSidebarOpen((s) => !s);
            }}
            aria-label="Toggle sidebar"
            className={`p-2 rounded transition ${
              isAdmin
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            disabled={isAdmin}
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <div
            onClick={() => router.push("/")}
            className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent cursor-pointer"
          >
            ղօíɾաҽαɾ
          </div>
        </div>

        {/* Search bar only for user */}
        <div className="flex-1 mx-6 hidden md:flex justify-center">
          {currentUser && !isAdmin && <SearchBar />}
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-5">
          <ThemeToggle />

          {/* Cart (user only) */}
          {currentUser && !isAdmin && (
            <div
              className="relative cursor-pointer"
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart
                size={22}
                className="text-gray-600 dark:text-gray-300 hover:text-green-500 transition"
              />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </div>
          )}

          {/* User icon */}
          <User
            size={22}
            className="text-gray-600 dark:text-gray-300 hover:text-yellow-400 transition cursor-pointer"
            onClick={() => {
              if (!currentUser) router.push("/login");
              else if (isAdmin) router.push("/admin");
              else router.push("/user");
            }}
          />
        </div>
      </nav>

      {/* Sidebar (user only) */}
      <AnimatePresence>
        {currentUser && !isAdmin && sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-800 z-40"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Menu
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col space-y-1 mt-4">
              {sidebarOptions.map((option) => (
                <button
                  key={option.path}
                  onClick={() => handleSidebarClick(option.path)}
                  className="text-left px-6 py-4 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-base font-medium"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      {currentUser && !isAdmin && showCart && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowCart(false)}
          />
          <div className="fixed top-0 right-0 w-full sm:w-96 h-full bg-white dark:bg-gray-800 shadow-2xl p-6 overflow-y-auto z-50 rounded-l-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
                Your Cart
              </h2>
              {cartItems.length === 0 ? (
                <p className="text-black dark:text-white text-center mt-20 text-lg">
                  Your cart is empty 🛍️
                </p>
              ) : (
                <div className="space-y-5">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.id}-${item.color}-${item.size}`}
                      className="flex items-start justify-between border-b pb-4 border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-semibold text-lg text-black dark:text-white">
                            {item.name}
                          </h3>
                          {item.color && (
                            <p className="text-sm text-black dark:text-white">
                              Color: {item.color}
                            </p>
                          )}
                          {item.size && (
                            <p className="text-sm text-black dark:text-white">
                              Size: {item.size}
                            </p>
                          )}
                          <p className="text-sm text-black dark:text-white">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold mt-1 text-black dark:text-white">
                            Rs {item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setItemToDelete(item);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between mb-4 text-black dark:text-white font-semibold text-lg">
                  <span>Total:</span>
                  <span>Rs {totalPrice}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-md font-semibold"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 p-6 w-80">
            <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
              Confirm Delete
            </h3>
            <p className="mb-6 text-black dark:text-gray-300">
              Are you sure you want to remove this item?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-black dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(itemToDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
