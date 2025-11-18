"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Sidebar from "@/components/Sidebar";
import { Pagination, Spin } from "antd";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [selectedUserOrders, setSelectedUserOrders] = useState([]);

  // Fetch orders from Firebase
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const ordersCollection = collection(db, "orders");
        const ordersSnapshot = await getDocs(ordersCollection);

        const ordersList = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by date (latest first)
        ordersList.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = orders.slice(startIndex, startIndex + pageSize);

  // Show all orders of a specific user
  const handleViewAll = (userEmail) => {
    const userOrders = orders.filter((order) => order.email === userEmail);
    setSelectedUserOrders(userOrders);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar setSidebarWidth={setSidebarWidth} />

      <div
        className="flex-1 p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
        style={{ marginLeft: sidebarWidth }}
      >
        <h1 className="text-3xl font-bold mb-6">All Orders</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading orders..." />
          </div>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <>
            <div className="overflow-x-auto bg-white dark:bg-gray-800 p-4 rounded shadow">
              <table className="min-w-full border border-gray-300 dark:border-gray-700">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="border p-2 text-left">Customer Name</th>
                    <th className="border p-2 text-left">Email</th>
                    <th className="border p-2 text-left">Phone</th>
                    <th className="border p-2 text-left">Address</th>
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="border p-2">{order.fullName || "N/A"}</td>
                      <td className="border p-2">{order.email || "N/A"}</td>
                      <td className="border p-2">{order.phone || "N/A"}</td>
                      <td className="border p-2">
                        {`${order.address || ""}, ${order.area || ""}, ${
                          order.building || ""
                        }, ${order.colony || ""}, ${order.city || ""}, ${
                          order.province || ""
                        }`}
                      </td>
                      <td className="border p-2">
                        {order.createdAt
                          ? new Date(
                              order.createdAt.seconds * 1000
                            ).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="border p-2">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                          onClick={() => handleViewAll(order.email)}
                        >
                          View All
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-center">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={orders.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>

      {selectedUserOrders.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-auto py-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-4xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-700 dark:text-gray-200 text-xl font-bold"
              onClick={() => setSelectedUserOrders([])}
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold mb-4 text-black">
              Orders of {selectedUserOrders[0].fullName}
            </h2>

            {selectedUserOrders.map((order) => (
              <div
                key={order.id}
                className="border-b border-gray-300 dark:border-gray-600 mb-4 pb-4 text-black"
              >
                <p>
                  <strong>Order Date:</strong>{" "}
                  {order.createdAt
                    ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {`${order.address || ""}, ${order.area || ""}, ${
                    order.building || ""
                  }, ${order.colony || ""}, ${order.city || ""}, ${
                    order.province || ""
                  }`}
                </p>
                <h3 className="mt-2 font-semibold text-black">Items:</h3>

                {/* Fixed items rendering */}
                {Array.isArray(order.items) && order.items.length > 0 ? (
                  <ul className="list-none pl-0">
                    {order.items.map((item, index) => (
                      <li
                        key={index}
                        className="mb-4 flex items-center gap-4 bg-gray-100 dark:bg-gray-700 p-2 rounded"
                      >
                        {/* Image first */}
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name || "Item"}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}

                        {/* Details next to image */}
                        <div className="text-black dark:text-white">
                          <p className="font-medium">{item.name || "N/A"}</p>
                          <p>
                            Quantity: {item.quantity || 0} | Size:{" "}
                            {item.size || "N/A"} | ₹{item.price || 0}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No items found in this order.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
