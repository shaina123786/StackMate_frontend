import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import Feed from "../components/Feed";
import feedReducer from "./feedSlice";
import connectionReducer from "./connectionSlice";
import requestReducer from "./requestSlice";

const appStore = configureStore({
    reducer: {
        user: userReducer,     //what is userreducer
        feed: feedReducer,
        connections: connectionReducer,
        request: requestReducer,
    },
});

export default appStore;