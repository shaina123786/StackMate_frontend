import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constant";

const Feed = () => {
  const [feedUsers, setFeedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });
      setFeedUsers(res?.data?.data || res?.data || []);
    } catch (err) {
      console.error("Feed Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleSendRequest = async (status, userId) => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );
      // Request bhejne ke baad user ko list se hata do
      setFeedUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (err) {
      console.error("Request Error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-[#C9A84C] text-lg font-semibold animate-pulse">Loading Feed...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center my-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#C9A84C] mb-6 tracking-wide">
        Explore Developers & Profiles
      </h1>

      {feedUsers.length === 0 ? (
        <div className="p-8 bg-[#111827] rounded-3xl border border-[#C9A84C]/20 text-center w-full max-w-md">
          <p className="text-gray-400 text-lg italic">✨ No new users found in your feed!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {feedUsers.map((user) => (
            <div
              key={user._id}
              className="bg-[#111827] border border-[#C9A84C]/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-[#C9A84C] transition duration-300"
            >
              <div>
                <div className="flex items-center gap-4 mb-3">
                  {user.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt="profile"
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#C9A84C]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center font-bold text-black text-xl border-2 border-[#C9A84C]">
                      {user.firstName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-[#C9A84C]">
                      {user.firstName} {user.lastName || ""}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {user.Gender ? `${user.Gender}, ` : ""}{user.age ? `${user.age} yrs` : ""}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                  {user.about || "No bio available"}
                </p>

                {/* Skills Badges */}
                {user.skills && user.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="text-xs px-2.5 py-1 rounded-md bg-[#0A0F1E] text-[#C9A84C] border border-[#C9A84C]/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => handleSendRequest("ignored", user._id)}
                  className="flex-1 py-2 rounded-xl border border-red-500/40 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition"
                >
                  Ignore ✖
                </button>
                <button
                  onClick={() => handleSendRequest("interested", user._id)}
                  className="flex-1 py-2 rounded-xl bg-[#C9A84C] text-[#0A0F1E] text-xs font-bold hover:bg-yellow-500 transition"
                >
                  Connect 🤝
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;