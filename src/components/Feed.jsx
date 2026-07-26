import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constant";
import { addFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();

  const getFeed = async () => {
    // if (feed) return;
    if (feed && feed.length > 0) return;
    try {
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });
      dispatch(addFeed(res?.data?.data));
    } catch (err) {
      console.log(err.response?.data);
      console.log(err);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-6 my-10">
      {feed === null ? (
        <p className="text-gray-400">Loading...</p>
      ) : feed.length === 0 ? (
        <p className="text-[#C9A84C] font-semibold text-xl">No Users Found</p>
      ) : (
        feed.map((user, index) => {
          // 🟢 SIRF FIRST USER (INDEX 0) HI SHOW HOGA, BAAKI HIDE HO JAYENGE
          if (index !== 0) return null;

          return <UserCard key={user._id || index} user={user} />;
        })
      )}
    </div>
  );
};

export default Feed;