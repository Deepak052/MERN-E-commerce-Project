import React from "react";
import {Navbar} from "../../../layout/Navbar";
import {Footer} from "../../../layout/Footer";
import { ProductDetails } from "./ProductDetails";

export const ProductDetailsPage = () => {
  return (
    <>
      <Navbar />
      <ProductDetails />
      <Footer />
    </>
  );
};
