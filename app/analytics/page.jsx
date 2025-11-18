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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
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

const ordersSummary = [
  { name: "Pending", value: 23 },
  { name: "Completed", value: 1156 },
  { name: "Failed", value: 12 },
  { name: "Returned", value: 43 },
];

const lowStock = [
  { name: "Leather Boots", value: 2 },
  { name: "Wool Sweater", value: 2 },
  { name: "Designer Jeans", value: 1 },
  { name: "Winter Coat", value: 3 },
];

const COLORS = ["#0088FE", "#00C49F", "#FF8042", "#FF0000"];

const bestSellingProducts = [
  { name: "Denim Jacket", sold: 234, left: 12 },
  { name: "Cotton T-Shirt", sold: 198, left: 45 },
  { name: "Leather Boots", sold: 156, left: 8 },
  { name: "Summer Dress", sold: 134, left: 23 },
  { name: "Wool Sweater", sold: 98, left: 2 },
];

export default function AnalyticsPage() {
  const [sidebarWidth, setSidebarWidth] = useState(220);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar setSidebarWidth={setSidebarWidth} />

      <div
        className="flex-1 p-8 overflow-auto transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
          Analytics & Reports
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white text-black shadow rounded">
            <p>Total Revenue</p>
            <h2 className="text-2xl font-bold">$34,500</h2>
            <span className="text-sm text-green-600">+12% from last month</span>
          </div>
          <div className="p-4 bg-white text-black shadow rounded">
            <p>Total Orders</p>
            <h2 className="text-2xl font-bold">1,234</h2>
            <span className="text-sm text-green-600">+8% from last month</span>
          </div>
          <div className="p-4 bg-white text-black shadow rounded">
            <p>New Customers</p>
            <h2 className="text-2xl font-bold">156</h2>
            <span className="text-sm text-green-600">+23% from last month</span>
          </div>
          <div className="p-4 bg-white text-black shadow rounded">
            <p>Products</p>
            <h2 className="text-2xl font-bold">89</h2>
            <span className="text-sm text-red-600">4 low stock items</span>
          </div>
        </div>

        {/* Line Chart + Best Selling */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Line Chart */}
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

          {/* Best Sellers */}
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

        {/* Bar Chart + Pie Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bar Chart (Order Summary) */}
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg font-bold mb-4 text-black">
              Orders Summary (Bar Chart)
            </h3>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersSummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart (Low Stock) */}
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-lg font-bold mb-4 text-red-600">
              Low Stock (Pie Chart)
            </h3>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={lowStock}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {lowStock.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
