import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";
import { removeUser } from "../utils/userSlice";
import axios from "axios";
import { createSocketConnection } from "../utils/socket";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((store) => store.user);
  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [msgNotifs, setMsgNotifs] = useState([]); // 🔔 NEW: real-time message notifications
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchNotif = async () => {
      try {
        const reqRes = await axios.get(BASE_URL + "/user/request/received", {
          withCredentials: true,
        });

        const conRes = await axios.get(BASE_URL + "/user/connections", {
          withCredentials: true,
        });

        // 🔔 NEW: DB me save hui (persisted) message notifications bhi laao —
        // isse logout/login ke baad bhi ye dikhengi
        const msgRes = await axios.get(BASE_URL + "/user/message-notifications", {
          withCredentials: true,
        });

        setRequests(reqRes.data.data || []);
        // Get last 3 connections for dropdown
        setConnections((conRes.data.data || []).reverse().slice(0, 3));

        setMsgNotifs(
          (msgRes.data.data || []).map((n) => ({
            type: "message",
            data: n.sender,
            id: `msg-${n.sender?._id}`, // sender ke hisaab se fixed id — isliye duplicate nahi banega
          }))
        );
      } catch (err) {
        console.log(err);
      }
    };

    if (user) {
      fetchNotif();
    }
  }, [user]);

  // 🔔 NEW: koi bhi message bheje to bell wale dropdown me bhi turant dikhe
  // (chahe tum us chat me na bhi ho, poore app me kahin bhi ho)
  useEffect(() => {
    console.log("🔔 [DEBUG-FRONTEND] Navbar notification-effect ran, user is:", user);
    if (!user) return;

    const socket = createSocketConnection();

    socket.on("connect", () => {
      console.log("🔔 [DEBUG-FRONTEND] socket connected:", socket.id, "registering user:", user._id);
      socket.emit("registerUser", user._id);
    });

    socket.on("newMessageNotification", (data) => {
      console.log("🔔 [DEBUG-FRONTEND] newMessageNotification received:", data);
      setMsgNotifs((prev) => {
        // Isi sender ka purana entry hai to use hata do, phir naye timestamp ke saath
        // sabse upar daal do — isse ek sender ka hamesha ek hi entry rahega
        const withoutThisSender = prev.filter((n) => n.id !== `msg-${data.senderId}`);
        return [
          {
            type: "message",
            data: { _id: data.senderId, firstName: data.senderName, photoUrl: null },
            id: `msg-${data.senderId}`,
          },
          ...withoutThisSender,
        ];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const allNotif = [
    ...msgNotifs, // 🔔 NEW: sabse naye message notifications sabse upar
    ...requests.map((r) => ({
      type: "request",
      data: r.sender,
      id: r._id,
    })),
    ...connections.map((c) => ({
      type: "accepted",
      data: c,
      id: c._id,
    })),
  ];

  return (
    <div
      className="flex justify-between items-center px-8 py-4 sticky top-0 z-50"
      style={{
        background: "#070B14",
        borderBottom: "1px solid #C9A84C44",
        boxShadow: "0 2px 20px rgba(201, 168, 76, 0.1)",
      }}
    >
      {/* LOGO - Pointed to /feed */}
      <Link
        to="/feed"
        className="flex items-center gap-2 hover:scale-105 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          fill="none"
          stroke="#C9A84C"
          strokeWidth="2"
          className="drop-shadow-[0_0_6px_rgba(201,168,76,0.6)]"
        >
          <path d="M13 2L3 14h7v8l10-12h-7z" />
        </svg>

        <span className="text-xl font-bold tracking-widest text-[#C9A84C]">
          StackMate
        </span>
      </Link>

      {/* USER SECTION */}
      {user && (
        <div className="flex items-center gap-5">
          {/* 🔔 NOTIFICATION BELL */}
          <div ref={notifRef} className="relative mt-1">
            <div
              onClick={() => setShowNotif(!showNotif)}
              className="cursor-pointer text-2xl text-[#C9A84C] hover:scale-110 transition duration-200"
            >
              🔔
            </div>

            {/* COUNT BADGE */}
            {allNotif.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                {allNotif.length}
              </span>
            )}

            {/* DROPDOWN POPUP */}
            {showNotif && (
              <div className="absolute right-0 mt-4 w-72 p-4 rounded-2xl bg-[#111827] border border-[#C9A84C33] shadow-[0_10px_40px_rgba(0,0,0,0.7)] animate-fadeIn z-50">
                <p className="text-[#C9A84C] font-bold mb-3 tracking-wide">
                  Notifications
                </p>

                {allNotif.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">
                    No notifications yet
                  </p>
                ) : (
                  <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {allNotif.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 text-sm text-gray-300 pb-2 border-b border-gray-800 last:border-0"
                      >
                        {item.data?.photoUrl ? (
                          <img
                            src={item.data.photoUrl}
                            alt="avatar"
                            className="w-7 h-7 rounded-full object-cover border border-[#C9A84C44]"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-black text-xs font-bold border border-[#C9A84C44]">
                            {item.data?.firstName?.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <p className="flex-1">
                          <span className="text-[#C9A84C] font-semibold">
                            {item.data?.firstName}
                          </span>{" "}
                          <span className="text-gray-300">
                            {/* 🟢 TOP DROPDOWN TEXT FIX HERE */}
                            {item.type === "request"
                              ? "sent you a request"
                              : item.type === "message"
                              ? "sent you a message"
                              : "is now connected with you"}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  to="/notifications"
                  onClick={() => setShowNotif(false)}
                  className="block text-center mt-3 text-[#C9A84C] text-sm font-semibold hover:underline"
                >
                  View all
                </Link>
              </div>
            )}
          </div>

          {/* WELCOME TEXT */}
          <span className="text-sm text-[#E8D5A3]">
            Welcome,{" "}
            <span className="text-[#C9A84C] font-semibold">
              {user.firstName}
            </span>
          </span>

          {/* AVATAR DROPDOWN */}
          <div className="dropdown dropdown-end mt-1">
            <div
              tabIndex={0}
              role="button"
              className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden cursor-pointer border-2 border-[#C9A84C] hover:scale-105 transition"
            >
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-black text-lg font-bold">
                  {user.firstName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* MENU */}
            <ul
              tabIndex={-1}
              className="menu dropdown-content mt-4 w-56 p-2 rounded-xl shadow-xl z-50"
              style={{
                background: "#111827",
                border: "1px solid #C9A84C33",
              }}
            >
              <li>
                <Link
                  to="/profile/edit"
                  className="text-[#E8D5A3] hover:bg-[#C9A84C]/10 rounded-lg py-2.5"
                >
                  👤 Profile
                </Link>
              </li>
              <Link 
    to="/feed" 
    className="px-4 py-2 hover:bg-[#C9A84C]/20 text-white hover:text-[#C9A84C] font-semibold rounded-xl transition flex items-center gap-2"
  >
    📰 Feed
  </Link>

              <li>
                <Link
                  to="/connections"
                  className="text-[#E8D5A3] hover:bg-[#C9A84C]/10 rounded-lg py-2.5"
                >
                  🤝 Connections
                </Link>
              </li>

              <li>
                <Link
                  to="/request"
                  className="text-[#E8D5A3] hover:bg-[#C9A84C]/10 rounded-lg py-2.5"
                >
                  📩 Requests
                </Link>
              </li>

              <div className="h-px bg-gray-800 my-1.5"></div>

              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-red-500/10 rounded-lg py-2.5"
                >
                  🚪 Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;