import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Box } from "@mui/material";
import { Link } from "react-router-dom"; // 🚨 NEW: Import Link

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export const ProductBanner = ({ banners = [] }) => {
  if (!banners || banners.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f5",
        }}
      >
        No Banners Available
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        loop={true}
        pagination={{ clickable: true }}
        navigation={true}
        style={{ width: "100%", height: "100%" }}
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner._id || index}>
            {/* 🚨 NEW: Make the whole slide a clickable link */}
            <Box
              component={Link}
              to={banner.redirectUrl || "/"}
              sx={{ display: "block", width: "100%", height: "100%" }}
            >
              <Box
                component="img"
                src={banner.image}
                alt={banner.title || `Banner-${index}`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover", // 'cover' removes empty side-gaps on ultra-wide screens
                  objectPosition: "center",
                  display: "block",
                }}
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
