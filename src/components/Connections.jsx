import axios from "axios";
import React, { useEffect } from "react";
import { BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { Link } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const fetchConnection = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });

      dispatch(addConnections(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchConnection();
  }, []);

  if (!connections)
    return <h1 className="text-center text-[#C9A84C] mt-10">Loading...</h1>;

  if (connections.length === 0)
    return <h1 className="text-center text-gray-400 mt-10">No connection found!</h1>;

  return (
    <div className="flex flex-col items-center my-10 gap-6">
      {connections.map((connection) => {
        const { _id, firstName, lastName, photoUrl, about, skills } = connection;

        return (
          <div
            key={_id}
            className="w-[480px] min-h-[140px] bg-[#0f172a] rounded-2xl p-5 flex items-center justify-between shadow-lg border border-[#C9A84C]/30 hover:shadow-[0_0_25px_rgba(201,168,76,0.25)] transition"
          >
            <div className="flex items-center gap-4">
              {/* IMAGE */}
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#C9A84C]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-500 to-yellow-700 text-black text-xl font-bold border-2 border-[#C9A84C]">
                  {firstName?.charAt(0).toUpperCase()}
                </div>
              )}

              {/* DETAILS */}
              <div className="flex flex-col justify-center max-w-[220px]">
                <h2 className="text-[#C9A84C] text-lg font-semibold">
                  {firstName} {lastName}
                </h2>

                {/* Skills */}
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {skills?.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-[2px] rounded-full bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Bio */}
                <p className="italic text-gray-400 text-xs mt-2 leading-relaxed truncate">
                  {about && about !== "this is default" ? about : "✨ No bio yet"}
                </p>
              </div>
            </div>

            {/* 🟢 MATCHED THEME CHAT BUTTON */}
            <Link to={"/chat/" + _id}>
              <button className="px-4 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#D4A017] text-[#0A0F1E] font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-105 hover:shadow-[0_0_15px_rgba(201,168,76,0.4)] transition cursor-pointer flex items-center gap-1.5">
                💬 Chat
              </button>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default Connections;