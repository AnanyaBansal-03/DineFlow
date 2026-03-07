import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  customerName: "",
  customerPhone: "",
  guests: 0,
  tableId: null
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setCustomer: (state, action) => {
      const { name, phone, guests } = action.payload;
      state.customerName = name;
      state.customerPhone = phone;
      state.guests = guests;
    },

    removeCustomer: (state) => {
      state.customerName = "";
      state.customerPhone = "";
      state.guests = 0;
      state.tableId = null;
    },

    setTable: (state, action) => {
      state.tableId = action.payload;
    }
  }
});

export const { setCustomer, removeCustomer, setTable } = customerSlice.actions;
export default customerSlice.reducer;