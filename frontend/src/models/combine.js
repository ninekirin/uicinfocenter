import { combineReducers } from 'redux';
import CommonModel from './common';
import SettingModel from './settings';

const rootReducer = combineReducers({
  CommonModel,
  SettingModel,
});

export default rootReducer;
