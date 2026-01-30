import "./App.css";
import Header from "./components/Header";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyOrders from "./pages/MyOrders";
import Offers from "./pages/Offers";
import Help from "./pages/Help";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import CategoryProducts from "./pages/CategoryProducts";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Footer from "./components/Footer";

function AppLayout() {
  const location = useLocation();

  const hideHeaderRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
  ];

  const hideHeader =
    hideHeaderRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password");

  return (
    <>
      {!hideHeader && <Header />}

      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/help" element={<Help />} />

        {/* PROTECTED */}
        <Route
          path="/"
          element={
            // <ProtectedRoute>
              <Home />
            // </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            // <ProtectedRoute>
              <Products />
            // </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            // <ProtectedRoute>
              <ProductDetails />
            // </ProtectedRoute>
          }
        />

        <Route
          path="/category/:id"
          element={
            // <ProtectedRoute>
              <CategoryProducts />
            // </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div>Page Not Found</div>} />

      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}


export default App;
