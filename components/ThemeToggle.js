"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/slices/themeSlice";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; //  avoid hydration error

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="text-gray-300 hover:text-yellow-400 transition duration-300"
    >
      {theme === "dark" ? <Moon size={22} /> : <Sun size={22} />}
    </button>
  );
}
