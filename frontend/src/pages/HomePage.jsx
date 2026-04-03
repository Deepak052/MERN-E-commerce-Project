import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Stack, useMediaQuery, useTheme } from "@mui/material";

import { Navbar } from "../features/navigation/components/Navbar";
import { ProductList } from "../features/products/components/ProductList";
import { ProductBanner } from "../features/products/components/ProductBanner"; // Make sure this path is correct!
import { Footer } from "../features/footer/Footer";

import {
  resetAddressStatus,
  selectAddressStatus,
} from "../features/address/AddressSlice";
// Import the Banner Redux actions
import {
  fetchAllBannersAsync,
  selectBanners,
} from "../features/banners/BannerSlice";

export const HomePage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const is1200 = useMediaQuery(theme.breakpoints.down(1200));
  const is800 = useMediaQuery(theme.breakpoints.down(800));
  const is600 = useMediaQuery(theme.breakpoints.down(600));

  const addressStatus = useSelector(selectAddressStatus);
  const banners = useSelector(selectBanners) || []; // Get dynamic banners from Redux

  useEffect(() => {
    if (addressStatus === "fulfilled") {
      dispatch(resetAddressStatus());
    }
  }, [addressStatus, dispatch]);

  // Fetch Banners on Mount (passing `false` so it only fetches active banners)
  useEffect(() => {
    dispatch(fetchAllBannersAsync(false));
  }, [dispatch]);

  // Extract just the image URLs to pass into your existing ProductBanner component
  const dynamicBannerImages = banners.map((banner) => banner.image);

  return (
    <>
      <Navbar isProductList={true} />

      {/* --- DYNAMIC BANNERS SECTION --- */}
      {!is600 && dynamicBannerImages.length > 0 && (
        <Stack
          sx={{
            width: "100%",
            height: is800 ? "300px" : is1200 ? "400px" : "500px",
          }}
        >
          <ProductBanner images={dynamicBannerImages} />
        </Stack>
      )}

      {/* --- PRODUCT LIST SECTION --- */}
      <ProductList />

      <Footer />
    </>
  );
};
