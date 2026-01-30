import { useState, useEffect, useRef } from "react";
import { BiSolidOffer } from "react-icons/bi";
import { IoHelpBuoyOutline, IoMenu, IoClose } from "react-icons/io5";
import {
  MdOutlineAssignmentInd,
  MdOutlineShoppingCart,
  MdLogout,
  MdFavoriteBorder,
} from "react-icons/md";
import { useCart } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Header() {
  const { cart, clearCartAfterOrder } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false); // mobile menu
  const [userOpen, setUserOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [wishlistCount, setWishlistCount] = useState(0);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  /* ================= FETCH WISHLIST COUNT ================= */
  const fetchWishlistCount = async () => {
    if (!token) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWishlistCount(data.data?.length || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchWishlistCount();
    const handler = () => fetchWishlistCount();
    window.addEventListener("wishlist-updated", handler);
    return () => window.removeEventListener("wishlist-updated", handler);
  }, [token]);

  /* OUTSIDE CLICK CLOSE USER DROPDOWN */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  const handleLogout = async () => {
    await clearCartAfterOrder();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setWishlistCount(0);
    setUserOpen(false);
    navigate("/");
  };

  const navItem =
    "flex items-center gap-3 py-2 cursor-pointer text-gray-700 hover:text-indigo-600 transition";

  return (
    <>
      <header className="sticky top-0 z-[999] bg-white/80 backdrop-blur border-b shadow-sm">
        <div className="max-w-[1200px] mx-auto flex items-center px-4 py-3">
          {/* LOGO */}
          <div
            className="w-[50px] cursor-pointer"
            onClick={() => {
              navigate("/");
              setOpen(false);
            }}
          >
            <img src="/logo.png" alt="logo" className="w-full rounded-lg" />
          </div>

          {/* DESKTOP NAV */}
          <nav className="ml-auto hidden md:block">
            <ul className="flex items-center gap-8 font-medium">
              <li onClick={() => navigate("/")} className={navItem}>
                Home
              </li>
              <li onClick={() => navigate("/products")} className={navItem}>
                Products
              </li>

              <li
                onClick={() => navigate("/offers")}
                className={`${navItem} relative`}
              >
                <BiSolidOffer size={20} />
                Offers
                <span className="absolute -top-2 -right-3 text-[10px] bg-indigo-600 text-white px-1.5 rounded-full">
                  New
                </span>
              </li>

              <li onClick={() => navigate("/orders")} className={navItem}>
                My Orders
              </li>

              <li
                onClick={() => navigate("/wishlist")}
                className="relative flex items-center gap-2 cursor-pointer hover:text-red-500"
              >
                <MdFavoriteBorder size={22} />
                Wishlist
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </li>

              {!token ? (
                <li onClick={() => navigate("/login")} className={navItem}>
                  <MdOutlineAssignmentInd size={22} />
                  Sign In
                </li>
              ) : (
                <li className="relative" ref={dropdownRef}>
                  <div
                    onClick={() => setUserOpen(!userOpen)}
                    className="flex items-center gap-2 cursor-pointer hover:text-indigo-600"
                  >
                    <MdOutlineAssignmentInd size={22} />
                    {user?.name || user?.email}
                  </div>

                  {userOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow">
                      <div
                        onClick={() => navigate("/profile")}
                        className="px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </div>
                      <div
                        onClick={() => navigate("/help")}
                        className="px-4 py-2 hover:bg-gray-100"
                      >
                        Help
                      </div>
                      <div
                        onClick={handleLogout}
                        className="px-4 py-2 text-red-500 hover:bg-red-50"
                      >
                        Logout
                      </div>
                    </div>
                  )}
                </li>
              )}

              <li
                onClick={() => navigate("/cart")}
                className="relative flex items-center gap-2 cursor-pointer"
              >
                <MdOutlineShoppingCart size={22} />
                Cart
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs px-1.5 rounded-full">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </li>
            </ul>
          </nav>

          {/* MOBILE MENU ICON */}
          <button
            onClick={() => setOpen(!open)}
            className="
    ml-auto md:hidden
    flex items-center gap-2
    px-4 py-2
    rounded-xl
    bg-white
    border border-gray-200
    text-gray-700
    shadow-sm
    hover:bg-gray-100
    active:scale-95
    transition-all
  "
          >
            {open ? (
              <IoClose className="text-xl" />
            ) : (
              <IoMenu className="text-xl" />
            )}
            <span className="text-sm font-medium">Menu</span>
          </button>
        </div>
      </header>

      {/* ===== MOBILE OVERLAY ===== */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ===== MOBILE MENU (SLIDE + FADE) ===== */}
      <div
        className={`fixed top-[64px] left-0 right-0 z-[999] md:hidden
        bg-white overflow-hidden transition-all duration-300 ease-out
        ${open ? "max-h-[500px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"}
        `}
      >
        <div className="px-4 pb-4 space-y-1 border-t">
          <div
            onClick={() => {
              navigate("/");
              setOpen(false);
            }}
            className={navItem}
          >
            Home
          </div>
          <div
            onClick={() => {
              navigate("/products");
              setOpen(false);
            }}
            className={navItem}
          >
            Products
          </div>
          <div
            onClick={() => {
              navigate("/offers");
              setOpen(false);
            }}
            className={navItem}
          >
            Offers
          </div>
          <div
            onClick={() => {
              navigate("/orders");
              setOpen(false);
            }}
            className={navItem}
          >
            My Orders
          </div>
          <div
            onClick={() => {
              navigate("/wishlist");
              setOpen(false);
            }}
            className={navItem}
          >
            Wishlist ({wishlistCount})
          </div>
          <div
            onClick={() => {
              navigate("/cart");
              setOpen(false);
            }}
            className={navItem}
          >
            Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
          </div>

          {!token ? (
            <div
              onClick={() => {
                navigate("/login");
                setOpen(false);
              }}
              className={navItem}
            >
              Sign In
            </div>
          ) : (
            <>
              <div
                onClick={() => {
                  navigate("/profile");
                  setOpen(false);
                }}
                className={navItem}
              >
                Profile
              </div>
              <div
                onClick={() => {
                  navigate("/help");
                  setOpen(false);
                }}
                className={navItem}
              >
                Help
              </div>
              <div
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="py-2 cursor-pointer text-red-500 hover:text-red-600"
              >
                Logout
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
