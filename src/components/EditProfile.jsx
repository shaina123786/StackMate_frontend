import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constant";
import UserCard from "./UserCard";

const EditProfile = ({ user }) => {
  const dispatch = useDispatch();

  const uploadInputRef = useRef(null);
  const videoRef = useRef(null);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");

  const [showImageModal, setShowImageModal] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  const [skillsInput, setSkillsInput] = useState(
    Array.isArray(user?.skills) ? user.skills.join(", ") : ""
  );

  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.Gender || user?.gender || "");
  const [about, setAbout] = useState(user?.about || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhotoUrl(user.photoUrl || "");
      setAge(user.age || "");
      setGender(user.Gender || user.gender || "");
      setAbout(user.about || "");
      setSkillsInput(
        Array.isArray(user.skills) ? user.skills.join(", ") : ""
      );
    }
  }, [user]);

  const formattedSkillsArray = skillsInput
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // 📁 Handle File Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
    setShowImageModal(false);
  };

  // 📸 REAL CAMERA OPEN FUNCTION
  const startCamera = async () => {
    setShowImageModal(false);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Unable to access camera. Please allow camera permission.");
      setIsCameraActive(false);
    }
  };

  // 📸 SNAP SELFIE PHOTO
  const captureSelfie = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageUrl = canvas.toDataURL("image/png");
      setPhotoUrl(imageUrl);
      stopCamera();
    }
  };

  // 🛑 STOP CAMERA
  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
    setMediaStream(null);
  };

  const handleSave = async () => {
    try {
      setError("");

      const res = await axios.put(
        BASE_URL + "/update",
        {
          firstName,
          lastName,
          photoUrl,
          age: age ? Number(age) : undefined,
          Gender: gender ? gender.toLowerCase() : undefined,
          about,
          skills: formattedSkillsArray,
        },
        { withCredentials: true }
      );

      const updatedUser = res?.data?.data || res?.data;
      dispatch(addUser(updatedUser));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.log("SAVE ERROR:", err);
      const serverErr = err?.response?.data;
      setError(
        typeof serverErr === "string"
          ? serverErr
          : serverErr?.message || "Something went wrong"
      );
    }
  };

  const inputStyle = {
    background: "#0A0F1E",
    border: "1px solid rgba(201, 168, 76, 0.25)",
    color: "#C9A84C",
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    outline: "none",
    fontSize: "14px",
  };

  return (
    <div className="flex justify-center items-start gap-10 mt-5 max-w-6xl mx-auto">
      {/* TOAST */}
      {success && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
          <div className="px-6 py-3 rounded-xl bg-[#111827] border border-[#C9A84C]/40 text-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.3)] font-semibold">
            ✨ Profile saved successfully
          </div>
        </div>
      )}

      {/* HIDDEN FILE INPUT */}
      <input
        type="file"
        ref={uploadInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      {/* 🟢 POPUP MODAL FOR IMAGE SELECTION */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-[#111827] border border-[#C9A84C]/50 rounded-2xl p-6 w-[320px] text-center shadow-[0_0_30px_rgba(201,168,76,0.2)]">
            <h3 className="text-[#C9A84C] font-bold text-lg mb-4">
              Select Profile Picture
            </h3>

            <div className="flex flex-col gap-3">
              <button
                onClick={startCamera}
                className="py-2.5 px-4 rounded-xl bg-[#0A0F1E] border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black font-semibold transition flex items-center justify-center gap-2"
              >
                📸 Take Selfie
              </button>

              <button
                onClick={() => uploadInputRef.current.click()}
                className="py-2.5 px-4 rounded-xl bg-[#0A0F1E] border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black font-semibold transition flex items-center justify-center gap-2"
              >
                📁 Upload Photo
              </button>

              <button
                onClick={() => setShowImageModal(false)}
                className="mt-2 text-gray-400 text-sm hover:text-red-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 REAL CAMERA STREAMING MODAL */}
      {isCameraActive && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#111827] border border-[#C9A84C] p-4 rounded-2xl flex flex-col items-center gap-4">
            <h3 className="text-[#C9A84C] font-bold">Take a Selfie</h3>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-72 h-72 rounded-2xl object-cover border-2 border-[#C9A84C]"
            />

            <div className="flex gap-4">
              <button
                onClick={captureSelfie}
                className="px-5 py-2 bg-[#C9A84C] text-black font-bold rounded-xl hover:scale-105 transition"
              >
                📸 Snap Photo
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT FORM */}
      <div className="w-[420px] sticky top-20">
        <div className="p-[2px] rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#8B6914]">
          <div className="bg-[#111827] rounded-2xl p-6">
            <div className="text-center mb-6">
              <h2 className="text-[#C9A84C] text-2xl font-bold tracking-widest">
                EDIT PROFILE
              </h2>
              <div className="w-16 h-[2px] mx-auto mt-2 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent"></div>
            </div>

            <div className="flex flex-col gap-3">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={inputStyle}
                placeholder="First Name"
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={inputStyle}
                placeholder="Last Name"
              />

              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                style={inputStyle}
                placeholder="Age"
              />

              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select gender</option>
                <option value="male">male</option>
                <option value="female">female</option>
                <option value="other">other</option>
              </select>

              <input
                placeholder="Skills"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                style={inputStyle}
              />

              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={3}
                style={inputStyle}
                placeholder="Tell something about yourself"
              />
            </div>

            {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}

            <button
              onClick={handleSave}
              className="w-full mt-5 py-2 rounded-lg font-semibold bg-gradient-to-r from-yellow-500 to-yellow-700 text-black hover:scale-105 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PREVIEW */}
      <div className="w-[420px] flex flex-col items-center">
        <p className="text-[#C9A84C] text-sm mb-3">Live Preview</p>

        <UserCard
          isEdit={true}
          onImageClick={() => setShowImageModal(true)}
          user={{
            firstName,
            lastName,
            photoUrl,
            age,
            Gender: gender,
            about,
            skills: formattedSkillsArray,
          }}
        />

        <p className="text-gray-400 text-xs mt-4 text-center">
          ✨ This is how your profile will appear to others
        </p>
      </div>
    </div>
  );
};

export default EditProfile;