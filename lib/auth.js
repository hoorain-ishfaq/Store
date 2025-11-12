import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

// ✅ Signup (for normal users)
export const signUpUser = async (email, password, phone, birthday, name) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: name || "",
    email: user.email,
    phone: phone || "",
    birthday: birthday ? birthday.toISOString().split("T")[0] : "",
    role: "user",
    createdAt: new Date(),
  });

  return user;
};

// ✅ Login (checks Firestore admin first)
export const signInUser = async (email, password) => {
  // Check Firestore admin collection first
  const q = query(collection(db, "admin"), where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const adminData = querySnapshot.docs[0].data();

    if (adminData.password === password) {
      // ✅ Admin found
      return {
        user: { email: adminData.email, name: adminData.name },
        role: "admin",
        isAdmin: true, // ✅ admin boolean
      };
    } else {
      throw new Error("Incorrect admin password");
    }
  }

  // ✅ Normal user login
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  // Get user role from Firestore (default user)
  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);
  const role = docSnap.exists() ? docSnap.data().role : "user";

  return {
    user,
    role,
    isAdmin: role === "admin", // ✅ false for normal users
  };
};

// ✅ Logout
export const logoutUser = async () => {
  await signOut(auth);
};
