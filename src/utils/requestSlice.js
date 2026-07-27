import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
  name: "request",
  initialState: null,
  reducers: {
    addRequest: (state, action) => {
      return action.payload;
    },
    removeRequest: (state, action) => {
      if (!state) return null;
      const array = state.filter((req) => req._id !== action.payload);
      return array;
    },
  },
});

export const { addRequest, removeRequest } = requestSlice.actions;

export default requestSlice.reducer;