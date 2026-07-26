import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constant";
import { createSocketConnection } from "../utils/socket";

const Notification = () => {
  const [allNotif, setAllNotif] = useState([]);
  const [msgNotifs, setMsgNotifs] = useState([]); // 🔔 NEW: separate rakha taaki dedupe aasan ho
  const loggedInUser = useSelector((store) => store.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reqRes = await axios.get(
          BASE_URL + "/user/request/received",
          { withCredentials: true }
        );

        const conRes = await axios.get(
          BASE_URL + "/user/connections",
          { withCredentials: true }
        );

        // 🔔 NEW: DB me persist hui message notifications bhi laao (logout/login ke baad bhi rahengi)
        const msgRes = await axios.get(
          BASE_URL + "/user/message-notifications",
          { withCredentials: true }
        );

        const combined = [
          ...reqRes.data.data.map((r) => ({
            type: "request",
            data: r.sender,
            id: r._id,
          })),
          ...conRes.data.data.map((c) => ({
            type: "accepted",
            data: c,
            id: c._id,
          })),
        ];

        setMsgNotifs(
          (msgRes.data.data || []).map((n) => ({
            type: "message",
            data: n.sender,
            id: `msg-${n.sender?._id}`, // sender ke hisaab se fixed id — duplicate nahi banega
          }))
        );

        // Combine and show accepted connections first
        setAllNotif(combined);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  // 🔔 NEW: real-time message notifications — jab bhi koi msg bheje, turant is list ke
  // top pe dikh jayega (chahe tum us chat me na bhi ho). Same sender dobara bheje to
  // naya entry nahi banega, purana hi upar aa jayega.
  useEffect(() => {
    if (!loggedInUser) return;

    const socket = createSocketConnection();

    socket.on("connect", () => {
      socket.emit("registerUser", loggedInUser._id);
    });

    socket.on("newMessageNotification", (data) => {
      setMsgNotifs((prev) => {
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
  }, [loggedInUser]);

  // 🔔 NEW: message notifications ko baaki notifications ke saath merge karke dikhao
  const combinedNotif = [...msgNotifs, ...allNotif];

  return (
    <div className="flex flex-col items-center my-10 gap-5 max-w-6xl mx-auto px-4">
      {/* TITLE */}
      <div className="text-center mb-4">
        <h1 className="text-3xl text-[#C9A84C] font-extrabold tracking-wider">
          All Notifications
        </h1>
        <div className="w-20 h-[3px] bg-[#C9A84C] mx-auto mt-2 rounded-full shadow-[0_0_10px_#C9A84C66]"></div>
      </div>

      {combinedNotif.length === 0 ? (
        <div className="mt-10 p-10 bg-[#111827] rounded-3xl border border-[#C9A84C]/20 text-center w-[450px]">
          <p className="text-gray-500 text-lg italic">✨ No notifications yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 w-full items-center">
          {combinedNotif.map((item) => (
            <div
              key={item.id}
              className="w-[450px] p-4 bg-[#111827] rounded-2xl border border-[#C9A84C]/20 flex items-center gap-4 shadow-lg hover:border-[#C9A84C]/50 transition duration-300"
            >
              {/* AVATAR */}
              {item.data?.photoUrl ? (
                <img
                  src={item.data.photoUrl}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#C9A84C]/60 shadow-md"
                  alt="profile"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-black text-2xl font-bold border-2 border-[#C9A84C]/60 shadow-md">
                  {item.data?.firstName?.charAt(0).toUpperCase()}
                </div>
              )}

              {/* TEXT */}
              <p className="text-gray-300 text-base leading-relaxed flex-1">
                <span className="text-[#C9A84C] font-bold text-lg">
                  {item.data?.firstName}
                </span>{" "}
                <span className="text-gray-300 ml-1">
                  {/* 🟢 MAIN PAGE TEXT IS HERE */}
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
    </div>
  );
};

export default Notification;