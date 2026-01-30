import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/getImageUrl";
import HomeSlider from "../components/HomeSlider";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);

  const navigate = useNavigate();

  /* ================= OFFER CARD SLIDER ================= */
  const offerSliderRef = useRef(null);
  const [pauseOffer, setPauseOffer] = useState(false);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ================= FETCH OFFERS ================= */
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/offers`)
      .then((res) => res.json())
      .then((data) => setOffers(data.data || []));
  }, []);

  /* ================= AUTO SCROLL OFFERS ================= */
  useEffect(() => {
    if (!offerSliderRef.current || pauseOffer) return;

    const interval = setInterval(() => {
      const el = offerSliderRef.current;

      el.scrollBy({ left: 320, behavior: "smooth" });

      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 5) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pauseOffer]);

  /* ================= ARROW CONTROLS ================= */
  const scrollOffers = (dir) => {
    if (!offerSliderRef.current) return;

    offerSliderRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* ================= MAIN SLIDER ================= */}
      <HomeSlider />

      {/* ================= OFFERS SECTION ================= */}
      {offers.length > 0 && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-10 sm:py-12">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Special Offers
            </h2>

            {/* ARROWS */}
            <div className="flex gap-2">
              <button
                onClick={() => scrollOffers("left")}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow hover:bg-indigo-50 flex items-center justify-center"
              >
                ‹
              </button>
              <button
                onClick={() => scrollOffers("right")}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow hover:bg-indigo-50 flex items-center justify-center"
              >
                ›
              </button>
            </div>
          </div>

          {/* OFFER CARD SLIDER */}
          <div
            ref={offerSliderRef}
            onMouseEnter={() => setPauseOffer(true)}
            onMouseLeave={() => setPauseOffer(false)}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth no-scrollbar pb-3"
          >
            {offers.map((offer) => (
              <div
                key={offer._id}
                onClick={() => navigate(`/products?offer=${offer._id}`)}
                className="min-w-[240px] sm:min-w-[280px] md:min-w-[300px] bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer group"
              >
                <div className="h-40 sm:h-44 overflow-hidden">
                  <img
                    src={getImageUrl(offer.bannerImage)}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 line-clamp-1">
                    {offer.title}
                  </h3>

                  {offer.categories?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      Applicable on{" "}
                      {offer.categories.map((c) => c.name).join(", ")}
                    </p>
                  )}

                  <span className="inline-block mt-3 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    View Offer →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= CATEGORY SECTION ================= */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-10 sm:py-12">
        <div className="mb-8 sm:mb-10 text-center sm:text-left">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-800">
            Shop by Category
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Discover products from beautifully curated categories
          </p>
        </div>

        {/* LOADER */}
        {loading && (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-white p-5 sm:p-6 text-center shadow-sm border"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gray-200" />
                <div className="h-4 w-3/4 mx-auto rounded bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {/* CATEGORY GRID */}
        {!loading && (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((cat) => (
              <div
                key={cat._id}
                onClick={() => navigate(`/category/${cat._id}`)}
                className="group cursor-pointer rounded-2xl bg-gradient-to-br from-white to-indigo-50 p-4 sm:p-6 text-center border shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-indigo-300"
              >
                {cat.image && (
                  <img
                    src={getImageUrl(cat.image)}
                    alt={cat.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 object-cover rounded-full bg-white ring-4 ring-indigo-100 group-hover:ring-indigo-300 transition"
                  />
                )}

                <h3 className="text-xs sm:text-base font-semibold text-gray-700 group-hover:text-indigo-600">
                  {cat.name.toUpperCase()}
                </h3>

                <div className="mt-3 h-1 w-10 mx-auto rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
