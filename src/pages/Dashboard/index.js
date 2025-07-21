import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col, Container, Row, Table, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Alert } from 'reactstrap';
import CountUp from 'react-countup';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { api } from '../../config';
import Loader from '../../Components/Common/Loader';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeStudents: 0,
    parents: 0,
    activeTeachers: 0,
    activeGroups: 0
  });
  const [latestStudents, setLatestStudents] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState(null);

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

  // Month names for dropdown
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch basic stats
        const statsResponse = await fetch(`${api.API_URL}/dashboard/count-stats`);
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          setStats(statsData.data.stats);
          setLatestStudents(statsData.data.latestStudents);
        }

        // Get current year
        const currentYear = new Date().getFullYear();
        
        // Fetch data for selected month
        const monthStart = new Date(currentYear, selectedMonth - 1, 1);
        const monthEnd = new Date(currentYear, selectedMonth, 0);
        const monthResponse = await fetch(
          `${api.API_URL}/finance/summary?startDate=${formatDate(monthStart)}&endDate=${formatDate(monthEnd)}`
        );
        const monthData = await monthResponse.json();
        
        if (monthData.success) {
          setMonthlyData(monthData.data);
        } else {
          throw new Error('Failed to load monthly data');
        }

        // Fetch data for entire year
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);
        const yearResponse = await fetch(
          `${api.API_URL}/finance/monthly-finance`
        );
        const yearData = await yearResponse.json();
        
        if (yearData.success) {
          setYearlyData(yearData.monthly);
        } else {
          throw new Error('Failed to load yearly data');
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load financial data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Prepare data for the fees chart (selected month)
const getFeesChartData = () => {
  if (!monthlyData) return { labels: [], datasets: [] };

  return {
    labels: ['Financial Summary'],
    datasets: [
      {
        label: 'Generated',
        data: [monthlyData.fees?.totalGenerated || 0],
        backgroundColor: '#405189'
      },
      {
        label: 'Paid',
        data: [monthlyData.fees?.totalPaid || 0],
        backgroundColor: '#0AB39C'
      },
      {
        label: 'Pending',
        data: [monthlyData.fees?.totalPending || 0],
        backgroundColor: '#F7B84B'
      }
    ]
  };
};
// console.log("yearly is:",yearlyData)
  // Prepare data for the comparison chart (yearly)
const getComparisonChartData = () => {
  if (!yearlyData) return { labels: [], datasets: [] };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize with zeros
  const revenueData = new Array(12).fill(0);
  const expensesData = new Array(12).fill(0);

  // Fill actual data if available
  if (Array.isArray(yearlyData)) {
    yearlyData.forEach(entry => {
      const monthIndex = entry.month - 1; // Assuming month is 1-indexed
      if (monthIndex >= 0 && monthIndex < 12) {
        revenueData[monthIndex] = entry.revenue || 0;
        expensesData[monthIndex] = entry.expenses || 0;
      }
    });
  }

  return {
    labels: months,
    datasets: [
      {
        label: 'Revenue',
        data: revenueData,
        borderColor: 'rgba(0, 204, 153, 1)',
        backgroundColor: 'rgba(0, 204, 153, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: expensesData,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  };
};


const barChartOptions = {
  maintainAspectRatio: false,

  indexAxis: 'x',
  responsive: true,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: ctx => `${ctx.dataset.label}: $${ctx.raw.toLocaleString()}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: val => `$${val}`
      }
    }
  }
};

const lineChartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: $${ctx.raw.toLocaleString()}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (val) => `$${val}`
      }
    }
  }
};
const totalRevenue = yearlyData?.reduce((sum, m) => sum + (m.revenue || 0), 0) || 0;
const totalExpenses = yearlyData?.reduce((sum, m) => sum + (m.expenses || 0), 0) || 0;
// console.log("dddd",totalRevenue)
  // const chartOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: 'top',
  //     },
  //     tooltip: {
  //       callbacks: {
  //         label: function(context) {
  //           return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
  //         }
  //       }
  //     }
  //   },
  //   scales: {
  //     y: {
  //       beginAtZero: true,
  //       ticks: {
  //         callback: function(value) {
  //           return `$${value}`;
  //         }
  //       }
  //     }
  //   }
  // };

  // Widget data
  const crmWidgets = [
    {
      id: 1,
      label: "Active Students",
      icon: "ri-group-line",
      counter: stats.activeStudents,
      prefix: "",
      suffix: "",
      separator: ",",
      decimals: 0,
      badge: "ri-arrow-up-line text-success"
    },
    {
      id: 2,
      label: "Active Parents",
      icon: "ri-parent-line",
      counter: stats.parents,
      prefix: "",
      suffix: "",
      separator: ",",
      decimals: 0,
      badge: "ri-arrow-up-line text-success"
    },
    {
      id: 3,
      label: "Active Teachers",
      icon: "ri-team-line",
      counter: stats.activeTeachers,
      prefix: "",
      suffix: "",
      separator: ",",
      decimals: 0,
      badge: "ri-arrow-up-line text-success"
    },
    {
      id: 4,
      label: "Groups",
      icon: "ri-bookmark-line",
      counter: stats.activeGroups,
      prefix: "",
      suffix: "",
      separator: ",",
      decimals: 0,
      badge: "ri-arrow-up-line text-success"
    },
    {
      id: 5,
      label: "Net Balance (Current)",
      icon: "ri-wallet-line",
      counter: monthlyData?.netBalance || 0,
      prefix: "$",
      suffix: "",
      separator: ",",
      decimals: 0,
      badge: (monthlyData?.netBalance || 0) >= 0 ? "ri-arrow-up-line text-success" : "ri-arrow-down-line text-danger"
    }
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Dashboard" pageTitle="Admin" />
          
          {error && (
            <Alert color="danger" className="mb-3">
              <i className="ri-alert-line me-1"></i> {error}
            </Alert>
          )}
          
          {loading ? (
            <Loader />
          ) : (
            <Row>
              {/* Stats Widgets */}
              <Col xl={12}>
                <Card className="crm-widget">
                  <CardBody className="p-0">
                    <Row className="row-cols-xxl-5 row-cols-md-3 row-cols-1 g-0">
                      {crmWidgets.map((widget, index) => (
                        <Col key={index}>
                          <div className="py-4 px-3">
                            <h5 className="text-muted text-uppercase fs-13">
                              {widget.label}
                              <i className={`${widget.badge} fs-18 float-end align-middle`}></i>
                            </h5>
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <i className={`${widget.icon} display-6 text-muted cfs-22`}></i>
                              </div>
                              <div className="flex-grow-1 ms-3">
                                <h2 className="mb-0 cfs-22">
                                  <CountUp
                                    start={0}
                                    prefix={widget.prefix}
                                    suffix={widget.suffix}
                                    separator={widget.separator}
                                    end={widget.counter}
                                    decimals={widget.decimals}
                                    duration={4}
                                  />
                                </h2>
                              </div>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </CardBody>
                </Card>
              </Col>

              {/* Financial Charts */}
              <Col xl={6}>
                <Card>
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="card-title mb-0">{months[selectedMonth - 1]} Financial Summary</h4>
                      <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                        <DropdownToggle caret>
                          {months[selectedMonth - 1]}
                        </DropdownToggle>
                        <DropdownMenu>
                          {months.map((month, index) => (
                            <DropdownItem 
                              key={index} 
                              onClick={() => setSelectedMonth(index + 1)}
                              active={selectedMonth === index + 1}
                            >
                              {month}
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    <div style={{ height: '300px' }}>
                      <Bar 
                        data={getFeesChartData()} 
                        options={barChartOptions} 
                      />
                    </div>
                    {monthlyData && (
                      <div className="mt-3">
                        <Row>
                          <Col md={4}>
                            <div className="text-center">
                              <h6 className="text-muted">Generated</h6>
                              <h4 className="text-primary">${(monthlyData.fees?.totalGenerated || 0).toLocaleString()}</h4>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="text-center">
                              <h6 className="text-muted">Paid</h6>
                              <h4 className="text-success">${(monthlyData.fees?.totalPaid || 0).toLocaleString()}</h4>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="text-center">
                              <h6 className="text-muted">Pending</h6>
                              <h4 className="text-warning">${(monthlyData.fees?.totalPending || 0).toLocaleString()}</h4>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>

              <Col xl={6}>
                <Card>
                  <CardBody>
                    <br></br>
                    <h4 className="card-title mb-3">Annual Summary ({new Date().getFullYear()})</h4>
                    <div style={{ height: '300px' }}>
                      <Bar 
                        data={getComparisonChartData()} 
                        options={lineChartOptions} 
                      />
                    </div>
                    {yearlyData && (
                      <div className="mt-3">
                        <Row>
                          <Col md={6}>
                            <div className="text-center">
                              <h6 className="text-muted">Total Revenue</h6>
                              <h4 className="text-success">${totalRevenue.toLocaleString()}</h4>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="text-center">
                              <h6 className="text-muted">Total Expenses</h6>
                              <h4 className="text-danger">${totalExpenses.toLocaleString()}</h4>
                            </div>
                          </Col>
                        </Row>
                        {/* <div className="text-center mt-2">
                          <h6 className="text-muted">Net Balance</h6>
                          <h4 className={(yearlyData.netBalance || 0) >= 0 ? 'text-success' : 'text-danger'}>
                            ${(yearlyData.netBalance || 0).toLocaleString()}
                          </h4>
                        </div> */}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>

              {/* Recently Registered Students Table */}
              <Col xl={12}>
                <Card>
                  <CardBody>
                    <h4 className="card-title mb-4">Recently Registered Students</h4>
                    
                    <div className="table-responsive">
                      <Table className="table-centered table-nowrap mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>
                            <th>Student Name</th>
                            <th>Registration Number</th>
                            <th>Admission Date</th>
                            <th>Parent Name</th>
                            <th>Parent Contact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {latestStudents.length > 0 ? (
                            latestStudents.map((student, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{student.name}</td>
                                <td>{student.registrationNumber}</td>
                                <td>
                                  {new Date(student.admissionDate).toLocaleDateString()}
                                </td>
                                <td>{student.parentName}</td>
                                <td>{student.parentContact}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center">
                                No recently registered students found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;

// import React, { useEffect, useState } from 'react';
// import { Card, CardBody, Col, Container, Row, Table } from 'reactstrap';
// import CountUp from 'react-countup';
// import BreadCrumb from '../../Components/Common/BreadCrumb';
// import { api } from '../../config';
// import Loader from '../../Components/Common/Loader';

// const Dashboard = () => {
//   const [stats, setStats] = useState({
//     activeStudents: 0,
//     parents: 0,
//     activeTeachers: 0,
//     activeGroups: 0
//   });
//   const [latestStudents, setLatestStudents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Widget data
//   const crmWidgets = [
//     {
//       id: 1,
//       label: "Active Students",
//       icon: "ri-group-line",
//       counter: stats.activeStudents,
//       prefix: "",
//       suffix: "",
//       separator: ",",
//       decimals: 0,
//       badge: "ri-arrow-up-line text-success"
//     },
//     {
//       id: 2,
//       label: "Active Parents",
//       icon: "ri-parent-line",
//       counter: stats.parents,
//       prefix: "",
//       suffix: "",
//       separator: ",",
//       decimals: 0,
//       badge: "ri-arrow-up-line text-success"
//     },
//     {
//       id: 3,
//       label: "Active Teachers",
//       icon: "ri-team-line",
//       counter: stats.activeTeachers,
//       prefix: "",
//       suffix: "",
//       separator: ",",
//       decimals: 0,
//       badge: "ri-arrow-up-line text-success"
//     },
//     {
//       id: 4,
//       label: "Groups",
//       icon: "ri-bookmark-line",
//       counter: stats.activeGroups,
//       prefix: "",
//       suffix: "",
//       separator: ",",
//       decimals: 0,
//       badge: "ri-arrow-up-line text-success"
//     },
//     {
//       id: 5,
//       label: "New Students (7 days)",
//       icon: "ri-user-add-line",
//       counter: 12, // You can add this to your backend if needed
//       prefix: "",
//       suffix: "",
//       separator: ",",
//       decimals: 0,
//       badge: "ri-arrow-up-line text-success"
//     }
//   ];

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`${api.API_URL}/dashboard/count-stats`);
//         const data = await response.json();
        
//         if (data.success) {
//           setStats(data.data.stats);
//           setLatestStudents(data.data.latestStudents);
//         }
//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   return (
//     <React.Fragment>
//       <div className="page-content">
//         <Container fluid>
//           <BreadCrumb title="Dashboard" pageTitle="Admin" />
          
//           {loading ? (
//             <Loader />
//           ) : (
//             <Row>
//               {/* Stats Widgets */}
//               <Col xl={12}>
//                 <Card className="crm-widget">
//                   <CardBody className="p-0">
//                     <Row className="row-cols-xxl-5 row-cols-md-3 row-cols-1 g-0">
//                       {crmWidgets.map((widget, index) => (
//                         <Col key={index}>
//                           <div className="py-4 px-3">
//                             <h5 className="text-muted text-uppercase fs-13">
//                               {widget.label}
//                               <i className={`${widget.badge} fs-18 float-end align-middle`}></i>
//                             </h5>
//                             <div className="d-flex align-items-center">
//                               <div className="flex-shrink-0">
//                                 <i className={`${widget.icon} display-6 text-muted cfs-22`}></i>
//                               </div>
//                               <div className="flex-grow-1 ms-3">
//                                 <h2 className="mb-0 cfs-22">
//                                   <CountUp
//                                     start={0}
//                                     prefix={widget.prefix}
//                                     suffix={widget.suffix}
//                                     separator={widget.separator}
//                                     end={widget.counter}
//                                     decimals={widget.decimals}
//                                     duration={4}
//                                   />
//                                 </h2>
//                               </div>
//                             </div>
//                           </div>
//                         </Col>
//                       ))}
//                     </Row>
//                   </CardBody>
//                 </Card>
//               </Col>

//               {/* Recently Registered Students Table */}
//               <Col xl={12}>
//                 <Card>
//                   <CardBody>
//                     <h4 className="card-title mb-4">Recently Registered Students</h4>
                    
//                     <div className="table-responsive">
//                       <Table className="table-centered table-nowrap mb-0">
//                         <thead className="table-light">
//                           <tr>
//                             <th>#</th>
//                             <th>Student Name</th>
//                             <th>Registration Number</th>
//                             <th>Admission Date</th>
//                             <th>Parent Name</th>
//                             <th>Parent Contact</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {latestStudents.length > 0 ? (
//                             latestStudents.map((student, index) => (
//                               <tr key={index}>
//                                 <td>{index + 1}</td>
//                                 <td>{student.name}</td>
//                                 <td>{student.registrationNumber}</td>
//                                 <td>
//                                   {new Date(student.admissionDate).toLocaleDateString()}
//                                 </td>
//                                 <td>{student.parentName}</td>
//                                 <td>{student.parentContact}</td>
//                               </tr>
//                             ))
//                           ) : (
//                             <tr>
//                               <td colSpan="6" className="text-center">
//                                 No recently registered students found
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                       </Table>
//                     </div>
//                   </CardBody>
//                 </Card>
//               </Col>
//             </Row>
//           )}
//         </Container>
//       </div>
//     </React.Fragment>
//   );
// };

// export default Dashboard;
