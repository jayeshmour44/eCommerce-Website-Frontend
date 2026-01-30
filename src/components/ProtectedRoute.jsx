import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();

          if (data.message === "Your account has been blocked by admin") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            alert("Your account has been blocked by admin");
          }
        }
      } catch (err) {
        console.error("Auth verify failed");
      } finally {
        setChecking(false);
      }
    };

    if (token) verifyUser();
    else setChecking(false);
  }, [token]);

  // ⏳ wait till verify completes
  if (checking) return null;

  // 🔐 Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🛡️ Admin-only
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
