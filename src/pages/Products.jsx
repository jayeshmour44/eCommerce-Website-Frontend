import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import RatingStars from "../components/RatingStars";
import { Heart } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 🔐 LOGIN POPUP
import LoginModal from "../components/LoginModal";
import useRequireLogin from "../hooks/useRequireLogin";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  const [searchParams] = useSearchParams();
  const offerId = searchParams.get("offer");

  const { cart, addToCart, increaseQty, decreaseQty } = useCart();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const {
    requireLogin,
    showLogin,
    setShowLogin,
    onLoginSuccess,
  } = useRequireLogin();

  const getCartItem = (id) =>
    cart.find(
      (item) => item.productId === id || item.product?._id === id
    );

  /* ---------------- FETCH CATEGORIES ---------------- */
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []));
  }, []);

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (offerId) {
        const offerRes = await fetch(`${API_BASE_URL}/api/offers/${offerId}`);
        const offerData = await offerRes.json();

        const categoryIds =
          offerData.data?.categories?.map((c) => c._id) || [];

        const res = await fetch(
          `${API_BASE_URL}/api/products/by-categories`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ categories: categoryIds }),
          }
        );

        const data = await res.json();
        setProducts(data.data || []);
      } else {
        let url = `${API_BASE_URL}/api/products?`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (category !== "all") url += `category=${category}`;

        const res = await fetch(url, {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        });

        const data = await res.json();
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, offerId]);

  /* ---------------- WISHLIST TOGGLE ---------------- */
  const toggleWishlist = async (productId) => {
    if (!token) {
      alert("Please login to use wishlist");
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/api/wishlist/${productId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((prev) =>
        prev.map((item) =>
          item._id === productId
            ? { ...item, isWishlist: !item.isWishlist }
            : item
        )
      );

      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-3 sm:px-4 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-800 mb-8 sm:mb-10">
          {offerId ? "Offer Products" : "Products"}
        </h1>

        {!offerId && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading && (
          <p className="text-center text-gray-500 mb-6">
            Loading products...
          </p>
        )}

        <div className="
  grid gap-4 sm:gap-6
  grid-cols-1
  min-[380px]:grid-cols-2
  sm:grid-cols-3
  md:grid-cols-4
  lg:grid-cols-5
">

          {!loading &&
            products.map((item) => {
              const cartItem = getCartItem(item._id);

              const imageUrl = item.thumbnail?.startsWith("http")
                ? item.thumbnail
                : `${API_BASE_URL}${item.thumbnail}`;

              const discountedPrice = Math.round(
                item.price -
                  (item.price * (item.discountPercentage || 0)) / 100
              );

              return (
                <div
                  key={item._id}
                  onClick={() => navigate(`/product/${item._id}`)}
                  className="cursor-pointer bg-white rounded-2xl border shadow-sm hover:shadow-xl transition flex flex-col"
                >
                  <div className="relative h-44 sm:h-48 bg-gray-50 rounded-t-2xl flex items-center justify-center">

                    {item.discountPercentage > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded">
                        {Math.round(item.discountPercentage)}% OFF
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(item._id);
                      }}
                      className="absolute top-2 right-2"
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

                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="max-h-full object-contain p-3 sm:p-4"
                    />
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-700 line-clamp-2">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-indigo-600 font-bold text-sm">
                        ₹{discountedPrice}
                      </span>
                      {item.discountPercentage > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{item.price}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <RatingStars rating={item.rating} />
                      <span className="text-xs text-gray-500">
                        ({item.rating})
                      </span>
                    </div>

                    <span className="text-xs text-gray-400 mb-3">
                      {item.category?.name}
                    </span>

                    {!cartItem ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.stock <= 0) return;
                          requireLogin(() => addToCart(item));
                        }}
                        className="mt-auto bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-auto flex items-center justify-between border rounded-lg px-3 py-2"
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
                            requireLogin(() => {
                              if (cartItem.quantity >= item.stock) return;
                              increaseQty(item._id, cartItem.quantity);
                            })
                          }
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {!loading && products.length === 0 && (
          <p className="text-center text-gray-500 mt-16">
            No products found
          </p>
        )}
      </div>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={onLoginSuccess}
        />
      )}
    </div>
  );
}

export default Products;
