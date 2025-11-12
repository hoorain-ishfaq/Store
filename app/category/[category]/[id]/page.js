"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductDetail from "@/components/ProductDetail";

export default function ProductDetailPage() {
  const { category, id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category || !id) return; //  safety check

    const fetchProduct = async () => {
      setLoading(true);
      try {
        //  Firestore document path
        // products → catalog → perfume → productId
        const docRef = doc(db, "products", "catalog", category, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          //  Ensure image and name exist (fallbacks)
          const productData = {
            id: docSnap.id,
            name: data.name || "Unnamed Product",
            price: data.price || 0,
            image: data.image || "/placeholder.png",
            ...data,
          };

          setProduct(productData);
        } else {
          console.warn("❌ Product not found in Firestore");
          setProduct(null);
        }
      } catch (error) {
        console.error("🔥 Error fetching product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [category, id]);

  //  Loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 dark:text-gray-300 text-xl">
        Loading product...
      </div>
    );
  }

  //  Product not found UI
  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 dark:text-red-400 text-xl font-semibold">
        Product not found.
      </div>
    );
  }

  //  Render product details
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <ProductDetail product={product} category={category} />
    </div>
  );
}
