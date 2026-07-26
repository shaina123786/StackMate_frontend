import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import Notification from "./Notification";
import Body from "./Body";
import Login from "./Login";
import Profile from "./Profile";
import appStore from "../utils/appStore";
import Feed from "./Feed";
import Connection from "./Connections";
import Request from "./Request";
import Signup from "./Signup";
import Chat from "./Chat";


function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter basename="/">
        <Routes>
          {/* 1. PUBLIC ROUTES (Standalone Pages - No Body Layout Wrapper) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 2. ROOT PATH REDIRECT TO LOGIN */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 3. PROTECTED ROUTES (Inside Body Layout) */}
          <Route path="/" element={<Body />}>
            <Route path="feed" element={<Feed />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<Profile />} />
            <Route path="notifications" element={<Notification />} />
            <Route path="connections" element={<Connection />} />
            <Route path="request" element={<Request />} />
            <Route path="chat/:targetUserId" element={<Chat/>} />
          </Route>

          {/* 4. CATCH ALL UNKNOWN ROUTES */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;