import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { createSocketConnection } from "../utils/socket";
import EmojiPicker, { Theme } from "emoji-picker-react";


const GIPHY_API_KEY = "9MqnXjqXJfkey27FQrgKq1CmmdALZlJO"; // <-- yahan apni real key daalo


const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const Chat = () => {
  const { targetUserId } = useParams();
  const loggedInUser = useSelector((store) => store.user);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  // Popup & Feature States
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activePickerTab, setActivePickerTab] = useState("emoji"); // 'emoji' | 'gif'
  const [activeMsgOptions, setActiveMsgOptions] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  // GIF Search States
  const [gifQuery, setGifQuery] = useState("");
  const [gifResults, setGifResults] = useState([]);
  const [gifLoading, setGifLoading] = useState(false);
  const [gifError, setGifError] = useState(false);

  // Poll States
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // Contact States
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Camera States
  const [showCameraModal, setShowCameraModal] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraStreamRef = useRef(null);

  // Voice Note Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  const socketRef = useRef(null);
  const sentMessagesRef = useRef(new Set());
  const chatBottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get(BASE_URL + "/chat/" + targetUserId, {
        withCredentials: true,
      });
      setMessages(res?.data?.messages || []);
      setTargetUser(res?.data?.targetUser || null);
    } catch (err) {
      console.error("Chat History Fetch Error:", err);
    }
  };

  // 🔔 NEW: chat khulte hi is sender ki pending notification clear (read) kar do
  const clearNotificationForSender = async () => {
    try {
      await axios.delete(BASE_URL + "/user/message-notifications/" + targetUserId, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Clear Notification Error:", err);
    }
  };

  useEffect(() => {
    if (!loggedInUser) return;
    fetchChatHistory();
    clearNotificationForSender();

    const socket = createSocketConnection();
    socketRef.current = socket;

    socket.emit("joinChat", {
      userId: loggedInUser._id,
      targetUserId,
    });

    socket.on("messageReceived", (msgData) => {
      const senderId = typeof msgData.senderId === "object" ? msgData.senderId?._id : msgData.senderId;
      
      if (senderId === loggedInUser?._id && sentMessagesRef.current.has(msgData.text)) {
        sentMessagesRef.current.delete(msgData.text);
        setMessages((prev) => {
          const tempIndex = [...prev]
            .reverse()
            .findIndex(
              (m) =>
                typeof m._id === "string" &&
                m._id.startsWith("temp-") &&
                m.text === msgData.text
            );
          if (tempIndex === -1) return [...prev, msgData]; // temp na mile to bas add kar do
          const realIndex = prev.length - 1 - tempIndex;
          const updated = [...prev];
          updated[realIndex] = msgData;
          return updated;
        });
        return;
      }
      setMessages((prev) => [...prev, msgData]);
    });

   
    socket.on("messageDeleted", ({ msgId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== msgId));
    });

    socket.on("userStatusUpdate", (data) => {
      if (data.userId === targetUserId) {
        setIsOnline(data.isOnline);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [loggedInUser, targetUserId]);

  const handleSendMessage = (content = newMessage, type = "text") => {
    if (!content.trim() && type === "text") return;
    if (!socketRef.current || !loggedInUser) return;

    const replyText = replyTo ? replyTo.text : null;

    
    const optimisticMsg = {
      _id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      senderId: loggedInUser._id,
      text: content,
      type,
      replyToMsg: replyText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    sentMessagesRef.current.add(content);

    socketRef.current.emit("sendMessage", {
      userId: loggedInUser._id,
      targetUserId,
      text: content,
      type,
      replyToMsg: replyText,
    });

    setNewMessage("");
    setReplyTo(null);
    setShowAttachMenu(false);
    setShowEmojiPicker(false);
  };

  
  const getMessageKind = (msg) => {
    if (msg.type) return msg.type;
    if (typeof msg.text === "string") {
      if (msg.text.startsWith("data:audio") || msg.text.startsWith("blob:") && msg.text.includes("audio")) return "audio";
      if (msg.text.startsWith("data:image")) return "image";
    }
    return "text";
  };

  // 🎙️ Voice Note Handler — WhatsApp jaisa "hold to record"
  const startRecording = async (e) => {
    if (e) e.preventDefault();
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        // mic ko poori tarah band karo taaki browser ka recording indicator hat jaye
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size > 0) {
          try {
            
            const base64Audio = await fileToBase64(audioBlob);
            handleSendMessage(base64Audio, "audio");
          } catch (err) {
            console.error("Audio encode error:", err);
            alert("Voice note bhejne me error aaya, dobara try karein");
          }
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone access denied or not supported!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  // 📂 File Upload — ab base64 me bhejte hain (blob URL cross-user kaam nahi karta)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64File = await fileToBase64(file);
      handleSendMessage(base64File, file.type.startsWith("image") ? "image" : "document");
    } catch (err) {
      console.error("File encode error:", err);
      alert("File bhejne me error aaya, dobara try karein");
    } finally {
      e.target.value = ""; // taaki same file dobara select ho sake
    }
  };

  
  const handleDeleteMsg = (msgId, isUnsend = false) => {
    
    setMessages((prev) => prev.filter((msg) => msg._id !== msgId));

    if (isUnsend && socketRef.current) {
      socketRef.current.emit("deleteMessage", { msgId, isUnsend: true, targetUserId });
    }
    setActiveMsgOptions(null);
  };

  // 🖼️ GIF Search (Giphy) — trending on open, search on typing
  const fetchGifs = async (query) => {
   
    if (!GIPHY_API_KEY || GIPHY_API_KEY === "YOUR_GIPHY_API_KEY_HERE") {
      setGifResults([]);
      setGifError("no-key");
      setGifLoading(false);
      return;
    }
    setGifLoading(true);
    setGifError(false);
    try {
      const endpoint = query.trim()
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
            query
          )}&limit=15&rating=g`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=15&rating=g`;
      // timeout laga diya hai taaki agar Giphy slow/blocked ho to "Loading..." hamesha ke liye
      // atka na rahe, balki error dikha ke Retry ka option de
      const res = await axios.get(endpoint, { timeout: 10000 });
      setGifResults(res?.data?.data || []);
    } catch (err) {
      console.error("Gif Fetch Error:", err);
      setGifResults([]);
      setGifError(true);
    } finally {
      setGifLoading(false);
    }
  };

  useEffect(() => {
    if (showEmojiPicker && activePickerTab === "gif") {
      const delayDebounce = setTimeout(() => {
        fetchGifs(gifQuery);
      }, 400);
      return () => clearTimeout(delayDebounce);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gifQuery, activePickerTab, showEmojiPicker]);

  // 📊 Poll Handlers
  const handleAddPollOption = () => setPollOptions((prev) => [...prev, ""]);
  const handlePollOptionChange = (idx, value) => {
    setPollOptions((prev) => prev.map((opt, i) => (i === idx ? value : opt)));
  };
  const handleRemovePollOption = (idx) => {
    setPollOptions((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleCreatePoll = () => {
    const cleanOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (!pollQuestion.trim() || cleanOptions.length < 2) {
      alert("Poll ke liye ek question aur kam se kam 2 options daalein");
      return;
    }
    const pollData = JSON.stringify({ question: pollQuestion.trim(), options: cleanOptions });
    handleSendMessage(pollData, "poll");
    setPollQuestion("");
    setPollOptions(["", ""]);
    setShowPollModal(false);
  };

  // 👤 Contact Handlers
  const handleShareContact = () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      alert("Naam aur phone number dono zaroori hai");
      return;
    }
    const contactData = JSON.stringify({ name: contactName.trim(), phone: contactPhone.trim() });
    handleSendMessage(contactData, "contact");
    setContactName("");
    setContactPhone("");
    setShowContactModal(false);
  };

  // 📷 Camera Handlers
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStreamRef.current = stream;
      setShowAttachMenu(false);
      setShowCameraModal(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (err) {
      alert("Camera access denied ya available nahi hai!");
    }
  };

  const closeCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // base64 data-URL — direct cross-user compatible, blob ki zaroorat nahi
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    handleSendMessage(dataUrl, "image");
    closeCamera();
  };

  return (
    <div className="flex justify-center items-center my-4 px-4">
      <div className="w-full max-w-3xl h-[85vh] bg-[#0A0F1E] rounded-3xl border border-[#C9A84C]/30 flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* 🟢 TOP HEADER */}
        <div className="p-4 bg-[#111827] border-b border-[#C9A84C]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {targetUser?.photoUrl ? (
              <img src={targetUser.photoUrl} alt="profile" className="w-11 h-11 rounded-full object-cover border-2 border-[#C9A84C]" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center font-bold text-black border border-[#C9A84C]">
                {targetUser?.firstName?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <h2 className="text-md font-bold text-[#C9A84C]">
                {targetUser ? `${targetUser.firstName} ${targetUser.lastName || ""}` : "Loading..."}
              </h2>
              <p className="text-xs text-emerald-400 font-medium">
                {isOnline ? "● Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        {/* 🟢 MESSAGES AREA */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[#0A0F1E] relative">
          {messages.map((msg, index) => {
            const senderId = typeof msg.senderId === "object" ? msg.senderId?._id : msg.senderId;
            const isMe = senderId === loggedInUser?._id;
            const kind = getMessageKind(msg);

            let pollData = null;
            if (kind === "poll") {
              try {
                pollData = JSON.parse(msg.text);
              } catch (e) {
                pollData = { question: "", options: [] };
              }
            }

            let contactData = null;
            if (kind === "contact") {
              try {
                contactData = JSON.parse(msg.text);
              } catch (e) {
                contactData = { name: "", phone: "" };
              }
            }

            return (
              <div key={index} className={`relative group flex flex-col max-w-[70%] ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                
                {/* Reply Indicator if applicable */}
                {msg.replyToMsg && (
                  <div className="text-xs bg-gray-800/80 text-gray-300 p-1.5 rounded-t-lg border-l-2 border-[#C9A84C] mb-1">
                    ↳ {msg.replyToMsg}
                  </div>
                )}

                <div className={`px-4 py-2.5 rounded-2xl text-sm relative transition ${
                  msg.isDeleted
                    ? "bg-gray-800/50 text-gray-400 italic border border-gray-700"
                    : isMe
                    ? "bg-[#C9A84C] text-[#0A0F1E] font-semibold rounded-br-none"
                    : "bg-[#111827] text-white border border-[#C9A84C]/20 rounded-bl-none"
                }`}>
                  {kind === "image" ? (
                    <img src={msg.text} alt="sent attachment" className="w-48 h-auto rounded-lg" />
                  ) : kind === "audio" ? (
                    <audio controls src={msg.text} className="h-8 w-48" />
                  ) : kind === "document" ? (
                    <a href={msg.text} download className="underline break-all">📎 Document</a>
                  ) : kind === "poll" && pollData ? (
                    <div className="min-w-[180px]">
                      <p className="font-bold mb-2 flex items-center gap-1">📊 {pollData.question}</p>
                      <div className="flex flex-col gap-1">
                        {pollData.options.map((opt, i) => (
                          <div
                            key={i}
                            className={`text-xs px-2 py-1.5 rounded-lg border ${
                              isMe ? "border-[#0A0F1E]/30 bg-[#0A0F1E]/10" : "border-[#C9A84C]/30 bg-[#C9A84C]/5"
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : kind === "contact" && contactData ? (
                    <div className="flex items-center gap-2 min-w-[160px]">
                      <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-lg">👤</div>
                      <div>
                        <p className="font-bold text-sm">{contactData.name}</p>
                        <p className="text-xs opacity-70">{contactData.phone}</p>
                      </div>
                    </div>
                  ) : (
                    msg.text
                  )}

                  {/* Message Options Hover Trigger */}
                  {!msg.isDeleted && (
                    <button
                      onClick={() => setActiveMsgOptions(activeMsgOptions === index ? null : index)}
                      className="hidden group-hover:block absolute top-1 right-1 text-xs opacity-70 hover:opacity-100 px-1 rounded bg-black/20"
                    >
                      ▼
                    </button>
                  )}
                </div>

                {/* Popover Options Menu */}
                {activeMsgOptions === index && (
                  <div className={`absolute top-8 z-20 bg-[#111827] border border-[#C9A84C]/40 rounded-xl shadow-xl p-1 text-xs text-white flex flex-col gap-1 w-32 ${
                    isMe ? "right-0" : "left-0"
                  }`}>
                    <button onClick={() => setReplyTo(msg)} className="text-left px-3 py-1.5 hover:bg-[#C9A84C]/20 rounded">
                      ↩ Reply
                    </button>
                    <button onClick={() => handleDeleteMsg(msg._id, false)} className="text-left px-3 py-1.5 hover:bg-red-500/20 text-red-400 rounded">
                      🗑 Delete for me
                    </button>
                    {isMe && (
                      <button onClick={() => handleDeleteMsg(msg._id, true)} className="text-left px-3 py-1.5 hover:bg-red-500/20 text-red-400 rounded">
                        🚫 Unsend
                      </button>
                    )}
                  </div>
                )}

                <span className="text-[10px] text-gray-500 mt-1 px-1">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                </span>
              </div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        {/* 🟢 REPLY BANNER */}
        {replyTo && (
          <div className="px-4 py-2 bg-[#111827] border-t border-[#C9A84C]/20 flex justify-between items-center text-xs text-gray-300">
            <div>
              Replying to: <span className="text-[#C9A84C] italic">"{replyTo.text}"</span>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-red-400 hover:text-red-300">✖</button>
          </div>
        )}

        {/* 🟢 POPUP 1: ATTACHMENT MENU (+ Click) */}
        {showAttachMenu && (
          <div className="absolute bottom-20 left-6 bg-[#111827] border border-[#C9A84C]/30 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 z-30 w-48 text-sm">
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-2.5 hover:bg-[#C9A84C]/10 rounded-xl text-gray-200">
              📑 Document
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-2.5 hover:bg-[#C9A84C]/10 rounded-xl text-gray-200">
              🖼️ Photos & videos
            </button>
            <button onClick={openCamera} className="flex items-center gap-3 p-2.5 hover:bg-[#C9A84C]/10 rounded-xl text-gray-200">
              📷 Camera
            </button>
            <button onClick={() => { setShowPollModal(true); setShowAttachMenu(false); }} className="flex items-center gap-3 p-2.5 hover:bg-[#C9A84C]/10 rounded-xl text-gray-200">
              📊 Poll
            </button>
            <button onClick={() => { setShowContactModal(true); setShowAttachMenu(false); }} className="flex items-center gap-3 p-2.5 hover:bg-[#C9A84C]/10 rounded-xl text-gray-200">
              👤 Contact
            </button>
          </div>
        )}

        {/* 🟢 POPUP 2: EMOJI / GIF PICKER */}
        {showEmojiPicker && (
          <div className={`absolute bottom-20 left-16 bg-[#111827] border border-[#C9A84C]/30 rounded-2xl shadow-2xl z-30 text-sm ${
            activePickerTab === "emoji" ? "w-auto p-0 overflow-hidden" : "w-64 p-3"
          }`}>
            {activePickerTab === "emoji" ? (
              <div>
                <div className="flex justify-center border-b border-gray-700 py-1.5">
                  <button onClick={() => setActivePickerTab("emoji")} className="px-3 pb-1 text-xs font-bold text-[#C9A84C] border-b-2 border-[#C9A84C]">
                    EMOJIS
                  </button>
                  <button onClick={() => setActivePickerTab("gif")} className="px-3 pb-1 text-xs font-bold text-gray-400">
                    GIFS
                  </button>
                </div>
                <EmojiPicker
                  onEmojiClick={(emojiData) => handleSendMessage(emojiData.emoji, "text")}
                  theme={Theme.DARK}
                  width={280}
                  height={330}
                  previewConfig={{ showPreview: false }}
                  skinTonesDisabled
                />
              </div>
            ) : (
              <div>
                <div className="flex border-b border-gray-700 pb-2 mb-2 justify-around font-bold text-xs">
                  <button onClick={() => setActivePickerTab("emoji")} className="pb-1 text-gray-400">
                    EMOJIS
                  </button>
                  <button onClick={() => setActivePickerTab("gif")} className="pb-1 text-[#C9A84C] border-b-2 border-[#C9A84C]">
                    GIFS
                  </button>
                </div>
                <input
                  type="text"
                  value={gifQuery}
                  onChange={(e) => setGifQuery(e.target.value)}
                  placeholder="Search GIFs..."
                  className="w-full bg-[#0A0F1E] border border-[#C9A84C]/30 text-white rounded-lg px-3 py-1.5 text-xs mb-2 focus:outline-none focus:border-[#C9A84C]"
                />
                {gifLoading ? (
                  <p className="text-center text-xs text-gray-400 py-6">Loading GIFs...</p>
                ) : gifError === "no-key" ? (
                  <p className="text-center text-[11px] text-gray-400 py-6 leading-relaxed px-2">
                    Giphy API key set nahi hai. developers.giphy.com se free key lekar
                    GIPHY_API_KEY me daalo.
                  </p>
                ) : gifError ? (
                  <p className="text-center text-xs text-gray-400 py-6">No GIFs found</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                    {gifResults.length === 0 ? (
                      <p className="col-span-2 text-center text-xs text-gray-400 py-6">No GIFs found</p>
                    ) : (
                      gifResults.map((gif) => {
                        const gifUrl =
                          gif.images?.original?.url ||
                          gif.images?.fixed_width?.url ||
                          gif.images?.downsized?.url;
                        return (
                          <img
                            key={gif.id}
                            src={gif.images?.fixed_width_small?.url || gif.images?.fixed_width?.url}
                            alt={gif.title || "gif"}
                            onClick={() => {
                              if (!gifUrl) {
                                console.error("GIF url missing for", gif);
                                return;
                              }
                              handleSendMessage(gifUrl, "image");
                            }}
                            className="w-full h-20 rounded-lg cursor-pointer hover:opacity-80 object-cover"
                          />
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 🟢 POPUP 3: CREATE POLL */}
        {showPollModal && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40 rounded-3xl">
            <div className="bg-[#111827] border border-[#C9A84C]/40 rounded-2xl p-4 w-80 shadow-2xl">
              <h3 className="text-[#C9A84C] font-bold mb-3 text-sm">📊 Create Poll</h3>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask a question"
                className="w-full bg-[#0A0F1E] border border-[#C9A84C]/30 text-white rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-[#C9A84C]"
              />
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto mb-2">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handlePollOptionChange(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 bg-[#0A0F1E] border border-[#C9A84C]/30 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#C9A84C]"
                    />
                    {pollOptions.length > 2 && (
                      <button onClick={() => handleRemovePollOption(i)} className="text-red-400 text-xs">✖</button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={handleAddPollOption} className="text-xs text-[#C9A84C] mb-3 hover:underline">
                + Add option
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPollModal(false)}
                  className="flex-1 py-2 rounded-xl border border-[#C9A84C]/30 text-gray-300 text-sm hover:bg-[#0A0F1E]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePoll}
                  className="flex-1 py-2 rounded-xl bg-[#C9A84C] text-[#0A0F1E] font-bold text-sm hover:bg-yellow-500"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🟢 POPUP 4: SHARE CONTACT */}
        {showContactModal && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40 rounded-3xl">
            <div className="bg-[#111827] border border-[#C9A84C]/40 rounded-2xl p-4 w-80 shadow-2xl">
              <h3 className="text-[#C9A84C] font-bold mb-3 text-sm">👤 Share Contact</h3>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Contact name"
                className="w-full bg-[#0A0F1E] border border-[#C9A84C]/30 text-white rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-[#C9A84C]"
              />
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full bg-[#0A0F1E] border border-[#C9A84C]/30 text-white rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#C9A84C]"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 py-2 rounded-xl border border-[#C9A84C]/30 text-gray-300 text-sm hover:bg-[#0A0F1E]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareContact}
                  className="flex-1 py-2 rounded-xl bg-[#C9A84C] text-[#0A0F1E] font-bold text-sm hover:bg-yellow-500"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🟢 POPUP 5: CAMERA */}
        {showCameraModal && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 rounded-3xl gap-4">
            <video ref={videoRef} autoPlay playsInline className="w-72 h-56 object-cover rounded-2xl border border-[#C9A84C]/40" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-4 items-center">
              <button onClick={closeCamera} className="px-4 py-2 rounded-xl border border-[#C9A84C]/30 text-gray-300 text-sm hover:bg-[#0A0F1E]">
                Cancel
              </button>
              <button onClick={capturePhoto} className="w-14 h-14 rounded-full bg-[#C9A84C] flex items-center justify-center text-xl">
                📸
              </button>
            </div>
          </div>
        )}

        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

        {/* 🟢 BOTTOM INPUT BAR */}
        <div className="p-3 bg-[#111827] border-t border-[#C9A84C]/20 flex items-center gap-2">
          {/* + Attachment Button */}
          <button
            onClick={() => {
              setShowAttachMenu(!showAttachMenu);
              setShowEmojiPicker(false);
            }}
            className="w-10 h-10 rounded-full bg-[#0A0F1E] text-[#C9A84C] text-xl font-bold flex items-center justify-center border border-[#C9A84C]/30 hover:bg-[#C9A84C]/20 transition"
          >
            +
          </button>

          {/* Sticker/Emoji Button */}
          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachMenu(false);
            }}
            className="text-xl p-2 text-gray-300 hover:text-[#C9A84C] transition"
          >
            😀
          </button>

          {/* Text Input OR Recording Indicator */}
          {isRecording ? (
            <div className="flex-1 flex items-center justify-between bg-[#0A0F1E] border border-red-500/50 rounded-2xl px-4 py-2.5">
              <span className="flex items-center gap-2 text-red-400 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                Recording {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:
                {String(recordingSeconds % 60).padStart(2, "0")}
              </span>
              <span className="text-xs text-gray-500">Release to send</span>
            </div>
          ) : (
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-[#0A0F1E] border border-[#C9A84C]/30 text-white rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C]"
            />
          )}

          {/* Voice Mic (hold to record, WhatsApp style) or Send Button */}
          {newMessage.trim() && !isRecording ? (
            <button
              onClick={() => handleSendMessage()}
              className="px-5 py-2.5 bg-[#C9A84C] text-[#0A0F1E] font-bold text-sm rounded-2xl hover:bg-yellow-500 transition"
            >
              Send
            </button>
          ) : (
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={() => isRecording && stopRecording()}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition select-none ${
                isRecording ? "bg-red-500 text-white animate-pulse scale-110" : "bg-[#0A0F1E] text-[#C9A84C] border border-[#C9A84C]/30"
              }`}
            >
              🎙️
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Chat;