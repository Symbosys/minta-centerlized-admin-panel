import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PlatformProvider } from "@/context/PlatformContext";
import { AuthProvider } from "@/context/AuthContext";
import { RoleProvider } from "@/context/RoleContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { PermissionRoute } from "./components/PermissionRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import Vendors from "./pages/Vendors";
import VendorDetail from "./pages/VendorDetail";
import VendorOwners from "./pages/VendorOwners";
import Subscriptions from "./pages/Subscriptions";
import VendorSubscriptions from "./pages/VendorSubscriptions";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Modes from "./pages/Modes";
import Settings from "./pages/Settings";
import AdminManagement from "./pages/AdminManagement";
import SubAdminPermissions from "./pages/SubAdminPermissions";
import Offers from "./pages/Offers";
import LegalPages from "./pages/LegalPages";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <PlatformProvider>
        <AuthProvider>
          <RoleProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner position="top-right" richColors />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<Layout />}>
                    <Route index element={<PermissionRoute permission="VIEW_DASHBOARD"><Dashboard /></PermissionRoute>} />
                    <Route path="users" element={<PermissionRoute permission="VIEW_USERS"><Users /></PermissionRoute>} />
                    <Route path="users/:id" element={<PermissionRoute permission="VIEW_USERS"><UserDetail /></PermissionRoute>} />
                    <Route path="vendors" element={<PermissionRoute permission="VIEW_VENDORS"><Vendors /></PermissionRoute>} />
                    <Route path="vendors/:id" element={<PermissionRoute permission="VIEW_VENDORS"><VendorDetail /></PermissionRoute>} />
                    <Route path="vendor-owners" element={<PermissionRoute requiredRole="ADMIN"><VendorOwners /></PermissionRoute>} />
                    <Route path="subscriptions" element={<PermissionRoute permission="VIEW_VENDORS"><Subscriptions /></PermissionRoute>} />
                    <Route path="manage-subscriptions" element={<PermissionRoute permission="VIEW_VENDORS"><Subscriptions /></PermissionRoute>} />
                    <Route path="vendor-subscriptions" element={<PermissionRoute permission="VIEW_VENDORS"><VendorSubscriptions /></PermissionRoute>} />
                    <Route path="orders" element={<PermissionRoute permission="VIEW_ORDERS"><Orders /></PermissionRoute>} />
                    <Route path="orders/:id" element={<PermissionRoute permission="VIEW_ORDERS"><OrderDetail /></PermissionRoute>} />
                    <Route path="products" element={<PermissionRoute permission="VIEW_PRODUCTS"><Products /></PermissionRoute>} />
                    <Route path="categories" element={<PermissionRoute permission="VIEW_CATEGORIES"><Categories /></PermissionRoute>} />
                    <Route path="modes" element={<PermissionRoute permission="VIEW_PRODUCTS"><Modes /></PermissionRoute>} />
                    <Route path="settings" element={<PermissionRoute permission="VIEW_SETTINGS"><Settings /></PermissionRoute>} />
                    <Route path="admin-management" element={<PermissionRoute permission="VIEW_ADMINS"><AdminManagement /></PermissionRoute>} />
                    <Route path="admin-permissions" element={<PermissionRoute permission="VIEW_ADMINS"><SubAdminPermissions /></PermissionRoute>} />
                    <Route path="admin-permissions/:id" element={<PermissionRoute permission="VIEW_ADMINS"><SubAdminPermissions /></PermissionRoute>} />
                    <Route path="offers" element={<PermissionRoute permission="VIEW_PROMOTIONS"><Offers /></PermissionRoute>} />
                    <Route path="legal-pages" element={<PermissionRoute permission="VIEW_SETTINGS"><LegalPages /></PermissionRoute>} />
                    <Route path="support" element={<PermissionRoute permission="VIEW_SUPPORT"><Support /></PermissionRoute>} />
                    <Route path="support/:sessionId" element={<PermissionRoute permission="VIEW_SUPPORT"><Support /></PermissionRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </RoleProvider>
        </AuthProvider>
      </PlatformProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
