import React from "react";
import {Navbar} from "../../../layout/Navbar";
import {Footer} from "../../../layout/Footer";
import { Wishlist } from "../components/Wishlist";

export const WishlistPage = () => {
  return (
    <>
      <Navbar />
      <Wishlist />
      <Footer />
    </>
  );
};
