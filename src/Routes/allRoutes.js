import { Navigate } from "react-router-dom";

//Tables
import BasicTables from '../pages/Tables/BasicTables/BasicTables';
import ListTables from '../pages/Tables/ListTables/ListTables';
import ReactTable from "../pages/Tables/ReactTables";



//Settings
import Branch from '../pages/settings/Branch';
import Roles from '../pages/settings/Roles';
import Users from '../pages/settings/Users';


// Academnics
 import Parents from '../pages/Academics/Parents';
import Students from '../pages/Academics/Students';
import Teachers from '../pages/Academics/Teachers';

import Groups from '../pages/ClassManagement/Groups';

import MonthlyFee from '../pages/Finance/MonthlyFee';
import Receipt from '../pages/Finance/Receipt';
import ExpenseType from '../pages/Finance/ExpenseType';
import Expenses from '../pages/Finance/Expenses';
import BalancesheetReport from '../pages/Reports/BalanceSheet';
import GeneralFinanceReport from '../pages/Reports/GeneralFinancialReport';
import Attendance from '../pages/ClassManagement/Attendance';
import Lessons from '../pages/ClassManagement/LessonTracking';
import AttendanceReport from '../pages/Reports/AttendanceReport';
import LessonReport from '../pages/Reports/LessonReport';
import StudentWithoutLessonReport from '../pages/Reports/StudentsWithoutLesson';













import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Madrassas from "../pages/settings/Madrassa";
// import StudentsWithoutLessonsPage from "../pages/Reports/StudentsWithoutLesson";
// import Register from "../pages/Authentication/Register";
const authProtectedRoutes = [


  //Tables
  { path: "/tables-basic", component: <BasicTables /> },
  { path: "/tables-listjs", component: <ListTables /> },
  { path: "/tables-react", component: <ReactTable /> },

  
  //Settings
  { path: "/setting-users", component: <Users /> },
  { path: "/setting-roles", component: <Roles /> },
    { path: "/setting-branches", component: <Branch /> },
  { path: "/setting-madrassa", component: <Madrassas /> },


  // Academics 
       { path: "/academics-parents", component: <Parents /> },
       { path: "/academics-students", component: <Students /> },
       { path: "/academics-teachers", component: <Teachers /> },

  // group management 
       { path: "/groups", component: <Groups /> },
       { path: "/group-attendance", component: <Attendance /> },
       { path: "/group-lessons", component: <Lessons /> },





       { path: "/finance/fee-generation", component: <MonthlyFee /> },
       { path: "/finance/receipts", component: <Receipt /> },
       { path: "/finance/expense-types", component: <ExpenseType /> },
       { path: "/finance/expenses", component: <Expenses /> },
       { path: "/reports/balancesheet", component: <BalancesheetReport /> },
       { path: "/general/finance/rpt", component: <GeneralFinanceReport /> },
       { path: "/reports/attendance", component: <AttendanceReport /> },
       { path: "/reports/lesson", component: <LessonReport /> },
       { path: "/reports/students-without-lesson", component: <StudentWithoutLessonReport /> },











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
