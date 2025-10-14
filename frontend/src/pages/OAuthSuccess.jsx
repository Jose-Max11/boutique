import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OauthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // Optional: decode token to get role
      const payload = JSON.parse(atob(token.split(".")[1]));
      localStorage.setItem("role", payload.role);
      if (payload.role === "admin") navigate("/admin");
      else navigate("/user");
    }
  }, [searchParams, navigate]);

  return <p>Logging you in...</p>;
}
