import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchOffers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/offers`);
      const data = await res.json();
      if (data.success) setOffers(data.data || []);
    } catch (error) {
      console.error("Error fetching offers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center text-gray-500">
        Loading offers...
      </div>
    );
  }

  /* ---------------- EMPTY ---------------- */
  if (offers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center">
        <p className="text-gray-500 text-base sm:text-lg">
          No offers available right now 🎁
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-3 sm:px-6 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <h2 className="text-xl sm:text-3xl font-extrabold text-gray-800 mb-6 sm:mb-8 flex items-center gap-2">
          🔥 Current Offers
        </h2>

        {/* OFFERS GRID */}
        <div
          className="
            grid gap-4 sm:gap-6
            grid-cols-1
            min-[380px]:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
          "
        >
          {offers.map((offer) => {
            const discountText =
              offer.discountType === "percentage"
                ? `${offer.discountValue}% OFF`
                : offer.discountType === "flat"
                ? `₹${offer.discountValue} OFF`
                : "SPECIAL OFFER";

            return (
              <div
                key={offer._id}
                className="
                  bg-white rounded-2xl border shadow-sm
                  p-4 sm:p-6
                  hover:shadow-xl transition-all duration-300
                  hover:-translate-y-1
                  flex flex-col
                "
              >
                {/* DISCOUNT */}
                <div className="text-indigo-600 font-extrabold text-3xl sm:text-4xl mb-2 sm:mb-3">
                  {discountText}
                </div>

                {/* TITLE */}
                <h4 className="text-sm sm:text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {offer.title}
                </h4>

                {/* MIN CART VALUE */}
                {offer.minCartValue > 0 && (
                  <p className="text-xs sm:text-sm text-gray-500">
                    Min order ₹{offer.minCartValue}
                  </p>
                )}

                {/* EXPIRY */}
                {offer.expiryDate && (
                  <p className="text-xs text-red-500 mt-1">
                    Valid till{" "}
                    {new Date(offer.expiryDate).toLocaleDateString()}
                  </p>
                )}

                {/* CTA */}
                <button
                  onClick={() =>
                    navigate(`/products?offer=${offer._id}`)
                  }
                  className="
                    mt-auto
                    bg-indigo-600 hover:bg-indigo-700
                    text-white
                    px-4 sm:px-5 py-2
                    rounded-lg
                    text-sm sm:text-base
                    font-medium
                    transition
                  "
                >
                  Shop Now
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
