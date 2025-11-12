"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  //  Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  //  Fetch all product data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categories = ["men", "women", "kids", "perfume"];
        const allData = [];

        for (const cat of categories) {
          const snap = await getDocs(collection(db, `products/catalog/${cat}`));
          const docs = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            category: cat,
          }));
          allData.push(...docs);
        }

        setAllProducts(allData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchData();
  }, []);

  if (!mounted) return null;

  const fuse = new Fuse(allProducts, {
    keys: ["name"],
    threshold: 0.2,
  });

  const results = query
    ? fuse
        .search(query)
        .map((res) => res.item)
        .slice(0, 6)
    : [];

  const handleSelect = (item) => {
    setQuery("");
    router.push(`/category/${item.category}/${item.id}`);
  };

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto px-2 sm:px-0">
      {/*  Search Input */}
      <input
        type="text"
        placeholder="Search for products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md border border-gray-300 dark:border-gray-700
                   bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base
                   focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />

      {/*  Results Dropdown */}
      {query && (
        <ul
          className="absolute left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 
                     dark:border-gray-700 mt-2 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto
                     text-xs sm:text-sm md:text-base"
        >
          {results.length > 0 ? (
            results.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                className="px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 
                           hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded object-cover flex-shrink-0"
                />
                <div className="flex flex-col">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 capitalize text-xs sm:text-sm">
                    {item.category}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
              No results found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
