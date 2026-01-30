import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import RatingStars from "../components/RatingStars";
import { getImageUrl } from "../utils/getImageUrl";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Cart() {
  const {
    cart,
    increaseQty,
    decreaseQty,
    clearCartAfterOrder,

    getDiscountedPrice,
    getItemTotal,
    getCartTotal,
    getTotalMRP,
    getTotalDiscount,
  } = useCart();

  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loadingOffer, setLoadingOffer] = useState(false);
  const [offerInfo, setOfferInfo] = useState(null);

  const subtotal = getCartTotal();
  const deliveryFee = cart.length > 0 ? 40 : 0;
  const total = Math.max(Math.round(subtotal + deliveryFee - discount), 0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/offers`)
      .then((res) => res.json())
      .then((data) => setOffers(data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setDiscount(0);
    setOfferInfo(null);
    setSelectedOffer("");
  }, [cart]);

  const applyOffer = async () => {
    if (!selectedOffer) {
      alert("Please select an offer");
      return;
    }

    setLoadingOffer(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/apply-offer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product._id,
            price: getDiscountedPrice(item.product),
            qty: item.quantity,
          })),
          offerId: selectedOffer,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setDiscount(data.discountAmount || 0);
        setOfferInfo({
          title:
            data.offerTitle ||
            offers.find((o) => o._id === selectedOffer)?.title ||
            "Offer",
        });
      } else {
        setDiscount(0);
        setOfferInfo(null);
        alert(data.message || "Offer not applicable");
      }
    } catch {
      alert("Failed to apply offer");
    } finally {
      setLoadingOffer(false);
    }
  };

  const placeOrder = async () => {
    const token = localStorage.getItem("token");

    if (!token || !cart || cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const outOfStockItem = cart.find(
      (item) => item.quantity > item.product.stock
    );

    if (outOfStockItem) {
      alert(
        `${outOfStockItem.product.title} has only ${outOfStockItem.product.stock} items left`
      );
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product._id,
            finalPrice: item.finalPrice,
            qty: item.quantity,
          })),
          offerId: selectedOffer || null,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Order failed");
        return;
      }

      await clearCartAfterOrder();
      setDiscount(0);
      setSelectedOffer("");
      setOfferInfo(null);

      alert("Order placed successfully 🎉");
    } catch (err) {
      alert("Something went wrong");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm sm:text-lg">
          Your cart is empty 🛒
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-2 sm:px-6 py-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">

        {/* CART ITEMS */}
        <div className="lg:col-span-2">
          <h1 className="text-lg sm:text-3xl font-extrabold mb-4">
            Your Cart
          </h1>

          <div className="space-y-3 sm:space-y-4">
            {cart.map((item) => {
              const product = item.product;
              const qty = item.quantity;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-xl border shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4"
                >
                  <img
                    src={getImageUrl(product.thumbnail || product.images?.[0])}
                    alt={product.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto sm:mx-0"
                  />

                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-semibold text-sm sm:text-base line-clamp-2">
                      {product.title}
                    </h4>

                    {product.rating && (
                      <div className="flex justify-center sm:justify-start gap-1 mt-1">
                        <RatingStars rating={product.rating} />
                        <span className="text-xs text-gray-500">
                          ({product.rating})
                        </span>
                      </div>
                    )}

                    <div className="mt-1">
                      <span className="text-indigo-600 font-bold">
                        ₹{getDiscountedPrice(product)}
                      </span>
                      {product.discountPercentage > 0 && (
                        <span className="ml-2 text-xs text-gray-400 line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Item Total: ₹{getItemTotal({ ...product, qty })}
                    </p>
                  </div>

                  <div className="flex justify-center sm:justify-end">
                    <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                      <button
                        onClick={() => decreaseQty(product._id, qty)}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 font-bold"
                      >
                        −
                      </button>
                      <span className="font-semibold">{qty}</span>
                      <button
                        onClick={() => {
                          if (qty >= product.stock) return;
                          increaseQty(product._id, qty);
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PRICE SUMMARY */}
        <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-6 h-fit">
          <h2 className="text-base sm:text-lg font-semibold mb-4">
            Price Details
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total MRP</span>
              <span>₹ {getTotalMRP()}</span>
            </div>

            <div className="flex justify-between text-green-600">
              <span>You Save</span>
              <span>- ₹ {getTotalDiscount()}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹ {deliveryFee}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-700 font-semibold">
                <span>Offer Discount</span>
                <span>- ₹ {discount}</span>
              </div>
            )}

            <hr />

            <div className="flex justify-between font-bold text-base sm:text-lg">
              <span>Total Payable</span>
              <span>₹ {total}</span>
            </div>
          </div>

          <select
            value={selectedOffer}
            onChange={(e) => setSelectedOffer(e.target.value)}
            className="w-full border rounded-lg p-2 mt-4 text-sm"
          >
            <option value="">Apply Offer</option>
            {offers.map((offer) => (
              <option key={offer._id} value={offer._id}>
                {offer.title}
                {offer.minCartValue ? ` (Min ₹${offer.minCartValue})` : ""}
              </option>
            ))}
          </select>

          <button
            onClick={applyOffer}
            disabled={loadingOffer}
            className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg"
          >
            {loadingOffer ? "Applying..." : "Apply Offer"}
          </button>

          {offerInfo && (
            <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded">
              🎉 <b>{offerInfo.title}</b> applied
            </div>
          )}

          <button
            onClick={placeOrder}
            className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-lg"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
