import {
  createSlice,
} from '@reduxjs/toolkit';

const getToday = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const offsetToday = new Date(today.getTime() - (offset * 60 * 1000));

  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const offsetWeek = new Date(lastWeek.getTime() - (offset * 60 * 1000));

  const parsedToday = offsetToday.toISOString().split('T')[0];
  const parsedLastWeek = offsetWeek.toISOString().split('T')[0];

  return [parsedLastWeek, parsedToday];
};

const initialState = {
  servicesData: {},
  selectedStore: null,
  dateRange: getToday(),
};

export const storeServicesSlice = createSlice({
  name: 'storeServices',
  initialState,
  reducers: {
    save: (state, action) => {
      if (!state.servicesData[action.payload.store]) {
        state.servicesData[action.payload.store] = action.payload.data;
      }
    },
    clearStoreData: (state) => {
      state.servicesData = {};
    },
    changeStore: (state, action) => {
      state.selectedStore = action.payload;
    },
    changeDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
  },
});

export const {
  save,
  clearStoreData,
  changeStore,
  changeDateRange,
} = storeServicesSlice.actions;

export const selectStoreServices = (state) => state.storeServices;

export default storeServicesSlice.reducer;
