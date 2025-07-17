import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col, Container, Row, Table } from 'reactstrap';
import CountUp from 'react-countup';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { api } from '../../config';
import Loader from '../../Components/Common/Loader';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeStudents: 0,
    parents: 0,
    activeTeachers: 0,
    activeGroups: 0
  });
  const [latestStudents, setLatestStudents] = useState([]);
  const [loading, setLoading] = useState(true);

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
      label: "New Students (7 days)",
      icon: "ri-user-add-line",
      counter: 12, // You can add this to your backend if needed
      prefix: "",
      suffix: "",
      separator: ",",
      decimals: 0,
      badge: "ri-arrow-up-line text-success"
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${api.API_URL}/dashboard/count-stats`);
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data.stats);
          setLatestStudents(data.data.latestStudents);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Dashboard" pageTitle="Admin" />
          
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