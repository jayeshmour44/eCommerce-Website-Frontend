import { useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/orders/my`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* -------- LOADING -------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your orders...
      </div>
    );
  }

  /* -------- EMPTY -------- */
  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <p className="text-gray-500 text-base sm:text-lg">
          You haven’t placed any orders yet 🛍️
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 sm:px-4 py-8 sm:py-10 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">
          My Orders
        </h2>

        <div className="space-y-4 sm:space-y-5">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow transition"
            >
              {/* TOP ROW */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <p className="text-xs sm:text-sm text-gray-500 break-all">
                  Order ID: <b>{order._id}</b>
                </p>

                <span className="w-fit text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                  {order.status || "Placed"}
                </span>
              </div>

              {/* TOTAL */}
              <p className="font-bold text-indigo-600 mb-3 text-sm sm:text-base">
                Total: ₹ {Math.round(order.totalAmount)}
              </p>

              {/* ITEMS */}
              <div className="border-t pt-3 text-xs sm:text-sm space-y-1">
                {order.items.map((item, i) => (
                  <p key={i} className="flex justify-between">
                    <span className="text-gray-700 line-clamp-1">
                      {item.productId?.title || "Product"}
                    </span>
                    <span className="text-gray-500">
                      × {item.qty}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyOrders;
