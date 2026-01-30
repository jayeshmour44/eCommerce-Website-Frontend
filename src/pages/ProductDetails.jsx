import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/getImageUrl";
import RatingStars from "../components/RatingStars";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ProductDetails() {
  const { id } = useParams();

  const { cart, addToCart, increaseQty, decreaseQty } = useCart();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");

  // ZOOM (UNCHANGED)
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const cartItem = cart.find(
    (c) => c.productId === id || c.product?._id === id
  );

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.data);
        setActiveImage(data.data.thumbnail || "");
      });
  }, [id]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  if (!product) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-slate-500">
        Loading product...
      </div>
    );
  }

  const images = [product.thumbnail, ...(product.images || [])].filter(Boolean);

  const discountedPrice = Math.round(
    product.price - (product.price * (product.discountPercentage || 0)) / 100
  );

  return (
    <>
      {/* MAIN PDP */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">

        {/* LEFT – IMAGE GALLERY */}
        <div className="flex flex-col sm:flex-row gap-4">

          {/* MOBILE IMAGE THUMBNAILS */}
          <div className="flex sm:hidden gap-3 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <img
                key={i}
                src={getImageUrl(img)}
                onClick={() => setActiveImage(img)}
                className={`w-16 h-16 flex-shrink-0 object-contain border rounded-lg cursor-pointer ${
                  activeImage === img
                    ? "border-indigo-600"
                    : "border-slate-300"
                }`}
              />
            ))}
          </div>

          {/* DESKTOP THUMBNAILS */}
          <div className="hidden sm:flex flex-col gap-3">
            {images.map((img, i) => (
              <img
                key={i}
                src={getImageUrl(img)}
                onClick={() => setActiveImage(img)}
                className={`w-16 h-16 object-contain border rounded-lg cursor-pointer ${
                  activeImage === img
                    ? "border-indigo-600"
                    : "border-slate-300"
                }`}
              />
            ))}
          </div>

          {/* MAIN IMAGE */}
          <div
            className="relative flex-1 border rounded-2xl bg-white overflow-hidden"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            {product.discountPercentage > 0 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs sm:text-sm font-semibold px-3 py-1 rounded-lg z-10">
                {Math.round(product.discountPercentage)}% OFF
              </span>
            )}

            <img
              src={getImageUrl(activeImage)}
              alt={product.title}
              className="w-full h-[260px] sm:h-[360px] lg:h-[420px] object-contain"
            />

            {/* ZOOM – DESKTOP ONLY */}
            {isZooming && (
              <div
                className="absolute inset-0 hidden lg:block"
                style={{
                  backgroundImage: `url(${getImageUrl(activeImage)})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "200%",
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                }}
              />
            )}
          </div>
        </div>

        {/* RIGHT – PRODUCT INFO */}
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-800 mb-2">
            {product.title}
          </h1>

          {product.brand && (
            <p className="text-sm text-slate-500 mb-2">
              Brand:{" "}
              <span className="font-medium text-slate-700">
                {product.brand}
              </span>
            </p>
          )}

          <div className="flex items-center gap-2 mb-4">
            <RatingStars rating={product.rating} />
            <span className="text-sm text-slate-500">
              ({product.rating})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="text-2xl sm:text-3xl font-bold text-indigo-600">
              ₹{discountedPrice}
            </span>

            {product.discountPercentage > 0 && (
              <>
                <span className="line-through text-slate-400">
                  ₹{product.price}
                </span>
                <span className="text-green-600 font-medium">
                  {Math.round(product.discountPercentage)}% off
                </span>
              </>
            )}
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-sm text-red-600 font-medium mb-3">
              Hurry! Only {product.stock} left in stock
            </p>
          )}

          <span
            className={`inline-block mb-6 px-3 py-1 rounded-full text-sm font-medium ${
              product.stock > 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {product.stock > 0
              ? product.stock <= 5
                ? "Low Stock"
                : "In Stock"
              : "Out of Stock"}
          </span>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {!cartItem ? (
              <button
                disabled={product.stock === 0}
                onClick={() => {
                  if (product.stock <= 0) return;
                  addToCart(product);
                }}
                className="flex-1 rounded-xl bg-indigo-600 py-3 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                Add to Cart
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-between border rounded-xl px-4 py-3">
                <button
                  onClick={() =>
                    decreaseQty(product._id, cartItem.quantity)
                  }
                >
                  −
                </button>

                <span className="font-medium">
                  {cartItem.quantity}
                </span>

                <button
                  onClick={() => {
                    if (cartItem.quantity >= product.stock) return;
                    increaseQty(product._id, cartItem.quantity);
                  }}
                >
                  +
                </button>
              </div>
            )}
          </div>

          {product.description && (
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                {product.description}
              </p>
            </div>
          )}

          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-2">Customer Reviews</h3>
            <p className="text-slate-500">No reviews yet ⭐</p>
          </div>
        </div>
      </div>

      {/* STICKY ADD TO CART – DESKTOP (UNCHANGED) */}
      <div className="hidden lg:block fixed bottom-0 left-0 w-full bg-white border-t shadow z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <p className="font-medium line-clamp-1">{product.title}</p>
            <p className="text-indigo-600 font-bold">
              ₹{discountedPrice}
            </p>
          </div>

          {!cartItem ? (
            <button
              disabled={product.stock === 0}
              onClick={() => {
                if (product.stock <= 0) return;
                addToCart(product);
              }}
              className="rounded-xl bg-indigo-600 px-6 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-4 border rounded-xl px-4 py-2">
              <button
                onClick={() =>
                  decreaseQty(product._id, cartItem.quantity)
                }
              >
                −
              </button>

              <span>{cartItem.quantity}</span>

              <button
                onClick={() => {
                  if (cartItem.quantity >= product.stock) return;
                  increaseQty(product._id, cartItem.quantity);
                }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProductDetails;
