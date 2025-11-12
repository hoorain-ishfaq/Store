"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { addItemToCart } from "@/redux/slices/cartSlice"; //  use addItemToCart thunk

export default function ProductDetail({
  product,
  category,
  type = "clothing",
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux theme
  const theme = useSelector((state) => state.theme?.theme || "light");

  // Local states
  const [quantity, setQuantity] = useState(1);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [popupMessage, setPopupMessage] = useState("");

  if (!product) {
    return (
      <div
        className={`${
          theme === "dark" ? "text-white" : "text-black"
        } text-center py-32 text-2xl`}
      >
        Loading product...
      </div>
    );
  }

  // Options
  const options =
    type === "clothing" ? ["S", "M", "L", "XL"] : ["100ml", "150ml", "200ml"];
  const priceMap =
    type === "clothing"
      ? { S: 0, M: 200, L: 350, XL: 500 }
      : { "100ml": 0, "150ml": 500, "200ml": 900 };

  useEffect(() => {
    setSelectedOption(options[0]);
  }, []);

  useEffect(() => {
    if (!product || !selectedOption) return;

    let basePrice =
      typeof product.price === "string"
        ? parseInt(product.price.replace(/Rs\.?\s?/i, "").replace(/,/g, ""))
        : product.price;

    const extraPrice = priceMap[selectedOption] || 0;
    setDisplayPrice(basePrice + extraPrice);
  }, [product, selectedOption]);

  const handleAddToCart = async () => {
    if (!selectedOption) {
      setPopupMessage(
        `Please select a ${type === "clothing" ? "size" : "volume"}!`
      );
      return;
    }

    // Use thunk for adding item
    await dispatch(
      addItemToCart({
        id: product.id,
        name: product.name,
        price: displayPrice,
        quantity,
        option: selectedOption,
        size: selectedOption,
        image: product.image,
        category,
        type,
      })
    );

    setPopupMessage("Item added to cart!");
  };

  // Auto-hide popup
  useEffect(() => {
    if (!popupMessage) return;
    const timer = setTimeout(() => setPopupMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [popupMessage]);

  // Theme classes
  const bgColor =
    theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  const borderColor = theme === "dark" ? "border-gray-500" : "border-gray-300";
  const hoverBorder =
    theme === "dark" ? "hover:border-white" : "hover:border-gray-600";
  const popupBg = theme === "dark" ? "bg-green-600" : "bg-green-400";

  return (
    <div
      className={`${bgColor} min-h-screen -mb-9 flex flex-col sm:flex-row relative transition-colors duration-300`}
    >
      {/* Popup */}
      {popupMessage && (
        <div
          className={`absolute top-5 right-5 ${popupBg} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`}
        >
          {popupMessage}
        </div>
      )}

      {/* Left: Image */}
      <div className="w-full sm:w-1/2 p-6 flex justify-center items-center">
        <div className="relative w-full h-[400px] sm:h-[500px]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            style={{ objectFit: "contain" }}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Right: Info */}
      <div className="w-full sm:w-1/2 p-8 flex flex-col justify-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">
          {product.name}
        </h2>
        <p className="text-lg mb-6 opacity-80">
          {product.description || "High-quality product."}
        </p>
        <p className="text-xl font-bold mb-6">
          Rs. {displayPrice.toLocaleString()}
        </p>

        {/* Option Selector */}
        <p className="font-medium mb-2 text-lg">
          Select {type === "clothing" ? "Size" : "Volume"}:
        </p>
        <div className="flex gap-2 mb-6 flex-wrap">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => setSelectedOption(option)}
              className={`px-5 py-2 rounded-lg border transition-all duration-200 ${borderColor} ${hoverBorder} ${
                selectedOption === option
                  ? theme === "dark"
                    ? "bg-white text-black border-white"
                    : "bg-gray-900 text-white border-gray-900"
                  : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Quantity */}
        <p className="font-medium mb-2 text-lg">Select Quantity:</p>
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className={`px-3 py-1 rounded-lg ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            -
          </button>
          <span className="text-lg">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className={`px-3 py-1 rounded-lg ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            +
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className={`w-1/2 py-4 rounded-lg text-lg border transition-all duration-300 ${
              theme === "dark"
                ? "border-white hover:bg-gray-800"
                : "border-gray-900 hover:bg-gray-100"
            }`}
          >
            Back
          </button>
          <button
            onClick={handleAddToCart}
            className={`w-1/2 font-semibold py-4 rounded-lg text-lg transition-all duration-300 ${
              theme === "dark"
                ? "bg-white text-black hover:bg-gray-300"
                : "bg-gray-900 text-white hover:bg-gray-700"
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
