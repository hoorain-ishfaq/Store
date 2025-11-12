"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchUserCart, addToUserCart, removeFromUserCart } from "@/lib/cart";
import { getAuth } from "firebase/auth";

// Load cart from localStorage
const loadCart = () => {
  if (typeof window === "undefined") return { items: [], totalPrice: 0 };
  try {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : { items: [], totalPrice: 0 };
  } catch {
    return { items: [], totalPrice: 0 };
  }
};

const saveCart = (state) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(state));
  }
};

const initialState = loadCart();

// Load Firestore cart
export const loadCartFromFirestore = createAsyncThunk(
  "cart/loadCartFromFirestore",
  async (uid, { rejectWithValue, getState, dispatch }) => {
    try {
      const itemsFromFirestore = await fetchUserCart(uid);

      // Merge guest cart with Firestore
      const guestCart = getState().cart.items || [];

      for (const item of guestCart) {
        // Check if item exists in Firestore
        const exists = itemsFromFirestore.find(
          (f) =>
            f.productId === item.id &&
            f.color === item.color &&
            f.size === item.size
        );

        if (!exists) {
          await addToUserCart(item, uid);
          itemsFromFirestore.push({
            productId: item.id,
            name: item.name,
            price: item.price,
            qty: item.quantity,
            image: item.image,
            color: item.color,
            size: item.size,
          });
        }
      }

      return itemsFromFirestore.map((i) => ({
        id: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.qty || 1,
        image: i.image || null,
        color: i.color || "",
        size: i.size || "",
      }));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    //  Completely clear cart and remove from localStorage
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
      if (typeof window !== "undefined") {
        localStorage.removeItem("cart"); //  true removal
      }
    },

    //  Add item locally and persist
    addLocalItem: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find(
        (i) =>
          i.id === item.id && i.color === item.color && i.size === item.size
      );
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        state.items.push(item);
      }
      state.totalPrice = state.items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      saveCart(state);
    },

    //  Remove specific item
    removeFromCart: (state, action) => {
      const item = action.payload;
      state.items = state.items.filter(
        (i) =>
          !(i.id === item.id && i.color === item.color && i.size === item.size)
      );
      state.totalPrice = state.items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      saveCart(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadCartFromFirestore.fulfilled, (state, action) => {
      state.items = action.payload;
      state.totalPrice = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      saveCart(state);
    });
  },
});

// Thunks
export const addItemToCart = (item) => async (dispatch) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    await addToUserCart(item, user.uid);
  }

  dispatch(cartSlice.actions.addLocalItem(item));
};

export const removeItemFromCart = (item) => async (dispatch) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    await removeFromUserCart(item, user.uid);
  }

  dispatch(cartSlice.actions.removeFromCart(item));
};

export const { clearCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;
