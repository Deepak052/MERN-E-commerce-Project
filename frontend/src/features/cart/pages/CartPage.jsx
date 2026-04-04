import React from "react";
// 🚨 FIX: Updated global layout imports
import {Navbar} from "../../../layout/Navbar";
import {Footer} from "../../../layout/Footer";
import { Cart } from "../components/Cart";

export const CartPage = () => {
  return (
    <>
      <Navbar />
      <Cart />
      <Footer />
    </>
  );
};
