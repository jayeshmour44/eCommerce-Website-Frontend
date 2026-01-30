import { createContext, useContext, useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const CartContext = createContext();
const API_URL = `${API_BASE_URL}/api`;

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // 🔥 NEW
  const [showLoginModal, setShowLoginModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  /* ================= LOAD CART ================= */
  const loadCart = async () => {
    if (!token) {
      setCart([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setCart(data.cart || []);
    } catch (err) {
      console.error("Load cart error", err);
    }
  };

  useEffect(() => {
    loadCart();
  }, [token]);

  /* ================= LOGIN CHECK ================= */
  const requireLogin = () => {
    if (!token) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  /* ================= ADD TO CART ================= */
  const addToCart = async (product) => {
    if (!requireLogin()) return;

    if (user?.isBlocked) {
      alert("Your account is blocked.");
      return;
    }

    await fetch(`${API_URL}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: product._id,
        name: product.title || product.name,
        quantity: 1,
      }),
    });

    loadCart();
  };

  /* ================= UPDATE QTY ================= */
  const updateQty = async (productId, quantity) => {
    if (!requireLogin()) return;

    await fetch(`${API_URL}/cart/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });

    loadCart();
  };

  const increaseQty = (productId, qty) => {
    updateQty(productId, qty + 1);
  };

  const decreaseQty = (productId, qty) => {
    if (qty <= 1) {
      removeFromCart(productId);
    } else {
      updateQty(productId, qty - 1);
    }
  };

  /* ================= REMOVE ITEM ================= */
  const removeFromCart = async (productId) => {
    if (!requireLogin()) return;

    await fetch(`${API_URL}/cart/remove/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadCart();
  };

  /* ================= CLEAR CART ================= */
  const clearCartAfterOrder = async () => {
    if (!requireLogin()) return;

    await fetch(`${API_URL}/cart/clear`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setCart([]);
  };

  /* ================= PRICE HELPERS (UNCHANGED) ================= */
  const getDiscountedPrice = (product, item) => {
    if (item?.finalPrice) return item.finalPrice;
    const discounted =
      product.price - (product.price * (product.discountPercentage || 0)) / 100;
    return Math.round(discounted);
  };

  const getItemTotal = ({ price, discountPercentage, qty, finalPrice }) => {
    if (finalPrice) return Math.round(finalPrice * qty);
    const discounted = price - (price * (discountPercentage || 0)) / 100;
    return Math.round(discounted * qty);
  };

  const getCartTotal = () => {
    return Math.round(
      cart.reduce((sum, item) => {
        if (item.finalPrice) {
          return sum + item.finalPrice * item.quantity;
        }
        const p = item.product;
        const discounted =
          p.price - (p.price * (p.discountPercentage || 0)) / 100;
        return sum + discounted * item.quantity;
      }, 0),
    );
  };

  const getTotalMRP = () => {
    return Math.round(
      cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    );
  };

  const getTotalDiscount = () => {
    return Math.round(getTotalMRP() - getCartTotal());
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCartAfterOrder,

        // 🔥 NEW
        showLoginModal,
        setShowLoginModal,

        // helpers
        getDiscountedPrice,
        getItemTotal,
        getCartTotal,
        getTotalMRP,
        getTotalDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
