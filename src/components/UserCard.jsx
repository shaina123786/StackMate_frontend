import React, { useState } from "react";
import { BASE_URL } from "../utils/constant";
import axios from "axios";
import { useDispatch } from "react-redux";
import { removeFeed } from "../utils/feedSlice";

const UserCard = ({ user, isEdit, onImageClick }) => {
  const dispatch = useDispatch();
  const [swipeClass, setSwipeClass] = useState(""); // 🟢 SWIPE DIRECTION STATE

  const { _id, age, Gender, skills, about, firstName, lastName, photoUrl } =
    user || {};

  const firstLetter = firstName ? firstName.charAt(0).toUpperCase() : "?";

  const handleSendReq = async (status, receiver) => {
    // 1. Swipe Animation Trigger Karo
    if (status === "ignored") {
      setSwipeClass("-translate-x-[150%] -rotate-12 opacity-0"); // Left Swipe
    } else if (status === "interested") {
      setSwipeClass("translate-x-[150%] rotate-12 opacity-0"); // Right Swipe
    }

    // 2. Animation khatam hote hi API Call + Redux Remove
    setTimeout(async () => {
      try {
        await axios.post(
          BASE_URL + "/request/send/" + status + "/" + receiver,
          {},
          { withCredentials: true }
        );
        dispatch(removeFeed(receiver));
        setSwipeClass(""); // Reset for next user
      } catch (err) {
        console.log(err);
        setSwipeClass("");
      }
    }, 300); // 300ms smooth transition time
  };

  return (
    <div
      className={`w-[340px] min-h-[440px] bg-[#111827] rounded-[30px] p-6 flex flex-col justify-between items-center border border-[#C9A84C]/30 transition-all duration-300 transform hover:scale-[1.02] shadow-[0_10px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_0_40px_rgba(201,168,76,0.25)] ${swipeClass}`}
    >
      {/* 🟢 TOP CONTENT CONTAINER */}
      <div className="flex flex-col items-center w-full">
        {/* 📸 AVATAR CIRCLE */}
        <div className="relative my-3">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="profile"
              className="w-36 h-36 rounded-full object-cover border-4 border-[#C9A84C] shadow-lg"
            />
          ) : (
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-black text-5xl font-bold shadow-lg border-2 border-[#C9A84C]">
              {firstLetter}
            </div>
          )}

          {/* EDIT MODE (+) BUTTON */}
          {isEdit && (
            <button
              type="button"
              onClick={onImageClick}
              title="Change Profile Picture"
              className="absolute bottom-1 right-1 bg-[#C9A84C] text-black w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xl shadow-lg border-2 border-[#111827] hover:scale-110 transition cursor-pointer z-10"
            >
              +
            </button>
          )}
        </div>

        {/* 🟢 NAME & DETAILS */}
        <div className="text-center mt-7 w-full">
          <h2 className="text-2xl font-bold text-[#C9A84C] tracking-wide">
            {firstName || "First Name"} {lastName || ""}
          </h2>

          {(age || Gender) && (
            <p className="text-gray-400 text-sm mt-1 capitalize">
              {age ? `${age}, ` : ""}
              {Gender || ""}
            </p>
          )}

          {/* SKILLS */}
          {skills && skills.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-3 mb-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs rounded-full bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30 font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          <div className="w-12 h-[1px] bg-[#C9A84C]/30 mx-auto my-3"></div>

          {/* BIO */}
          <p className="italic text-gray-400 text-sm px-2 leading-relaxed">
            {about ? about : "✨ No bio yet"}
          </p>
        </div>
      </div>

      {/* 🟢 ACTION BUTTONS */}
      {!isEdit && (
        <div className="flex justify-between mt-5 gap-3 w-full">
          <button
            onClick={() => handleSendReq("ignored", _id)}
            className="w-1/2 py-2 rounded-xl bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition cursor-pointer"
          >
            Ignore
          </button>

          <button
            onClick={() => handleSendReq("interested", _id)}
            className="w-1/2 py-2 rounded-xl bg-green-100 text-green-600 font-semibold hover:bg-green-200 transition cursor-pointer"
          >
            Interested
          </button>
        </div>
      )}
    </div>
  );
};

export default UserCard;