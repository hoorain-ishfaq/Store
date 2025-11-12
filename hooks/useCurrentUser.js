"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        return;
      }

      try {
        // Check if admin
        const adminQuery = query(
          collection(db, "admin"),
          where("email", "==", user.email)
        );
        const adminSnap = await getDocs(adminQuery);

        if (!adminSnap.empty) {
          const adminData = adminSnap.docs[0].data();
          setCurrentUser({
            email: adminData.email,
            name: adminData.name,
            role: "admin",
            isAdmin: true,
          });
          return;
        }

        // Normal user
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ ...userDoc.data(), role: "user", isAdmin: false });
        } else {
          setCurrentUser({ email: user.email, role: "user", isAdmin: false });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  return currentUser;
}
