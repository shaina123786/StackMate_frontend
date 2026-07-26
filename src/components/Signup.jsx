import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    try {
      setError("");
      setSuccessMsg("");

      // 1. Signup Request
      await axios.post(
        BASE_URL + "/signup",
        { firstName, lastName, emailId, password },
        { withCredentials: true }
      );

      // 2. Success Alert/Message
      setSuccessMsg("✨ Account created successfully! Redirecting to login...");

      // 3. 1.5 Second baad Login Page par redirect
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err?.response?.data || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0A0F1E] to-[#111827]">
      <div className="w-[380px] p-8 rounded-2xl bg-[#111827] border border-[#C9A84C]/30 shadow-[0_0_40px_rgba(201,168,76,0.1)]">
        {/* TITLE */}
        <h2 className="text-center text-2xl font-bold text-[#C9A84C] tracking-widest">
          STACKMATE
        </h2>

        <p className="text-center text-gray-400 text-sm mt-1">
          Create your account
        </p>

        <div className="w-16 h-[2px] mx-auto mt-3 mb-6 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent"></div>

        {/* INPUTS */}
        <div className="flex flex-col gap-4">
          <input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="input-style"
          />

          <input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="input-style"
          />

          <input
            placeholder="Email"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            className="input-style"
          />

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-style pr-10"
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
                opacity: 0.8,
              }}
            >
              {showPassword ? (
                // 🙈 hide icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
                  />
                </svg>
              ) : (
                // 👁 show icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        {successMsg && (
          <p className="text-green-400 text-sm mt-3 font-semibold text-center animate-pulse">
            {successMsg}
          </p>
        )}
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

        {/* BUTTON */}
        <button
          onClick={handleSignup}
          className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold hover:scale-105 transition"
        >
          Sign Up
        </button>

        {/* LOGIN LINK */}
        <p className="text-center text-gray-400 text-sm mt-4">
          Already a user?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-[#C9A84C] cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;