import { useSelector } from "react-redux";
import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import {
  selectIsAuthChecked,
  selectLoggedInUser,
} from "./features/auth/AuthSlice";
import { Logout } from "./features/auth/components/Logout";
import { Protected } from "./features/auth/components/Protected";

import { useAuthCheck } from "./hooks/useAuth/useAuthCheck";
import { useFetchLoggedInUserDetails } from "./hooks/useAuth/useFetchLoggedInUserDetails";

import {
  AddProductPage,
  AdminOrdersPage,
  CartPage,
  CheckoutPage,
  ForgotPasswordPage,
  HomePage,
  OrderSuccessPage,
  OtpVerificationPage,
  ProductDetailsPage,
  ProductUpdatePage,
  ResetPasswordPage,
  SignupPage,
  UserOrdersPage,
  UserProfilePage,
  WishlistPage,
} from "./pages";
import LoginPage from "./pages/LoginPage";

import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import AdminLayout from "./features/admin/layout/AdminLayout";
import { AddBrandView } from "./features/admin/views/AddBrandView";
import CategoryManagerView from "./features/admin/views/CategoryManagerView";
import { AddEditCategoryView } from "./features/admin/views/AddEditCategoryView";
import { AddEditBannerView } from "./features/admin/views/AddEditBannerView";
import BannerManagerView from "./features/admin/views/BannerManagerView";
import CustomerManagerView from "./features/admin/views/CustomerManagerView";
import { CustomerDetailView } from "./features/admin/views/CustomerDetailView";
import AdminManagerView from "./features/admin/views/AdminManagerView";

function App() {
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const loggedInUser = useSelector(selectLoggedInUser);

  useAuthCheck();
  useFetchLoggedInUserDetails(loggedInUser);

  const routes = createBrowserRouter(
    createRoutesFromElements(
      <>
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
        <Route
          path="/product-details/:id"
          element={
            <Protected>
              <ProductDetailsPage />
            </Protected>
          }
        />

        {loggedInUser?.isAdmin ? (
          <>
            <Route
              path="/admin/dashboard"
              element={
                <Protected>
                  <AdminDashboardPage />
                </Protected>
              }
            />
            <Route
              path="/admin/product-update/:id"
              element={
                <Protected>
                  <ProductUpdatePage />
                </Protected>
              }
            />
            <Route
              path="/admin/add-product"
              element={
                <Protected>
                  <AddProductPage />
                </Protected>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <Protected>
                  <AdminOrdersPage />
                </Protected>
              }
            />
            <Route path="*" element={<Navigate to="/admin/dashboard" />} />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={
                <Protected>
                  <HomePage />
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
          </>
        )}

        <Route
          path="/admin/add-brand"
          element={
            <Protected adminOnly={true}>
              <AdminLayout activeTab="Brands">
                <AddBrandView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/admin/brands/edit/:id"
          element={
            <Protected adminOnly={true}>
              <AdminLayout activeTab="Brands">
                <AddBrandView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <Protected adminOnly={true}>
              <AdminLayout activeTab="Categories">
                <CategoryManagerView />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/categories/add"
          element={
            <Protected adminOnly={true}>
              <AdminLayout activeTab="Categories">
                <AddEditCategoryView />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/categories/edit/:id"
          element={
            <Protected adminOnly={true}>
              <AdminLayout activeTab="Categories">
                <AddEditCategoryView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/admin/banners"
          element={
            <Protected adminOnly={true}>
              <AdminLayout activeTab="Banners">
                <BannerManagerView />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/banners/add"
          element={
            <Protected adminOnly={true}>
              <AdminLayout activeTab="Banners">
                <AddEditBannerView />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/admin/banners/edit/:id"
          element={
            <Protected adminOnly={true}>
              <AdminLayout activeTab="Banners">
                <AddEditBannerView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/admin/customers"
          element={
            <Protected adminOnly={true}>
              <AdminLayout activeTab="Customers">
                <CustomerManagerView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/admin/customers/:id"
          element={
            <Protected adminOnly={true}>
              <AdminLayout activeTab="Customers">
                <CustomerDetailView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/admin/personnel"
          element={
            <Protected adminOnly={true}>
              <AdminLayout activeTab="Admins">
                <AdminManagerView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </>,
    ),
  );

  return isAuthChecked ? <RouterProvider router={routes} /> : null;
}

export default App;
