"use client";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-10 px-6 md:px-20 mt-2 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & About */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            ղօíɾաҽαɾ
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your go-to store for modern fashion. We bring you elegant,
            affordable, and stylish clothing for every occasion.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Quick Links
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Customer Service
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="#"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                Return Policy
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                Shipping Info
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Follow Us
          </h3>
          <div className="flex gap-4 mb-4">
            <Link
              href="#"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition"
            >
              <Facebook size={24} />
            </Link>
            <Link
              href="#"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition"
            >
              <Instagram size={24} />
            </Link>
            <Link
              href="#"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition"
            >
              <Twitter size={24} />
            </Link>
            <Link
              href="mailto:info@noirwear.com"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition"
            >
              <Mail size={24} />
            </Link>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Email:{" "}
            <span className="text-blue-500 dark:text-blue-400">
              info@noirwear.com
            </span>
          </p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-300 dark:border-gray-700 mt-10 pt-4 text-center text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
        © {new Date().getFullYear()} Noirwear. All rights reserved.
      </div>
    </footer>
  );
}
