import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navdata = () => {
  const history = useNavigate();
  //state data
  const [isDashboard, setIsDashboard] = useState(false);
  const [isSettings, setIsSettings] = useState(false);


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
   
  }, [
    history,
    iscurrentState,
    isDashboard,
    isSettings,
  ]);

  const menuItems = [

    // {
    //   id: "dashboard",
    //   label: "Dashboards",
    //   icon: "ri-dashboard-2-line",
    //   link: "/#",
    //   stateVariables: isDashboard,
    //   click: function (e) {
    //     e.preventDefault();
    //     setIsDashboard(!isDashboard);
    //     setIscurrentState("Dashboard");
    //     updateIconSidebar(e);
    //   },
    //   subItems: [
    //     {
    //       id: "analytics",
    //       label: "Analytics",
    //       link: "/dashboard-analytics",
    //       parentId: "dashboard",
    //     },
    //     {
    //       id: "crm",
    //       label: "CRM",
    //       link: "/dashboard-crm",
    //       parentId: "dashboard",
    //     },
    //     {
    //       id: "ecommerce",
    //       label: "Ecommerce",
    //       link: "/dashboard",
    //       parentId: "dashboard",
    //     },
    //     {
    //       id: "crypto",
    //       label: "Crypto",
    //       link: "/dashboard-crypto",
    //       parentId: "dashboard",
    //     },
    //     {
    //       id: "projects",
    //       label: "Projects",
    //       link: "/dashboard-projects",
    //       parentId: "dashboard",
    //     },
    //     {
    //       id: "nft",
    //       label: "NFT",
    //       link: "/dashboard-nft",
    //       parentId: "dashboard",
    //     },
    //     {
    //       id: "job",
    //       label: "Job",
    //       link: "/dashboard-job",
    //       parentId: "dashboard",
    //       // badgeColor: "success",
    //       // badgeName: "New",
    //     },

    //   ],
    // },
    

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
          label: "madrassa",
          link: "/setting-madrassa",
          parentId: "settings",
        },
        {
          id: "branch",
          label: "Branches",
          link: "/setting-branches",
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
        // {
        //   id: "permissions",
        //   label: "Permissions",
        //   link: "/setting-permissions",
        //   parentId: "settings",
        // },
      

      ],
    },
  ];
  return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
