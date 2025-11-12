"use client";
import { useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/slices/cartSlice"; // updated import

export default function AddToCartModal({ item, closeModal }) {
  const dispatch = useDispatch();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  const selectedColor = item.colors[selectedColorIndex];

  const handleAdd = () => {
    // Dispatch Redux thunk that handles both guest and logged-in users
    dispatch(
      addItemToCart({
        id: item.id,
        name: item.name,
        image: selectedColor.image,
        color: selectedColor.name,
        size: selectedSize,
        price: item.price,
        quantity,
      })
    );
    closeModal();
  };

  const prevColor = () => {
    setSelectedColorIndex(
      (prev) => (prev - 1 + item.colors.length) % item.colors.length
    );
  };

  const nextColor = () => {
    setSelectedColorIndex((prev) => (prev + 1) % item.colors.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-96 relative">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Select Options</h2>

        {/* Carousel Preview */}
        <div className="flex flex-col items-center mb-4 relative">
          <Image
            src={selectedColor.image}
            alt={item.name}
            width={200}
            height={200}
            className="rounded-lg"
          />
          <button
            onClick={prevColor}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
          >
            ◀
          </button>
          <button
            onClick={nextColor}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
          >
            ▶
          </button>
        </div>

        <p className="text-lg font-semibold mb-2">{item.name}</p>
        <p className="text-gray-600 mb-4">Rs {item.price}</p>

        {/* Size Selection */}
        <div className="mb-4">
          <p className="font-medium">Select Size:</p>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full border rounded-lg p-2 mt-1"
          >
            <option value="S">Small (S)</option>
            <option value="M">Medium (M)</option>
            <option value="L">Large (L)</option>
            <option value="XL">Extra Large (XL)</option>
          </select>
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <p className="font-medium">Quantity:</p>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full border rounded-lg p-2 mt-1"
          />
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAdd}
          className="w-full mt-3 bg-black text-white py-2 rounded-xl hover:bg-gray-800 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
