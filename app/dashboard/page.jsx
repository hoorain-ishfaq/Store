"use client";
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../../components/Sidebar";

const data = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 4500 },
  { month: "May", sales: 6000 },
  { month: "Jun", sales: 5500 },
  { month: "Jul", sales: 7000 },
];

const bestSellingProducts = [
  { name: "Denim Jacket", sold: 234, left: 12 },
  { name: "Cotton T-Shirt", sold: 198, left: 45 },
  { name: "Leather Boots", sold: 156, left: 8 },
  { name: "Summer Dress", sold: 134, left: 23 },
  { name: "Wool Sweater", sold: 98, left: 2 },
];

const orders = [
  { label: "Pending", value: 23, bg: "bg-gray-100", text: "text-black" },
  {
    label: "Completed",
    value: 1156,
    bg: "bg-green-100",
    text: "text-green-600",
  },
  { label: "Failed", value: 12, bg: "bg-red-100", text: "text-red-600" },
  {
    label: "Returned",
    value: 43,
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
];

const lowStock = [
  { name: "Leather Boots", category: "Footwear", left: 2 },
  { name: "Wool Sweater", category: "Clothing", left: 2 },
  { name: "Designer Jeans", category: "Clothing", left: 1 },
  { name: "Winter Coat", category: "Outerwear", left: 3 },
];

export default function DashboardPage() {
  // Sidebar width state to control content margin
  const [sidebarWidth, setSidebarWidth] = useState(220); // default open width

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar setSidebarWidth={setSidebarWidth} />

      {/* Main Content */}
      <div
        className="flex-1 p-8 overflow-auto transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
          Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white text-black shadow rounded">
            <p>Total Revenue</p>
            <h2 className="text-2xl font-bold text-black">$34,500</h2>
            <span className="text-sm text-green-600">+12% from last month</span>
          </div>
          <div className="p-4 bg-white text-black shadow rounded">
            <p>Total Orders</p>
            <h2 className="text-2xl font-bold text-black">1,234</h2>
            <span className="text-sm text-green-600">+8% from last month</span>
          </div>
          <div className="p-4 bg-white text-black shadow rounded">
            <p>New Customers</p>
            <h2 className="text-2xl font-bold text-black">156</h2>
            <span className="text-sm text-green-600">+23% from last month</span>
          </div>
          <div className="p-4 bg-white text-black shadow rounded">
            <p>Products</p>
            <h2 className="text-2xl font-bold text-black">89</h2>
            <span className="text-sm text-red-600">4 low stock items</span>
          </div>
        </div>

        {/* Charts and Best Selling Products */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Sales Overview */}
          <div className="bg-white p-4 shadow rounded">
            <h3 className="text-lg font-bold mb-4">Sales Overview</h3>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#4caf50"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Best Selling Products */}
          <div className="bg-white p-4 shadow rounded">
            <h3 className="text-lg font-bold mb-4 text-black">
              Best Selling Products
            </h3>
            <ul className="space-y-2">
              {bestSellingProducts.map((product) => (
                <li
                  key={product.name}
                  className="flex justify-between items-center text-black"
                >
                  <span>{product.name}</span>
                  <span className="flex gap-2">
                    <span>{product.sold} sold</span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        product.left < 10
                          ? "bg-red-600 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {product.left} left
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Orders Summary and Low Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Orders Summary */}
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg font-bold mb-4 text-black">
              Orders Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {orders.map((order) => (
                <div key={order.label} className={`p-4 rounded ${order.bg}`}>
                  <p className="text-sm text-black">{order.label}</p>
                  <p className={`text-xl font-bold ${order.text}`}>
                    {order.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-600">
              <span>⚠️</span> Low Stock Alerts
            </h3>
            <div className="flex flex-col gap-3">
              {lowStock.map((item) => (
                <div
                  key={item.name}
                  className="bg-red-50 p-4 rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-black">{item.name}</p>
                    <p className="text-sm text-gray-900">{item.category}</p>
                  </div>
                  <span className="bg-red-600 text-white text-sm px-2 py-1 rounded-full">
                    {item.left} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
