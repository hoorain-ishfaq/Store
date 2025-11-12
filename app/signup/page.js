"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { signUpUser } from "../../lib/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PhoneInput from "react-phone-input-2";
import DatePicker from "react-datepicker";
import "react-phone-input-2/lib/style.css";
import "react-datepicker/dist/react-datepicker.css";

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const router = useRouter();

  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000);
  };

  const password = watch("password");

  const onSubmit = async (data) => {
    const { name, email, password, phone, birthday } = data;

    setLoading(true);
    try {
      await signUpUser(email, password, phone, birthday, name);
      showPopup("🎉 Account created successfully!", "success");

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        showPopup("This email is already in use.", "error");
      } else {
        showPopup(error.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center transition-colors duration-300 bg-gradient-to-br from-gray-100 via-gray-200 to-white dark:from-gray-900 dark:via-gray-800 dark:to-black px-4">
      {/*  Popup */}
      <AnimatePresence>
        {popup.show && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-white font-medium z-50 ${
              popup.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {popup.message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur-lg p-8"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          Create Account ✨
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              {...register("name", { required: "Full name is required" })}
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Enter a valid email address",
                },
              })}
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <Controller
              name="phone"
              control={control}
              rules={{ required: "Phone number is required" }}
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  country={"pk"}
                  value={value}
                  onChange={onChange}
                  inputStyle={{
                    width: "100%",
                    borderRadius: "0.5rem",
                    padding: "1rem 1rem 1rem 3.5rem",
                    border: "1px solid #374151",
                    backgroundColor: "transparent",
                    color: "inherit",
                  }}
                  containerStyle={{ width: "100%" }}
                  buttonStyle={{
                    backgroundColor: "transparent",
                    border: "none",
                    left: "10px",
                  }}
                />
              )}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Birthday */}
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              Birthday
            </label>
            <Controller
              name="birthday"
              control={control}
              rules={{ required: "Birthday is required" }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={field.onChange}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select your birthday"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  showYearDropdown
                  scrollableYearDropdown
                />
              )}
            />
            {errors.birthday && (
              <p className="text-red-500 text-sm mt-1">
                {errors.birthday.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              type="password"
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              {...register("confirmPassword", {
                required: "Confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              type="password"
              placeholder="Confirm password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
              loading
                ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white"
            }`}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Log in
          </span>
        </p>
      </motion.div>
    </div>
  );
}
