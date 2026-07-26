import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constant";
import { addUser } from "../utils/userSlice";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (userData) {
      setLoading(false);
      return;
    }

    try {
      // 🟢 FIX: Ensure this endpoint matches your profile view route (e.g., /profile/view or /user)
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });

      const userObj = res?.data?.data || res?.data;
      dispatch(addUser(userObj));
    } catch (err) {
      // If /profile/view gives 404, check your backend profileRouter!
      if (err?.response?.status === 401) {
        if (location.pathname !== "/signup") {
          navigate("/login");
        }
      }
      console.log("Fetch user error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] text-[#C9A84C]">
        <h2 className="text-xl font-semibold animate-pulse">Loading DevTinder...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #F5EDD6 0%, #FDF6E3 40%, #F0E6C8 100%)",
      }}
    >
      <Navbar />
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Body;