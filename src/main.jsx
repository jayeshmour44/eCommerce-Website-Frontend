import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { WishlistProvider } from "./context/WishlistContext.jsx";


const user = JSON.parse(localStorage.getItem("user"));

createRoot(document.getElementById("root")).render(
  <CartProvider key={user?._id || "guest"}>
    <WishlistProvider>
    <App />
    </WishlistProvider>
    {/* ✅ TOASTER GLOBAL */}
    <ToastContainer position="top-right" autoClose={3000} />
  </CartProvider>
);
