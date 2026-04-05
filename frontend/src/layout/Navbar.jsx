import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Badge,
  Box,
  Divider,
  Stack,
  useMediaQuery,
  useTheme,
  InputBase,
  Paper,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

// 🚨 FIX: Corrected Redux Slice Imports for FSD Architecture
import { selectUserInfo } from "../features/profile/slice/UserSlice";
import { selectCartItems } from "../features/cart/slice/CartSlice";
import { selectLoggedInUser } from "../features/auth/slice/AuthSlice";
import { selectWishlistItems } from "../features/wishlist/slice/WishlistSlice";
import {
  selectProductIsFilterOpen,
  toggleFilters,
} from "../features/products/slice/ProductSlice";

// Icons
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import TuneIcon from "@mui/icons-material/Tune";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

export const Navbar = ({ isProductList = false }) => {
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  // Search State
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = React.useState(
    searchParams.get("search") || "",
  );

  const userInfo = useSelector(selectUserInfo);
  const cartItems = useSelector(selectCartItems);
  const loggedInUser = useSelector(selectLoggedInUser);
  const wishlistItems = useSelector(selectWishlistItems);
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleToggleFilters = () => dispatch(toggleFilters());

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate(`/`);
    }
  };

  const settings = [
    { name: "Home", to: "/" },
    {
      name: "Profile",
      to: loggedInUser?.isAdmin ? "/admin/profile" : "/profile",
    },
    {
      name: loggedInUser?.isAdmin ? "Orders" : "My orders",
      to: loggedInUser?.isAdmin ? "/admin/orders" : "/orders",
    },
    { name: "Logout", to: "/logout" },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "none",
        color: "text.primary",
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      {/* ... Rest of your Navbar UI Code Remains Exactly the Same ... */}
      <Toolbar
        sx={{
          px: { xs: 2, md: 4 },
          height: "4.5rem",
          justifyContent: "space-between",
        }}
      >
        {/* LOGO */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            color: "inherit",
            minWidth: { md: "200px" },
          }}
        >
          <Box
            sx={{
              bgcolor: "#6366f1",
              color: "white",
              p: 0.5,
              borderRadius: 1.5,
              display: "flex",
            }}
          >
            <StorefrontRoundedIcon fontSize="small" />
          </Box>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "#111827",
              display: { xs: "none", sm: "block" },
            }}
          >
            Shopsphere
          </Typography>
        </Stack>

        {/* SEARCH BAR */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            px: { xs: 1, md: 4 },
          }}
        >
          <Paper
            component="form"
            onSubmit={handleSearchSubmit}
            elevation={0}
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: "100%",
              maxWidth: 500,
              bgcolor: "#f3f4f6",
              borderRadius: 50,
              border: "1px solid transparent",
              transition: "all 0.2s ease",
              "&:focus-within": {
                bgcolor: "#ffffff",
                border: "1px solid #6366f1",
                boxShadow: "0 0 0 4px rgba(99, 102, 241, 0.1)",
              },
            }}
          >
            <IconButton
              type="submit"
              sx={{ p: "8px", color: "text.secondary" }}
              aria-label="search"
            >
              <SearchRoundedIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: "0.95rem" }}
              placeholder="Search products, brands, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <IconButton
                size="small"
                sx={{ p: "8px" }}
                onClick={() => {
                  setSearchTerm("");
                  navigate("/");
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                >
                  ✕
                </Typography>
              </IconButton>
            )}
          </Paper>
        </Box>

        {/* ACTIONS */}
        <Stack
          flexDirection="row"
          alignItems="center"
          spacing={{ xs: 0.5, sm: 2 }}
          sx={{ minWidth: { md: "200px" }, justifyContent: "flex-end" }}
        >
          {isProductList && (
            <Tooltip title="Filter Products">
              <IconButton
                onClick={handleToggleFilters}
                sx={{
                  bgcolor: isProductFilterOpen ? "#eff6ff" : "transparent",
                  color: isProductFilterOpen ? "#6366f1" : "text.secondary",
                }}
              >
                <TuneIcon />
              </IconButton>
            </Tooltip>
          )}

          {!loggedInUser?.isAdmin && (
            <Tooltip title="Wishlist">
              <IconButton
                component={Link}
                to="/wishlist"
                sx={{ color: "text.secondary" }}
              >
                <Badge badgeContent={wishlistItems?.length || 0} color="error">
                  <FavoriteBorderIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Cart">
            <IconButton
              component={Link}
              to="/cart"
              sx={{ color: "text.secondary" }}
            >
              <Badge badgeContent={cartItems?.length || 0} color="primary">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {!isMobile && (
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{ height: 28, mx: 1, alignSelf: "center" }}
            />
          )}

          {/* USER MENU */}
          <Tooltip title="Account settings">
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              onClick={handleOpenUserMenu}
              sx={{
                cursor: "pointer",
                p: 0.5,
                pr: { sm: 1.5 },
                borderRadius: 50,
                transition: "0.2s",
                "&:hover": { bgcolor: "#f3f4f6" },
              }}
            >
              <Avatar
                alt={userInfo?.name}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "#6366f1",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
              </Avatar>
              {!isMobile && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    lineHeight={1.2}
                    color="#111827"
                  >
                    {userInfo?.name?.split(" ")[0] || "Guest"}
                  </Typography>
                  {loggedInUser?.isAdmin && (
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="#6366f1"
                      lineHeight={1}
                    >
                      Admin
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>
          </Tooltip>

          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            keepMounted
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
                mt: 1.5,
                minWidth: 180,
                borderRadius: 2,
                border: "1px solid #e5e7eb",
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, display: { xs: "block", sm: "none" } }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="text.primary"
              >
                {userInfo?.name || "Guest"}
              </Typography>
              {loggedInUser?.isAdmin && (
                <Typography variant="caption" color="primary">
                  Admin Account
                </Typography>
              )}
              <Divider sx={{ mt: 1 }} />
            </Box>
            {loggedInUser?.isAdmin && (
              <MenuItem
                onClick={handleCloseUserMenu}
                component={Link}
                to="/admin/add-product"
              >
                <Typography color="text.primary" fontWeight={500}>
                  Add new Product
                </Typography>
              </MenuItem>
            )}
            {settings.map((setting) => (
              <MenuItem
                key={setting.name}
                onClick={handleCloseUserMenu}
                component={Link}
                to={setting.to}
              >
                <Typography
                  color={
                    setting.name === "Logout" ? "error.main" : "text.primary"
                  }
                  fontWeight={500}
                >
                  {setting.name}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
