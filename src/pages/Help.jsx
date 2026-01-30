import React from "react";

function Help() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 sm:px-6 py-10">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-gray-800">
            Help & Support
          </h1>
          <p className="text-gray-500 mt-2">
            We’re here to help you with your orders and payments
          </p>
        </div>

        {/* SUPPORT CARDS */}
        <div className="space-y-6">
          {/* ORDER ISSUES */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              📦 Order Related Issues
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Facing order delays, cancellations, or refund-related problems?
              Our support team is here to assist you.
            </p>
          </div>

          {/* PAYMENT ISSUES */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              💳 Payment Issues
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Help with failed payments, refund status, or wallet-related
              queries.
            </p>
          </div>

          {/* CONTACT */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              📞 Contact Support
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Email:{" "}
              <span className="text-indigo-600 font-medium">
                support@onlineshop.com
              </span>
              <br />
              Phone:{" "}
              <span className="text-indigo-600 font-medium">
                +91 98765 43210
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;
