import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/getImageUrl";
import RatingStars from "../components/RatingStars";
import { Heart } from "lucide-react";

// 🔐 LOGIN POPUP
import LoginModal from "../components/LoginModal";
import useRequireLogin from "../hooks/useRequireLogin";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


function CategoryProducts() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");

  // 🔥 SLIDER STATES (ADDED)
  const [sliders, setSliders] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const { cart, addToCart, increaseQty, decreaseQty } = useCart();
  const token = localStorage.getItem("token");

  // 🔐 LOGIN POPUP HOOK
  const {
    requireLogin,
    showLogin,
    setShowLogin,
    onLoginSuccess,
  } = useRequireLogin();

  const getCartItem = (productId) =>
    cart.find(
      (c) => c.productId === productId || c.product?._id === productId
    );

  /* ================= PRODUCTS ================= */
  const fetchProducts = async () => {
    const res = await fetch(
      `${API_BASE_URL}/api/products?category=${id}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    const data = await res.json();
    const list = data.data || [];
    setProducts(list);
    setCategoryName(list[0]?.category?.name || "");
  };

  useEffect(() => {
    fetchProducts();
  }, [id]);

  /* ================= CATEGORY SLIDER (STRING BASED) ================= */
  useEffect(() => {
    if (!categoryName) return;

    fetch(`${API_BASE_URL}/api/sliders/category/${categoryName}`)
      .then((res) => res.json())
      .then((data) => setSliders(data.sliders || []))
      .catch(() => setSliders([]));
  }, [categoryName]);

  /* ================= AUTO SLIDE ================= */
  useEffect(() => {
    if (sliders.length === 0 || isHovering) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === sliders.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [sliders, isHovering]);

  const nextSlide = () =>
    setCurrentSlide((prev) =>
      prev === sliders.length - 1 ? 0 : prev + 1
    );

  const prevSlide = () =>
    setCurrentSlide((prev) =>
      prev === 0 ? sliders.length - 1 : prev - 1
    );

  /* ================= WISHLIST ================= */
  const toggleWishlist = async (productId) => {
    if (!token) {
      setShowLogin(true);
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/api/wishlist/${productId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchProducts();
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.error("Wishlist error", err);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* ================= CATEGORY SLIDER ================= */}
        {sliders.length > 0 && (
          <div
            className="relative mb-10 w-full h-[220px] md:h-[520px] overflow-hidden rounded-xl"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {sliders.map((s, index) => (
              <img
                key={s._id}
                src={getImageUrl(s.image)}
                alt="category banner"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-1 rounded-full"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-1 rounded-full"
            >
              ›
            </button>
          </div>
        )}

        {/* ================= TITLE ================= */}
        <h1 className="text-3xl font-bold mb-6">
          {categoryName?.toUpperCase() || "PRODUCTS"}
        </h1>

        {/* ================= PRODUCTS GRID ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((item) => {
            const cartItem = getCartItem(item._id);

            const discountedPrice = Math.round(
              item.price -
                (item.price * (item.discountPercentage || 0)) / 100
            );

            return (
              <div
                key={item._id}
                onClick={() => navigate(`/product/${item._id}`)}
                className="cursor-pointer bg-white border rounded-xl hover:shadow-lg transition flex flex-col"
              >
                <div className="relative w-full h-44 flex items-center justify-center p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(item._id);
                    }}
                    className="absolute top-2 right-2 z-10"
                  >
                    <Heart
                      size={18}
                      className={
                        item.isWishlist
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }
                    />
                  </button>

                  {item.discountPercentage > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      {Math.round(item.discountPercentage)}% OFF
                    </span>
                  )}

                  <img
                    src={getImageUrl(item.thumbnail)}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="px-4 pb-4 flex flex-col flex-1">
                  <h3 className="mt-2 font-semibold text-sm line-clamp-2 min-h-[40px]">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-indigo-600 font-bold">
                      ₹{discountedPrice}
                    </span>
                    {item.discountPercentage > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{item.price}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <RatingStars rating={item.rating || 0} />
                    <span className="text-xs text-gray-500">
                      ({item.rating?.toFixed(1) || "0.0"})
                    </span>
                  </div>

                  <div className="mt-auto">
                    {!cartItem ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          requireLogin(() => addToCart(item));
                        }}
                        className="mt-3 bg-indigo-600 text-white w-full py-2 rounded-md text-sm"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 flex justify-between items-center border rounded-md px-3 py-1.5"
                      >
                        <button
                          onClick={() =>
                            requireLogin(() =>
                              decreaseQty(item._id, cartItem.quantity)
                            )
                          }
                        >
                          −
                        </button>
                        <span>{cartItem.quantity}</span>
                        <button
                          onClick={() =>
                            requireLogin(() =>
                              increaseQty(item._id, cartItem.quantity)
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔐 LOGIN MODAL */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={onLoginSuccess}
        />
      )}
    </div>
  );
}

export default CategoryProducts;
