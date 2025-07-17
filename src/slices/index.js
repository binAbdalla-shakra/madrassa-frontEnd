//////     slices/index.js


import { combineReducers } from "redux";

// Front
import LayoutReducer from "./layouts/reducer";

// Authentication

import LoginReducer from "./auth/login/reducer";


// Settings
import SettingsReducer from "./Settings/reducer";


// Academics 
import AcademicReducer from "./Academics/reducer";

//Class Managements
import ClassManagementReducer from "./ClassManagement/reducer";


const rootReducer = combineReducers({
    Layout: LayoutReducer,
    Login: LoginReducer,
  
    Settings: SettingsReducer,
    Academics: AcademicReducer,
    ClassManagement: ClassManagementReducer,

});

export default rootReducer;