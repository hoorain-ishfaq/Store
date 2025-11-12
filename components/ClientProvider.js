"use client";
import React from "react";
import { Provider } from "react-redux";
import { Store } from "../redux/store";

export default function ClientProvider({ children }) {
  return <Provider store={Store}>{children}</Provider>;
}
