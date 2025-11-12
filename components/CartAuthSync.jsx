"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { loadCartFromFirestore } from "@/redux/slices/cartSlice";

export default function CartAuthSync() {
  const dispatch = useDispatch();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(loadCartFromFirestore(user.uid));
      }
      // Guest cart is preserved automatically (localStorage)
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
}
