import { useSelector } from "react-redux";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import {
  selectIsAuthChecked,
  selectLoggedInUser,
} from "./features/auth/slice/AuthSlice";
import { Logout } from "./features/auth/components/Logout";
import { Protected } from "./features/auth/components/Protected";

import { useAuthCheck } from "./hooks/useAuth/useAuthCheck";
import { useFetchLoggedInUserDetails } from "./hooks/useAuth/useFetchLoggedInUserDetails";

// Auth Pages
import { SignupPage } from "./features/auth/pages/SignupPage";
import LoginPage from "./features/auth/pages/LoginPage";
import { OtpVerificationPage } from "./features/auth/pages/OtpVerificationPage";
import { ForgotPasswordPage } from "./features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./features/auth/pages/ResetPasswordPage";

// Customer Pages
import { HomePage } from "./features/home/pages/HomePage";
import { ProductDetailsPage } from "./features/products/pages/ProductDetailsPage";
import { CartPage } from "./features/cart/pages/CartPage";
import { CheckoutPage } from "./features/checkout/pages/CheckoutPage";
import { OrderSuccessPage } from "./features/order/components/OrderSuccessPage";
import { UserOrdersPage } from "./features/order/pages/UserOrdersPage";
import { UserProfilePage } from "./features/profile/pages/UserProfilePage";
import { WishlistPage } from "./features/wishlist/pages/WishlistPage";

// Global Pages
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const loggedInUser = useSelector(selectLoggedInUser);

  useAuthCheck();
  useFetchLoggedInUserDetails(loggedInUser);

  const routes = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* ========================================== */}
        {/* 🟢 PUBLIC ROUTES                           */}
        {/* ========================================== */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/reset-password/:userId/:passwordResetToken"
          element={<ResetPasswordPage />}
        />

        <Route
          path="/logout"
          element={
            <Protected>
              <Logout />
            </Protected>
          }
        />

        {/* ========================================== */}
        {/* 🛍️ PROTECTED CUSTOMER STOREFRONT ROUTES    */}
        {/* ========================================== */}
        <Route
          path="/"
          element={
            <Protected>
              <HomePage />
            </Protected>
          }
        />
        <Route
          path="/product-details/:id"
          element={
            <Protected>
              <ProductDetailsPage />
            </Protected>
          }
        />
        <Route
          path="/cart"
          element={
            <Protected>
              <CartPage />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <UserProfilePage />
            </Protected>
          }
        />
        <Route
          path="/checkout"
          element={
            <Protected>
              <CheckoutPage />
            </Protected>
          }
        />
        <Route
          path="/order-success/:id"
          element={
            <Protected>
              <OrderSuccessPage />
            </Protected>
          }
        />
        <Route
          path="/orders"
          element={
            <Protected>
              <UserOrdersPage />
            </Protected>
          }
        />
        <Route
          path="/wishlist"
          element={
            <Protected>
              <WishlistPage />
            </Protected>
          }
        />

        {/* ========================================== */}
        {/* ⚠️ CATCH-ALL 404 ROUTE                     */}
        {/* ========================================== */}
        <Route path="*" element={<NotFoundPage />} />
      </>,
    ),
  );

  return isAuthChecked ? <RouterProvider router={routes} /> : null;
}

export default App;
