import { useState } from "react";

export default function useRequireLogin() {
  const [showLogin, setShowLogin] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const requireLogin = (action) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setPendingAction(() => action);
      setShowLogin(true);
      return;
    }

    action();
  };

  const onLoginSuccess = () => {
    setShowLogin(false);
    pendingAction && pendingAction();
    setPendingAction(null);
  };

  return {
    requireLogin,
    showLogin,
    setShowLogin,
    onLoginSuccess,
  };
}
