import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { getImageUrl } from "../utils/getImageUrl";
import { useCart } from "../context/CartContext";
import RatingStars from "../components/RatingStars";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { addToCart } = useCart();

  /* ================= FETCH WISHLIST ================= */
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setWishlist(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= REMOVE (NO RELOAD FEEL) ================= */
  const toggleWishlist = async (productId) => {
    try {
      await fetch(`${API_BASE_URL}/api/wishlist/${productId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ instant UI update (NO API refetch)
      setWishlist((prev) =>
        prev.filter((item) => item._id !== productId),
      );

      // 🔔 notify header once
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Loading wishlist...
      </div>
    );
  }

  /* ================= EMPTY STATE ================= */
  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Heart size={64} className="text-red-300 mb-4" />
        <p className="text-xl font-semibold text-gray-600">
          Your wishlist is empty
        </p>
        <p className="text-gray-400 mt-1">Start adding products you love ❤️</p>

        <button
          onClick={() => navigate("/products")}
          className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {wishlist.map((item) => {
          const discountedPrice = Math.round(
            item.price -
              (item.price * (item.discountPercentage || 0)) / 100,
          );

          return (
            <div
              key={item._id}
              className="bg-white rounded-xl border p-4 relative hover:shadow-lg transition"
            >
              {/* ❤️ REMOVE */}
              <button
                onClick={() => toggleWishlist(item._id)}
                className="absolute top-3 right-3 text-red-500 hover:scale-110 transition"
              >
                <Heart size={22} className="fill-red-500" />
              </button>

              {/* IMAGE */}
              <img
                src={getImageUrl(item.thumbnail || item.images?.[0])}
                alt={item.title}
                className="h-40 mx-auto object-contain cursor-pointer"
                onClick={() => navigate(`/product/${item._id}`)}
                onError={(e) => (e.currentTarget.src = "/no-image.png")}
              />

              {/* DETAILS */}
              <h3 className="mt-3 font-semibold text-sm line-clamp-2">
                {item.title}
              </h3>

              <p className="text-xs text-gray-400 mt-1">{item.brand}</p>

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
                  ({item.rating || 0})
                </span>
              </div>

              {/* ADD TO CART */}
              <button
                onClick={() =>
                  addToCart({
                    ...item,
                    image:
                      item.thumbnail ||
                      item.images?.[0] ||
                      item.image ||
                      "",
                  })
                }
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm"
              >
                Add to Cart
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Wishlist;
