import { useSelector } from "react-redux";
import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import { selectIsAuthChecked } from "./features/auth/slice/AuthSlice";
import { useAuthCheck } from "./hooks/useAuthCheck";
import { useFetchLoggedInUserDetails } from "./hooks/useFetchLoggedInUserDetails";

import { Protected } from "./features/auth/components/Protected";
import AdminLayout from "./layout/AdminLayout";

import Login from "./features/auth/pages/Login";
import DashboardView from "./features/dashboard/pages/DashboardView";
import OrderManagerView from "./features/order/pages/OrderManagerView";
import ProductManagerView from "./features/products/pages/ProductManagerView";
import CustomerManagerView from "./features/customers/pages/CustomerManagerView";
import {ForgotPassword} from "./features/auth/pages/ForgotPassword"
import { ResetPassword } from "./features/auth/pages/ResetPassword";
import {AddProduct} from "./features/products/pages/AddProduct";
import {ProductUpdate} from "./features/products/pages/ProductUpdate";
import {CustomerDetailView} from "./features/customers/pages/CustomerDetailView";
import BannerManagerView from "./features/banners/pages/BannerManagerView";
import { AddEditBannerView } from "./features/banners/pages/AddEditBannerView";
import BrandManagerView from "./features/brands/pages/BrandManagerView"
import { AddEditCategoryView } from "./features/categories/pages/AddEditCategoryView";
import CategoryManagerView from "./features/categories/pages/CategoryManagerView";
import AdminManagerView from "./features/customers/pages/AdminManagerView"
import { AddEditBrandView } from "./features/brands/pages/AddEditBrandView";
import { ProductDetailsView } from "./features/products/pages/ProductDetailsView";
function App() {
  const isAuthChecked = useSelector(selectIsAuthChecked);
  useAuthCheck();
  // Ensure this hook logs them out if they aren't an admin!
  useFetchLoggedInUserDetails();

  const routes = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/reset-password/:userId/:token"
          element={<ResetPassword />}
        />

        {/* PROTECTED ADMIN ROUTES */}
        <Route
          path="/"
          element={
            <Protected>
              <AdminLayout activeTab="Dashboard">
                <DashboardView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/products"
          element={
            <Protected>
              <AdminLayout activeTab="Products">
                <ProductManagerView />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/products/add"
          element={
            <Protected>
              <AdminLayout activeTab="Products">
                <AddProduct />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/products/edit/:id"
          element={
            <Protected>
              <AdminLayout activeTab="Products">
                <ProductUpdate />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/products/view/:id"
          element={
            <Protected>
              <AdminLayout activeTab="Products">
                <ProductDetailsView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/orders"
          element={
            <Protected>
              <AdminLayout activeTab="Orders">
                <OrderManagerView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/customers"
          element={
            <Protected>
              <AdminLayout activeTab="Customers">
                <CustomerManagerView />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <Protected>
              <AdminLayout activeTab="Customers">
                <CustomerDetailView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/banners"
          element={
            <Protected>
              <AdminLayout activeTab="Banners">
                <BannerManagerView />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/banners/add"
          element={
            <Protected>
              <AdminLayout activeTab="Banners">
                <AddEditBannerView />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/banners/edit/:id"
          element={
            <Protected>
              <AdminLayout activeTab="Banners">
                <AddEditBannerView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/brands"
          element={
            <Protected>
              <AdminLayout activeTab="Brands">
                <BrandManagerView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/brands/add"
          element={
            <Protected>
              <AdminLayout activeTab="Banners">
                <AddEditBrandView />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/brands/edit/:id"
          element={
            <Protected>
              <AdminLayout activeTab="Banners">
                <AddEditBrandView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/categories"
          element={
            <Protected>
              <AdminLayout activeTab="Categories">
                <CategoryManagerView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/categories/add"
          element={
            <Protected>
              <AdminLayout activeTab="Categories">
                <AddEditCategoryView />
              </AdminLayout>
            </Protected>
          }
        />
        <Route
          path="/categories/edit/:id"
          element={
            <Protected>
              <AdminLayout activeTab="Categories">
                <AddEditCategoryView />
              </AdminLayout>
            </Protected>
          }
        />

        <Route
          path="/admins"
          element={
            <Protected adminOnly={true}>
              <AdminLayout activeTab="Admins">
                <AdminManagerView />
              </AdminLayout>
            </Protected>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </>,
    ),
  );

  return isAuthChecked ? <RouterProvider router={routes} /> : null;
}

export default App;
