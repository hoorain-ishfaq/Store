"use client";

import { useState, useEffect } from "react";
import { signInUser } from "../../lib/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false); // ✅ track mount
  const router = useRouter();

  useEffect(() => setMounted(true), []); // ✅ mark as mounted

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, role, isAdmin } = await signInUser(email, password);

      if (isAdmin) {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  //  prevent server-side render mismatch
  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-300 bg-gradient-to-br from-gray-100 via-gray-200 to-white dark:from-gray-900 dark:via-gray-800 dark:to-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur-lg p-8"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          Welcome Back 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          Please login to access your account
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/signup")}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </motion.div>
    </div>
  );
}
