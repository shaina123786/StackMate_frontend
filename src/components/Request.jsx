import axios from "axios";
import React, { useEffect } from "react";
import { BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { addRequest, removeRequest } from "../utils/requestSlice";

const Request = () => {
  const request = useSelector((store) => store.request);
  const dispatch = useDispatch();

  const fetchRequest = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/request/received", {
        withCredentials: true,
      });

      dispatch(addRequest(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, []);

  if (!request) return <h1>Loading...</h1>;

  if (request.length === 0)
    return <h1 className="text-center mt-10">No Request Found!</h1>;

  const handleRequest = async (status, requestId) => {
    // 🟢 1. INSTANT REDUX REMOVE (Immediate Card Gayab Ho Jayega)
    dispatch(removeRequest(requestId));

    // 2. BACKGROUND API CALL
    try {
      await axios.post(
        BASE_URL + "/request/review/" + status + "/" + requestId,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.log(err);
      // Fail hone par dobara fetch kar sakein
      fetchRequest();
    }
  };

  return (
    <div className="flex flex-col items-center my-10 gap-6">
      {request.map((reqItem) => {
        // 🟢 FIX: reqItem._id (Request document ID) for review API & Redux remove
        const requestId = reqItem._id;
        const { firstName, lastName, photoUrl, about, skills } =
          reqItem.sender || {};

        return (
          <div
            key={requestId}
            className="w-[450px] bg-[#0f172a] rounded-2xl p-5 flex gap-4 shadow-lg border border-[#C9A84C]/30 hover:shadow-[0_0_25px_rgba(201,168,76,0.25)] transition"
          >
            {/* IMAGE */}
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="profile"
                className="w-25 h-25 rounded-full object-cover border-2 border-[#C9A84C]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-500 to-yellow-700 text-black text-xl font-bold border-2 border-[#C9A84C]">
                {firstName?.charAt(0).toUpperCase()}
              </div>
            )}

            {/* MAIN CONTENT */}
            <div className="flex flex-col flex-1 justify-between">
              {/* TOP */}
              <div>
                <h2 className="text-[#C9A84C] text-lg font-semibold">
                  {firstName} {lastName}
                </h2>

                {/* Skills */}
                {skills?.length > 0 && (
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {skills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-[2px] rounded-full bg-[#C9A84C]/20 text-[#C9A84C]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bio */}
                <p className="text-gray-400 text-sm mt-2 leading-relaxed line-clamp-2">
                  {about && about !== "this is default"
                    ? about
                    : "✨ No bio yet"}
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 mt-3 min-w-[90px]">
                <button
                  onClick={() => handleRequest("rejected", requestId)}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition cursor-pointer active:scale-95"
                >
                  Reject
                </button>

                <button
                  onClick={() => handleRequest("accepted", requestId)}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-green-100 text-green-600 hover:bg-green-200 transition cursor-pointer active:scale-95"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Request;