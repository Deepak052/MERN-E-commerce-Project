import React from "react";

// 🚨 FIX: Updated paths for FSD architecture
import { Checkout } from "../components/Checkout";
import {Navbar} from "../../../layout/Navbar";
import {Footer} from "../../../layout/Footer";

export const CheckoutPage = () => {
  return (
    <>
      <Navbar />
      <Checkout />
      <Footer />
    </>
  );
};
