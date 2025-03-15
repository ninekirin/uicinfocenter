import { configureStore } from '@reduxjs/toolkit';
import models from './combine';
import thunk from 'redux-thunk';

const store = configureStore({
  reducer: models,
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(thunk),
});

export default store;
