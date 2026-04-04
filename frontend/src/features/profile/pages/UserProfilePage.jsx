import React from "react";
import { UserProfile } from "../components/UserProfile";
import {Navbar} from "../../../layout/Navbar";
import {Footer} from "../../../layout/Footer";

export const UserProfilePage = () => {
  return (
    <>
      <Navbar />
      <UserProfile />
      <Footer />
    </>
  );
};
