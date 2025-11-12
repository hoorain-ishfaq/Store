"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../redux/slices/cartSlice";
import { setTheme } from "../../redux/slices/themeSlice";
import { motion } from "framer-motion";
import { Pencil, LogOut, Package } from "lucide-react";

export default function UserPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const router = useRouter();
  const auth = getAuth();
  const dispatch = useDispatch();

  const theme = useSelector((state) => state.theme.mode);

  // ✅ Check login & fetch user/admin data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Try fetching normal user profile
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setProfile(userSnap.data());
        setNewName(userSnap.data().name || "");
        fetchOrders(currentUser.uid);
      } else {
        // Check if admin
        const adminQuery = query(
          collection(db, "admin"),
          where("email", "==", currentUser.email)
        );
        const adminSnap = await getDocs(adminQuery);

        if (!adminSnap.empty) {
          // Admin → redirect to admin dashboard
          router.push("/admin");
        } else {
          // Neither user nor admin → force login
          router.push("/login");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Fetch user orders
  const fetchOrders = (uid) => {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const userOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(userOrders);
    });
  };

  // ✅ Update name
  const handleSaveName = async () => {
    if (!newName.trim()) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { name: newName });
    setProfile((prev) => ({ ...prev, name: newName }));
    setEditing(false);
  };

  // ✅ Logout
  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearCart());
    router.push("/login");
  };

  // ✅ Theme Toggle
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    dispatch(setTheme(newTheme));
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (!user || !profile)
    return (
      <div className="flex justify-center items-center min-h-screen  bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300">
        Loading profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 p-6 -mt-4 -mb-6 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 🔹 Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Profile Details</h2>
            <div className="flex items-center gap-3">
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition text-white"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm">
                Name
              </label>
              {editing ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-2 bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 rounded-md text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md">
                  <span>{profile.name || "No name set"}</span>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-blue-500 hover:text-blue-400"
                  >
                    <Pencil size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm">
                Email
              </label>
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md">
                {profile.email}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm">
                Phone
              </label>
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md">
                {profile.phone || "Not provided"}
              </div>
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm">
                Birthday
              </label>
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md">
                {profile.birthday || "Not provided"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 🔹 Orders Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 mb-6">
            <Package size={22} className="text-blue-500" />
            <h2 className="text-2xl font-semibold">Past Orders</h2>
          </div>

          {orders.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No past orders yet.
            </p>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-500 transition"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">Order ID:</span> {order.id}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-semibold">Items:</span>{" "}
                    {order.items
                      .map((i) => `${i.name} x${i.quantity}`)
                      .join(", ")}
                  </p>
                  <p className="text-sm font-medium text-blue-500 mt-1">
                    Total: Rs{" "}
                    {order.items
                      .reduce((sum, i) => sum + i.price * i.quantity, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Date:{" "}
                    {new Date(order.createdAt?.seconds * 1000).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
