import { useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


function Profile() {
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({ name: "", email: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.data?.name || "",
          email: data.data?.email || "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateProfile = async () => {
    await fetch(`${API_BASE_URL}/api/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 sm:px-6 py-10">
      <div className="max-w-xl mx-auto">
        {/* HEADER */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 text-center">
          My Profile
        </h1>

        {/* PROFILE CARD */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
          {/* NAME */}
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              disabled={!editing}
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className={`mt-1 w-full px-4 py-3 rounded-xl border outline-none transition
                ${
                  editing
                    ? "bg-white focus:ring-2 focus:ring-indigo-400"
                    : "bg-gray-100 cursor-not-allowed"
                }
              `}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-600">Email Address</label>
            <input
              disabled={!editing}
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className={`mt-1 w-full px-4 py-3 rounded-xl border outline-none transition
                ${
                  editing
                    ? "bg-white focus:ring-2 focus:ring-indigo-400"
                    : "bg-gray-100 cursor-not-allowed"
                }
              `}
            />
          </div>

          {/* ACTIONS */}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={updateProfile}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
              >
                Save Changes
              </button>

              <button
                onClick={() => setEditing(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
