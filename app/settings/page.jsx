"use client";

import Sidebar from "../../components/Sidebar";

export default function SettingPage() {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
          Dashboard Settings
        </h1>
      </div>
    </div>
  );
}
