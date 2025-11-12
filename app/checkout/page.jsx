"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import { auth, db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../redux/slices/cartSlice";
import { clearUserCart } from "@/lib/cart";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state) => state.cart.items);

  const [showPopup, setShowPopup] = useState(false);
  const [isDark, setIsDark] = useState(false); // detect theme

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const provinces = [
    { value: "punjab", label: "Punjab" },
    { value: "sindh", label: "Sindh" },
    { value: "kpk", label: "Khyber Pakhtunkhwa" },
    { value: "balochistan", label: "Balochistan" },
    { value: "gilgit", label: "Gilgit-Baltistan" },
  ];

  const cities = {
    punjab: [
      { value: "lahore", label: "Lahore" },
      { value: "rawalpindi", label: "Rawalpindi" },
      { value: "faisalabad", label: "Faisalabad" },
    ],
    sindh: [
      { value: "karachi", label: "Karachi" },
      { value: "hyderabad", label: "Hyderabad" },
    ],
    kpk: [
      { value: "peshawar", label: "Peshawar" },
      { value: "abbottabad", label: "Abbottabad" },
    ],
    balochistan: [
      { value: "quetta", label: "Quetta" },
      { value: "gwadar", label: "Gwadar" },
    ],
    gilgit: [{ value: "gilgit", label: "Gilgit" }],
  };

  const areas = [
    { value: "gulberg", label: "Gulberg" },
    { value: "defence", label: "Defence" },
    { value: "model-town", label: "Model Town" },
    { value: "dha", label: "DHA" },
  ];

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    building: "",
    colony: "",
    address: "",
    province: null,
    city: null,
    area: null,
    label: "home",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Theme-aware react-select styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? "#111827" : "white",
      borderColor: state.isFocused ? "#60a5fa" : isDark ? "#374151" : "#d1d5db",
      borderRadius: "0.75rem",
      minHeight: "46px",
      color: isDark ? "white" : "black",
      boxShadow: state.isFocused ? "0 0 0 1px #60a5fa" : "none",
      "&:hover": { borderColor: "#60a5fa" },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#111827" : "white",
      color: isDark ? "white" : "black",
      borderRadius: "0.75rem",
      marginTop: 4,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? isDark
          ? "#1f2937"
          : "#e5e7eb"
        : isDark
        ? "#111827"
        : "white",
      color: isDark ? "white" : "black",
      cursor: "pointer",
    }),
    singleValue: (base) => ({ ...base, color: isDark ? "white" : "black" }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? "#9ca3af" : "#6b7280",
    }),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Please login first!");
    if (cartItems.length === 0) return alert("Your cart is empty!");

    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        email: user.email,
        fullName: form.fullName,
        phone: form.phone,
        building: form.building,
        colony: form.colony,
        address: form.address,
        province: form.province?.label || "",
        city: form.city?.label || "",
        area: form.area?.label || "",
        label: form.label,
        items: cartItems,
        createdAt: serverTimestamp(),
      });

      dispatch(clearCart());
      await clearUserCart(user.uid);

      setForm({
        fullName: "",
        phone: "",
        building: "",
        colony: "",
        address: "",
        province: null,
        city: null,
        area: null,
        label: "home",
      });

      setShowPopup(true);
    } catch (err) {
      console.error(err);
      alert("Failed to save order!");
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 -mt-6 -mb-6">
      <div className="bg-gray-100 dark:bg-gray-900 shadow-xl rounded-2xl p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Delivery Information
        </h1>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          onSubmit={handleSubmit}
        >
          {/* Full Name */}
          <div>
            <label className="block mb-1 text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            />
          </div>

          {/* Province */}
          <div>
            <label className="block mb-1 text-sm font-medium">Province</label>
            <Select
              options={provinces}
              value={form.province}
              onChange={(selected) =>
                setForm({ ...form, province: selected, city: null })
              }
              placeholder="Select your province"
              styles={selectStyles}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
              className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            />
          </div>

          {/* City */}
          <div>
            <label className="block mb-1 text-sm font-medium">City</label>
            <Select
              options={form.province ? cities[form.province.value] : []}
              value={form.city}
              onChange={(selected) => setForm({ ...form, city: selected })}
              placeholder="Select your city"
              isDisabled={!form.province}
              styles={selectStyles}
            />
          </div>

          {/* Building */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Building / Street
            </label>
            <input
              type="text"
              name="building"
              value={form.building}
              onChange={handleChange}
              placeholder="Enter building details"
              className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            />
          </div>

          {/* Area */}
          <div>
            <label className="block mb-1 text-sm font-medium">Area</label>
            <Select
              options={areas}
              value={form.area}
              onChange={(selected) => setForm({ ...form, area: selected })}
              placeholder="Select your area"
              styles={selectStyles}
            />
          </div>

          {/* Colony */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Colony / Landmark
            </label>
            <input
              type="text"
              name="colony"
              value={form.colony}
              onChange={handleChange}
              placeholder="Enter nearby landmark"
              className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block mb-1 text-sm font-medium">Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="House# 123, Street# 123, ABC Road"
              required
              className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            />
          </div>

          {/* Home / Office Buttons */}
          <div className="md:col-span-2 mt-4 flex gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, label: "office" })}
              className={`flex-1 border p-3 rounded-xl text-sm ${
                form.label === "office"
                  ? "border-blue-300 bg-blue-100/20 text-blue-400"
                  : "border-gray-400 dark:border-gray-600 text-gray-500 dark:text-gray-300"
              }`}
            >
              🧳 OFFICE
            </button>

            <button
              type="button"
              onClick={() => setForm({ ...form, label: "home" })}
              className={`flex-1 border p-3 rounded-xl text-sm ${
                form.label === "home"
                  ? "border-red-300 bg-red-100/20 text-red-400"
                  : "border-gray-400 dark:border-gray-600 text-gray-500 dark:text-gray-300"
              }`}
            >
              🏠 HOME
            </button>
          </div>

          {/* Submit */}
          <div className="md:col-span-2 mt-6 flex justify-end">
            <button
              type="submit"
              className="bg-foreground text-background px-6 py-3 rounded-xl hover:opacity-80 transition font-medium"
            >
              Place Order
            </button>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center w-80 animate-fade-in">
            <h2 className="text-2xl font-semibold text-green-500 mb-3">
              🎉 Order Placed!
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Your order has been placed successfully.
            </p>
            <button
              onClick={closePopup}
              className="bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
