"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Slider from "react-slick";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useSelector } from "react-redux";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Custom arrows for react-slick
const NextArrow = ({ onClick }) => (
  <div
    className="absolute top-1/3 -right-5 z-10 cursor-pointer text-gray-400 hover:text-white transition"
    onClick={onClick}
  >
    <ChevronRight size={32} />
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div
    className="absolute top-1/3 -left-5 z-10 cursor-pointer text-gray-400 hover:text-white transition"
    onClick={onClick}
  >
    <ChevronLeft size={32} />
  </div>
);

export default function HomePage() {
  const router = useRouter();
  const [menCollection, setMenCollection] = useState([]);
  const [womenCollection, setWomenCollection] = useState([]);
  const [kidsCollection, setKidsCollection] = useState([]);
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sidebar state from Redux
  const sidebarOpen = useSelector((state) => state.ui?.sidebarOpen || false);

  const videos = [
    "/videos/Men.mp4",
    "/videos/Women.mp4",
    "/videos/Kids.mp4",
    "/videos/Perfumes.mp4",
  ];
  const [currentVideo, setCurrentVideo] = useState(0);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const menSnap = await getDocs(collection(db, "products/catalog/men"));
        const womenSnap = await getDocs(
          collection(db, "products/catalog/women")
        );
        const kidsSnap = await getDocs(collection(db, "products/catalog/kids"));
        const perfumeSnap = await getDocs(
          collection(db, "products/catalog/perfume")
        );

        setMenCollection(
          menSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setWomenCollection(
          womenSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setKidsCollection(
          kidsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setPerfumes(
          perfumeSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto video change
  useEffect(() => {
    const interval = setInterval(() => handleNext(), 6000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () =>
    setCurrentVideo((prev) => (prev + 1) % videos.length);
  const handlePrev = () =>
    setCurrentVideo((prev) => (prev - 1 + videos.length) % videos.length);

  // Slider settings
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  // Product Card Component
  const ProductCard = ({ item, category }) => (
    <div className="rounded-lg overflow-hidden shadow-lg hover:scale-105 transition transform duration-300 bg-gray-100 dark:bg-gray-800">
      <div className="w-full h-64 sm:h-72 bg-gray-200 dark:bg-gray-700 flex justify-center items-center">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <h3 className="text-lg font-semibold">{item.name}</h3>
        <p className="mt-2 text-gray-700 dark:text-gray-300 font-medium">
          Rs. {item.price}
        </p>
        <button
          className="mt-4 bg-gray-800 dark:bg-gray-600 text-white py-2 rounded-md font-medium hover:bg-gray-900 dark:hover:bg-gray-700 transition w-full"
          onClick={() => router.push(`category/${category}/${item.id}`)}
        >
          Buy Now
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`transition-all duration-300 ml-0 -mb-4 -mt-4 pt-0 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white`}
    >
      {/* ===== Video Section ===== */}
      <div className="relative w-full h-[calc(100vh-72px)] overflow-hidden">
        {videos.map((video, index) => (
          <video
            key={index}
            src={video}
            autoPlay
            loop
            muted
            playsInline
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${
              index === currentVideo ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl sm:text-6xl text-white font-bold mb-4 tracking-wide">
            Collection 2025
          </h1>
          <p className="text-lg sm:text-2xl mb-8 text-gray-200 dark:text-gray-200">
            Stay warm, stylish & confident
          </p>
          <button
            className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition"
            onClick={() => router.push("/men")}
          >
            Shop Now
          </button>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <button
            onClick={handlePrev}
            className="bg-black/40 hover:bg-black/70 p-3 rounded-full transition"
          >
            <ChevronLeft size={36} />
          </button>
          <button
            onClick={handleNext}
            className="bg-black/40 hover:bg-black/70 p-3 rounded-full transition"
          >
            <ChevronRight size={36} />
          </button>
        </div>
      </div>

      {/* ===== Products Section ===== */}
      {loading ? (
        <div className="w-full py-32 flex justify-center items-center text-xl text-gray-500 dark:text-gray-300">
          Loading Products...
        </div>
      ) : (
        <>
          {/* Men Collection */}
          <section className="py-8 px-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Men Collection</h2>
              <button
                onClick={() => router.push("/men")}
                className="px-4 py-2 rounded bg-gray-800 dark:bg-gray-600 text-white hover:bg-gray-700 dark:hover:bg-gray-700 transition"
              >
                View All
              </button>
            </div>
            <Slider {...sliderSettings}>
              {menCollection.map((item) => (
                <div key={item.id} className="p-2">
                  <ProductCard item={item} category="men" />
                </div>
              ))}
            </Slider>
          </section>

          {/* Women Collection */}
          <section className="py-8 px-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Women Collection</h2>
              <button
                onClick={() => router.push("/women")}
                className="px-4 py-2 rounded bg-gray-800 dark:bg-gray-600 text-white hover:bg-gray-700 dark:hover:bg-gray-700 transition"
              >
                View All
              </button>
            </div>
            <Slider {...sliderSettings}>
              {womenCollection.map((item) => (
                <div key={item.id} className="p-2">
                  <ProductCard item={item} category="women" />
                </div>
              ))}
            </Slider>
          </section>

          {/* Kids Collection */}
          <section className="py-8 px-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Kids Collection</h2>
              <button
                onClick={() => router.push("/kids")}
                className="px-4 py-2 rounded bg-gray-800 dark:bg-gray-600 text-white hover:bg-gray-700 dark:hover:bg-gray-700 transition"
              >
                View All
              </button>
            </div>
            <Slider {...sliderSettings}>
              {kidsCollection.map((item) => (
                <div key={item.id} className="p-2">
                  <ProductCard item={item} category="kids" />
                </div>
              ))}
            </Slider>
          </section>

          {/* Perfume Collection */}
          <section className="py-8 px-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Perfume Collection</h2>
              <button
                onClick={() => router.push("/perfume")}
                className="px-4 py-2 rounded bg-gray-800 dark:bg-gray-600 text-white hover:bg-gray-700 dark:hover:bg-gray-700 transition"
              >
                View All
              </button>
            </div>
            <Slider {...sliderSettings}>
              {perfumes.map((item) => (
                <div key={item.id} className="p-2">
                  <ProductCard item={item} category="perfume" />
                </div>
              ))}
            </Slider>
          </section>
        </>
      )}
    </div>
  );
}
