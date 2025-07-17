import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navdata = () => {
  const history = useNavigate();
  //state data
  const [isDashboard, setIsDashboard] = useState(false);
  const [isSettings, setIsSettings] = useState(false);
  const [isAcademics, setIsAcademics] = useState(false);
  const [isClassMgmt, setIsClassMgmt] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isFinance, setIsFinance] = useState(false);
  const [isReports, setIsReports] = useState(false);





  const [iscurrentState, setIscurrentState] = useState("Dashboard");

  function updateIconSidebar(e) {
    if (e && e.target && e.target.getAttribute("subitems")) {
      const ul = document.getElementById("two-column-menu");
      const iconItems = ul.querySelectorAll(".nav-icon.active");
      let activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        var id = item.getAttribute("subitems");
        if (document.getElementById(id))
          document.getElementById(id).classList.remove("show");
      });
    }
  }

  useEffect(() => {
    
    if (iscurrentState !== "Dashboard") {
      setIsDashboard(false);
    }
    if (iscurrentState !== "Settings") {
      setIsSettings(false);
    }

    if (iscurrentState !== "Academics") setIsAcademics(false);
    if (iscurrentState !== "ClassManagement") setIsClassMgmt(false);
    if (iscurrentState !== "Monitoring") setIsMonitoring(false);
    if (iscurrentState !== "Finance") setIsFinance(false);
    if (iscurrentState !== "Reports") setIsReports(false);


   
  }, [
    history,
    iscurrentState,
    // isDashboard,
    // isSettings,
  ]);

  const menuItems = [

    {
      id: "dashboard",
      label: "Dashboards",
      icon: "ri-dashboard-line",
      link: "/dashboard",
      click: function (e) {
        e.preventDefault();
        setIscurrentState("Dashboards");
      },
    },

   
       {
      id: "academics",
      label: "Registrations",
      icon: "ri-graduation-cap-line",
      link: "/#",
      stateVariables: isAcademics,
      click: (e) => {
        e.preventDefault();
        setIsAcademics(!isAcademics);
        setIscurrentState("Academics");
        updateIconSidebar(e);
      },
      subItems: [
        { id: "parents", label: "Parents", link: "/academics-parents", parentId: "academics" },
        { id: "students", label: "Students", link: "/academics-students", parentId: "academics" },
        { id: "teachers", label: "Teachers", link: "/academics-teachers", parentId: "academics" },
      ],
    },
    {
      id: "classManagement",
      label: "Academics",
      icon: "ri-team-line",
      link: "/#",
      stateVariables: isClassMgmt,
      click: (e) => {
        e.preventDefault();
        setIsClassMgmt(!isClassMgmt);
        setIscurrentState("ClassManagement");
        updateIconSidebar(e);
      },
      subItems: [
        { id: "groups", label: "Groups", link: "/groups", parentId: "classManagement" },
      { id: "attendance", label: "Attendance", link: "/group-attendance", parentId: "classManagement" },
        { id: "lesson-tracking", label: "Lesson Tracking", link: "/group-lessons", parentId: "classManagement" },
      ],
    },
    // {
    //   id: "monitoring",
    //   label: "Monitoring",
    //   icon: "ri-eye-line",
    //   link: "/#",
    //   stateVariables: isMonitoring,
    //   click: (e) => {
    //     e.preventDefault();
    //     setIsMonitoring(!isMonitoring);
    //     setIscurrentState("Monitoring");
    //     updateIconSidebar(e);
    //   },
    //   subItems: [
    //     { id: "attendance", label: "Attendance", link: "/monitoring-attendance", parentId: "monitoring" },
    //     { id: "lesson-tracking", label: "Lesson Tracking", link: "/monitoring-lessons", parentId: "monitoring" },
    //   ],
    // },

    {
  id: "finance",
  label: "Finance",
  icon: "ri-money-dollar-circle-line",
  link: "/#",
  stateVariables: isFinance,
  click: function (e) {
    e.preventDefault();
    setIsFinance(!isFinance);
    setIscurrentState("Finance");
    updateIconSidebar(e);
  },
  subItems: [

    {
      id: "fee-generation",
      label: "Monthly Fee Generation",
      link: "/finance/fee-generation",
      parentId: "finance",
    },
    {
      id: "receipts",
      label: "Payment Receipts",
      link: "/finance/receipts",
      parentId: "finance",
    },
    {
      id: "expenses",
      label: "Expenses",
      link: "/finance/expenses",
      parentId: "finance",
    },
    {
      id: "expense-types",
      label: "Expense Types",
      link: "/finance/expense-types",
      parentId: "finance",
    },

  ]
},


 {
  id: "reports",
  label: "Reports",
  icon: "ri-money-dollar-circle-line",
  link: "/#",
  stateVariables: isReports,
  click: function (e) {
    e.preventDefault();
    setIsReports(!isReports);
    setIscurrentState("Reports");
    updateIconSidebar(e);
  },
  subItems: [

    {
      id: "attendance-report",
      label: "Lesson Report",
      link: "/reports/lesson",
      parentId: "reports",
    },
      {
      id: "lesson-report",
      label: "Attendance Report",
      link: "/reports/attendance",
      parentId: "reports",
    },

     {
      id: "students-without-lesson-report",
      label: "Student without Lesson",
      link: "/reports/students-without-lesson",
      parentId: "reports",
    },

    {
      id: "balance-sheet",
      label: "Balance Sheet",
      link: "/reports/balancesheet",
      parentId: "reports",
    },
    {
      id: "financial-report",
      label: "Gen Financial Report",
      link: "/general/finance/rpt",
      parentId: "reports",
    },
    // {
    //   id: "expenses",
    //   label: "Expenses",
    //   link: "/finance/expenses",
    //   parentId: "finance",
    // },
    // {
    //   id: "expense-types",
    //   label: "Expense Types",
    //   link: "/finance/expense-types",
    //   parentId: "finance",
    // },

  ]
},




      {
      id: "settings",
      label: "Settings",
      icon: "ri-apps-2-line",
      link: "/#",
      stateVariables: isSettings,
      click: function (e) {
        e.preventDefault();
        setIsSettings(!isSettings);
        setIscurrentState("Settings");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "madrassa",
          label: "madrassa profile",
          link: "/setting-madrassa",
          parentId: "settings",
        },
 
        {
          id: "users",
          label: "Users",
          link: "/setting-users",
          parentId: "settings",
        },
        {
          id: "roles",
          label: "Roles",
          link: "/setting-roles",
          parentId: "settings",
        },
       

      ],
    },


  ];
  return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
