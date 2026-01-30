import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


/**
 * Props:
 * - categoryId (optional)
 *   → undefined = Home page slider
 *   → categoryId = Category-wise slider
 */
function HomeSlider({ categoryId }) {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = `${API_BASE_URL}/api/sliders/active`;

    // 🔥 If categoryId present → load category sliders
    if (categoryId) {
      url = `${API_BASE_URL}/api/sliders/category/${categoryId}`;
    }

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(url);
        const data = await res.json();
        setSliders(data.sliders || []);
      } catch (err) {
        console.error("SLIDER FETCH ERROR:", err);
        setSliders([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [categoryId]);

  if (loading || sliders.length === 0) return null;

  return (
    <div className="w-full ">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop={sliders.length > 1}
      >
        {sliders.map((s) => (
          <SwiperSlide key={s._id}>
            <div className="w-full  overflow-hidden h-[300px]">
              <img
                src={`${API_BASE_URL}${s.image}`}
                alt={s.title || "banner"}
                className="w-full h-full object-cover object-top"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default HomeSlider;
