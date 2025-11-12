"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Pagination } from "antd";
import "antd/dist/reset.css"; // ✅ Make sure this is included for pagination styling

export default function FragrancePage() {
  const router = useRouter();
  const sectionRef = useRef(null);
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8; // ✅ number of perfumes per page

  //  Fetch perfume data from Firestore
  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        const perfumeCollectionRef = collection(
          db,
          "products",
          "catalog",
          "perfume"
        );
        const querySnapshot = await getDocs(perfumeCollectionRef);
        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPerfumes(products);
      } catch (error) {
        console.error("🔥 Error fetching perfume products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfumes();
  }, []);

  //  Navigate to perfume detail page
  const handleSelectItem = (item) => {
    router.push(`/category/perfume/${item.id}`);
  };

  //  Smooth scroll
  const scrollToProducts = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle page change
  const onPageChange = (page) => {
    setCurrentPage(page);
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Paginated perfumes
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPerfumes = perfumes.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-background text-foreground transition-colors duration-300 min-h-screen -mt-4 -mb-6">
      {/* =====  Hero Video Section ===== */}
      <div className="relative w-full h-screen overflow-hidden">
        <video
          src="/videos/fragnance.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/60 dark:bg-black/60 flex flex-col justify-center items-center text-center px-6">
          <motion.h1
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-5xl sm:text-6xl font-bold mb-4 text-white"
          >
            Fragrance Collection 2025
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg sm:text-2xl mb-8 text-gray-200"
          >
            Discover your signature scent ✨
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToProducts}
            className="bg-foreground text-background font-semibold px-6 py-3 rounded-lg shadow-lg hover:opacity-80 transition"
          >
            Explore Perfumes
          </motion.button>
        </div>
      </div>

      {/* =====  Perfume Collection Section ===== */}
      <section
        ref={sectionRef}
        className="py-20 px-6 sm:px-12 bg-gray-100 dark:bg-gray-900 transition-colors duration-300"
      >
        <h2 className="text-3xl font-bold mb-10 text-center">
          Our Exclusive Scents
        </h2>

        {loading ? (
          <p className="text-center">Loading perfumes...</p>
        ) : perfumes.length === 0 ? (
          <p className="text-center text-gray-500">No perfumes found.</p>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {paginatedPerfumes.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all flex flex-col"
                >
                  {/* Product Image */}
                  <div className="w-full h-64 sm:h-72 bg-gray-200 dark:bg-gray-700 flex justify-center items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain rounded-t-lg"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      {item.description && (
                        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-3 font-bold text-lg">
                        Rs. {item.price?.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectItem(item)}
                      className="mt-4 bg-gray-800 dark:bg-gray-600 text-white py-2 rounded-md font-medium hover:bg-gray-900 dark:hover:bg-gray-700 transition"
                    >
                      Buy Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ===== Pagination ===== */}
            <div className="flex justify-center mt-16">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={perfumes.length}
                onChange={onPageChange}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
