import React from "react";
import { Outlet } from "react-router-dom";

export const RootLayout = () => {
  return (
    <main
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Outlet />
    </main>
  );
};
