import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const user = useSelector((store) => store.user);

  useEffect(() => {
    if (user) {
      navigate("/profile/edit");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        {
          emailId,
          password,
        },
        {
          withCredentials: true,
        }
      );

      // Extracts user data if wrapped inside res.data.data or res.data
      const userObj = res?.data?.data || res?.data;
      dispatch(addUser(userObj));
      navigate("/profile/edit");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
      console.error("LOGIN Error:", err?.response?.data || err.message);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #0A0F1E 0%, #111827 50%, #0D1B2A 100%)",
        margin: "-20px",
      }}
    >
      <div
        className="w-96 rounded-2xl p-8"
        style={{
          background: "rgba(17, 24, 39, 0.95)",
          border: "3px solid rgba(201, 168, 76, 0.4)",
          boxShadow:
            "0 0 80px rgba(201, 168, 76, 0.1), 0 55px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold tracking-widest mb-1"
            style={{ color: "#C9A84C" }}
          >
            StackMate
          </h1>
          <div
            className="w-16 h-px mx-auto my-3"
            style={{
              background:
                "linear-gradient(90deg, transparent, #C9A84C, transparent)",
            }}
          />
          <p style={{ color: "#9CA3AF", fontSize: "13px" }}>
            Welcome back — sign in to continue
          </p>
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label
            className="block text-xs font-semibold mb-2 tracking-widest uppercase"
            style={{ color: "#C9A84C" }}
          >
            Email
          </label>
          <input
            type="email"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            placeholder="Enter your email"
            autoComplete="off"
            className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none"
            style={{
              background: "#0A0F1E",
              border: "1px solid rgba(201, 168, 76, 0.25)",
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#C9A84C";
              e.target.style.boxShadow = "0 0 12px rgba(201, 168, 76, 0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(201, 168, 76, 0.25)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Password Field */}
        <div className="mb-7">
          <label
            className="block text-xs font-semibold mb-2 tracking-widest uppercase"
            style={{ color: "#C9A84C" }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none"
              style={{
                background: "#0A0F1E",
                border: "1px solid rgba(201, 168, 76, 0.25)",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#C9A84C";
                e.target.style.boxShadow = "0 0 12px rgba(201, 168, 76, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(201, 168, 76, 0.25)";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#C9A84C",
                opacity: 0.7,
              }}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-center text-sm"
            style={{
              background: "rgba(255, 107, 107, 0.1)",
              border: "1px solid rgba(255, 107, 107, 0.3)",
              color: "#FF6B6B",
              letterSpacing: "0.5px",
            }}
          >
            ⚠️ {error}
          </div>
        )}
        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleLogin}
            className="flex-1 py-3 rounded-lg text-sm font-bold tracking-widest uppercase transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #D4A017)",
              color: "#0A0F1E",
            }}
            onMouseOver={(e) => (e.target.style.opacity = "0.85")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="flex-1 py-3 rounded-lg text-sm font-bold tracking-widest uppercase transition-all duration-300"
            style={{
              background: "transparent",
              border: "1px solid #C9A84C",
              color: "#C9A84C",
            }}
          >
            SIGN UP
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#4B5563" }}>
          Connect with developers worldwide ✦
        </p>
      </div>
    </div>
  );
};

export default Login;