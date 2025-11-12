// lib/cart.js
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

//  Add product to Firestore for logged-in user
export const addToUserCart = async (product, uid) => {
  const cartRef = collection(db, "users", uid, "cart");
  const q = query(cartRef, where("productId", "==", product.id));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const existingDoc = snap.docs[0];
    const existingQty = existingDoc.data().qty || 1;
    await updateDoc(existingDoc.ref, {
      qty: existingQty + (product.quantity || 1),
    });
  } else {
    await addDoc(cartRef, {
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: product.quantity || 1,
      image: product.image || null,
      color: product.color || "",
      size: product.size || "",
      addedAt: new Date(),
    });
  }
};

//  Fetch all cart items for user
export const fetchUserCart = async (uid) => {
  const cartRef = collection(db, "users", uid, "cart");
  const snap = await getDocs(cartRef);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

//  Remove single item from user's cart
export const removeFromUserCart = async (item, uid) => {
  const cartRef = collection(db, "users", uid, "cart");
  const q = query(cartRef, where("productId", "==", item.id));
  const snap = await getDocs(q);

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.color === item.color && data.size === item.size) {
      await deleteDoc(doc(db, "users", uid, "cart", docSnap.id));
    }
  }
};

//  Clear entire Firestore cart after checkout (🔥 Important fix)
export const clearUserCart = async (uid) => {
  if (!uid) return;
  const cartRef = collection(db, "users", uid, "cart");
  const snap = await getDocs(cartRef);
  const deletePromises = snap.docs.map((d) =>
    deleteDoc(doc(db, "users", uid, "cart", d.id))
  );
  await Promise.all(deletePromises);
};
