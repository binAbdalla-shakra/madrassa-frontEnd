import { Navigate } from "react-router-dom";

//Dashboard
// import DashboardAnalytics from "../pages/DashboardAnalytics";
// import DashboardCrm from "../pages/DashboardCrm";
// import DashboardEcommerce from "../pages/DashboardEcommerce";

// import DashboardCrypto from "../pages/DashboardCrypto";
// import DashboardJob from "../pages/DashboardJob/";
// import DashboardNFT from "../pages/DashboardNFT";
// import DashboardProject from "../pages/DashboardProject";


//Tables
import BasicTables from '../pages/Tables/BasicTables/BasicTables';
import ListTables from '../pages/Tables/ListTables/ListTables';
import ReactTable from "../pages/Tables/ReactTables";



//Settings
import Branch from '../pages/settings/Branch';
import Roles from '../pages/settings/Roles';
import Users from '../pages/settings/Users';


// import ListTables from '../pages/Tables/ListTables/ListTables';
// import ReactTable from "../pages/Tables/ReactTables";


//login
// import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Madrassas from "../pages/settings/Madrassa";
// import Register from "../pages/Authentication/Register";
const authProtectedRoutes = [
  // { path: "/dashboard-analytics", component: <DashboardAnalytics /> },
  // { path: "/dashboard-crm", component: <DashboardCrm /> },
  // { path: "/dashboard", component: <DashboardEcommerce /> },
  // { path: "/index", component: <DashboardEcommerce /> },
  // { path: "/dashboard-crypto", component: <DashboardCrypto /> },
  // { path: "/dashboard-projects", component: <DashboardProject /> },
  // { path: "/dashboard-nft", component: <DashboardNFT /> },
  // { path: "/dashboard-job", component: <DashboardJob /> },
  // { path: "/dashboard-blog", component: <DashboardBlog /> },


  //Tables
  { path: "/tables-basic", component: <BasicTables /> },
  { path: "/tables-listjs", component: <ListTables /> },
  { path: "/tables-react", component: <ReactTable /> },

  
  //Settings
  { path: "/setting-users", component: <Users /> },
  { path: "/setting-roles", component: <Roles /> },
    { path: "/setting-branches", component: <Branch /> },
  { path: "/setting-madrassa", component: <Madrassas /> },



  // //User Profile
  // { path: "/profile", component: <UserProfile /> },

  // this route should be at the end of all other routes
  // eslint-disable-next-line react/display-name
  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
  },
  { path: "*", component: <Navigate to="/dashboard" /> },
];

const publicRoutes = [
  // Authentication Page
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  // { path: "/forgot-password", component: <ForgetPasswordPage /> },
  


];

export { authProtectedRoutes, publicRoutes };
