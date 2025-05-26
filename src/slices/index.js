//////     slices/index.js


import { combineReducers } from "redux";

// Front
import LayoutReducer from "./layouts/reducer";

// Authentication

import LoginReducer from "./auth/login/reducer";


// Settings
import SettingsReducer from "./Settings/reducer";



const rootReducer = combineReducers({
    Layout: LayoutReducer,
    Login: LoginReducer,
  
    Settings: SettingsReducer,

});

export default rootReducer;