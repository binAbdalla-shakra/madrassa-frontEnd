import { useState, useEffect } from "react";
import {
  Card, CardHeader, CardBody, CardFooter,
  Col, Container, Row,
  Table, Spinner, Badge, Button,
  Nav, NavItem, NavLink, TabContent, TabPane,
  FormGroup, Label, Input
} from "reactstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import moment from 'moment';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { api as API_URL } from "../../../config";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

Chart.register(...registerables);

const AttendanceReportPage = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    student: '',
    teacher: '',
    status: '',
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().endOf('month').format('YYYY-MM-DD')
  });
  const [summaryData, setSummaryData] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Status options
  const statusOptions = [
    { value: 'present', label: 'Present', color: 'success' },
    { value: 'absent', label: 'Absent', color: 'danger' },
    { value: 'late', label: 'Late', color: 'warning' },
    { value: 'excused', label: 'Excused', color: 'info' }
  ];

  // Fetch initial data
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch students
      const studentsRes = await fetch(`${API_URL.API_URL}/students`);
      const studentsData = await studentsRes.json();
      if (studentsData.success) {
        setStudents(studentsData.data.map(s => ({
          value: s._id,
          label: `${s.name} (${s.class || 'No Class'})`,
          ...s
        })));
      }

      // Fetch teachers
      const teachersRes = await fetch(`${API_URL.API_URL}/teachers`);
      const teachersData = await teachersRes.json();
      if (teachersData.success) {
        setTeachers(teachersData.data.map(t => ({
          value: t._id,
          label: t.name,
          ...t
        })));
      }

      // Fetch initial reports
      if (activeTab === 'summary') {
        await fetchSummaryReport();
      } else {
        await fetchDetailReport();
      }
    } catch (error) {
      toast.error("Error loading initial data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch summary report
  const fetchSummaryReport = async () => {
    setIsLoading(true);
    try {
      let url = `${API_URL.API_URL}/reports/attendance/summary?start_date=${filters.startDate}&end_date=${filters.endDate}`;
      if (filters.student) url += `&studentId=${filters.student}`;
      if (filters.teacher) url += `&teacherId=${filters.teacher}`;
      if (filters.status) url += `&status=${filters.status}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setSummaryData(data.data);
      }
    } catch (error) {
      toast.error("Error loading summary report: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch detail report
  const fetchDetailReport = async () => {
    setIsLoading(true);
    try {
      let url = `${API_URL.API_URL}/reports/attendance/details?start_date=${filters.startDate}&end_date=${filters.endDate}`;
      if (filters.student) url += `&studentId=${filters.student}`;
      if (filters.teacher) url += `&teacherId=${filters.teacher}`;
      if (filters.status) url += `&status=${filters.status}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setDetailData(data.data);
      }
    } catch (error) {
      toast.error("Error loading detail report: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name, selectedOption) => {
    setFilters(prev => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : ''
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    if (activeTab === 'summary') {
      fetchSummaryReport();
    } else {
      fetchDetailReport();
    }
  };

  // Tab change handler
  const toggleTab = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      if (tab === 'summary' && !summaryData) {
        fetchSummaryReport();
      } else if (tab === 'details' && !detailData) {
        fetchDetailReport();
      }
    }
  };

  // Initial data load
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Chart data for summary
  const getSummaryChartData = () => {
    if (!summaryData) return null;

    return {
      labels: ['Present', 'Absent', 'Late', 'Excused'],
      datasets: [
        {
          label: 'Attendance Distribution',
          data: [
            summaryData.presentCount,
            summaryData.absentCount,
            summaryData.lateCount,
            summaryData.excusedCount
          ],
          backgroundColor: [
            '#28a745',
            '#dc3545',
            '#ffc107',
            '#17a2b8'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  // Chart data for monthly trends
  const getMonthlyTrendsChartData = () => {
    if (!detailData?.summary?.monthlyTrends) return null;

    const sortedTrends = [...detailData.summary.monthlyTrends].sort((a, b) => a.month.localeCompare(b.month));

    return {
      labels: sortedTrends.map(t => moment(t.month, 'YYYY-MM').format('MMM YYYY')),
      datasets: [
        {
          label: 'Attendance Rate (%)',
          data: sortedTrends.map(t => t.rate),
          backgroundColor: '#007bff',
          borderColor: '#0056b3',
          borderWidth: 1
        }
      ]
    };
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Attendance Reports" pageTitle="Academics" />
                      <Col lg={12}>
                <Card className="default-card-wrapper">
                  <CardHeader>
                    <h5 className="mb-0">Attendance Report</h5>
                  </CardHeader>   <CardBody>
        <Row className="mb-3">
          <Col md={2}>
            <FormGroup>
              <Label>Start Date</Label>
              <Input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </FormGroup>
          </Col>
          <Col md={2}>
            <FormGroup>
              <Label>End Date</Label>
              <Input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </FormGroup>
          </Col>
          <Col md={2}>
            <FormGroup>
              <Label>Student</Label>
              <Select
                options={students}
                value={students.find(s => s.value === filters.student)}
                onChange={(opt) => handleSelectChange('student', opt)}
                isClearable
                placeholder="All students"
              />
            </FormGroup>
          </Col>
          <Col md={2}>
            <FormGroup>
              <Label>Teacher</Label>
              <Select
                options={teachers}
                value={teachers.find(t => t.value === filters.teacher)}
                onChange={(opt) => handleSelectChange('teacher', opt)}
                isClearable
                placeholder="All teachers"
              />
            </FormGroup>
          </Col>
          <Col md={2}>
            <FormGroup>
              <Label>Status</Label>
              <Select
                options={statusOptions}
                value={statusOptions.find(s => s.value === filters.status)}
                onChange={(opt) => handleSelectChange('status', opt)}
                isClearable
                placeholder="All statuses"
              />
            </FormGroup>
          </Col>
          <Col md={2} className="d-flex align-items-end mb-3">
            <Button 
              color="primary" 
              onClick={handleApplyFilters}
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" /> : 'Apply'}
            </Button>
          </Col>
        </Row>

        <Nav tabs className="mb-3">
          <NavItem>
            <NavLink
              className={activeTab === 'summary' ? 'active' : ''}
              onClick={() => toggleTab('summary')}
            >
              <i className="ri-bar-chart-line me-1"></i> Summary Report
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === 'details' ? 'active' : ''}
              onClick={() => toggleTab('details')}
            >
              <i className="ri-list-check-2 me-1"></i> Detailed Report
            </NavLink>
          </NavItem>
        </Nav></CardBody>
</Card></Col>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="summary">
            <Row>
              <Col lg={12}>
                <Card className="default-card-wrapper">
                  <CardHeader>
                    <h5 className="mb-0">Attendance Summary</h5>
                  </CardHeader>
                  {summaryData ? (
                    <CardBody>
                      <Row>
                        <Col md={8}>
                          <div className="mb-4">
                            <h6 className="mb-3">Attendance Distribution</h6>
                            <div style={{ height: '300px' }}>
                              <Pie 
                                data={getSummaryChartData()}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      position: 'right'
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <Card className="mb-4">
                            <CardHeader className="bg-primary text-white">
                              <h6 className="mb-0 text-white">Key Metrics</h6>
                            </CardHeader>
                            <CardBody>
                              <div className="d-flex justify-content-between mb-3">
                                <span>Total Records:</span>
                                <strong>{summaryData.totalRecords}</strong>
                              </div>
                              <div className="d-flex justify-content-between mb-3">
                                <span>Present:</span>
                                <strong className="text-success">
                                  {summaryData.presentCount} ({Math.round((summaryData.presentCount / summaryData.totalRecords) * 100)}%)
                                </strong>
                              </div>
                              <div className="d-flex justify-content-between mb-3">
                                <span>Absent:</span>
                                <strong className="text-danger">
                                  {summaryData.absentCount} ({Math.round((summaryData.absentCount / summaryData.totalRecords) * 100)}%)
                                </strong>
                              </div>
                              <div className="d-flex justify-content-between mb-3">
                                <span>Late:</span>
                                <strong className="text-warning">
                                  {summaryData.lateCount} ({Math.round((summaryData.lateCount / summaryData.totalRecords) * 100)}%)
                                </strong>
                              </div>
                              <div className="d-flex justify-content-between mb-3">
                                <span>Excused:</span>
                                <strong className="text-info">
                                  {summaryData.excusedCount} ({Math.round((summaryData.excusedCount / summaryData.totalRecords) * 100)}%)
                                </strong>
                              </div>
                              <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                                <span className="fw-bold">Overall Attendance Rate:</span>
                                <strong className={summaryData.attendanceRate >= 75 ? 'text-success' : 'text-danger'}>
                                  {summaryData.attendanceRate}%
                                </strong>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    </CardBody>
                  ) : (
                    <CardBody className="text-center py-5">
                      {isLoading ? (
                        <>
                          <Spinner color="primary" />
                          <div className="mt-2">Loading summary data...</div>
                        </>
                      ) : (
                        "No summary data available"
                      )}
                    </CardBody>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tabId="details">
            <Row>
              <Col lg={12}>
                <Card className="default-card-wrapper">
                  <CardHeader>
                    <h5 className="mb-0">Detailed Attendance Report</h5>
                  </CardHeader>
                  {detailData ? (
                    <CardBody>
                      <Row className="mb-4">
                        <Col md={8}>
                          <div className="mb-4">
                            <h6 className="mb-3">Monthly Attendance Trends</h6>
                            <div style={{ height: '300px' }}>
                              <Bar 
                                data={getMonthlyTrendsChartData()}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      max: 100,
                                      title: {
                                        display: true,
                                        text: 'Attendance Rate (%)'
                                      }
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <Card className="mb-4">
                            <CardHeader className="bg-info text-white">
                              <h6 className="mb-0 text-white">Quick Stats</h6>
                            </CardHeader>
                            <CardBody>
                              <div className="d-flex justify-content-between mb-2">
                                <span>Total Records:</span>
                                <strong>{detailData.summary.totalRecords}</strong>
                              </div>
                              {Object.entries(detailData.summary.byStatus).map(([status, count]) => (
                                <div key={status} className="d-flex justify-content-between mb-2">
                                  <span className="text-capitalize">{status}:</span>
                                  <strong>
                                    {count} ({Math.round((count / detailData.summary.totalRecords) * 100)}%)
                                  </strong>
                                </div>
                              ))}
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>

                      <div className="table-responsive">
                        <Table hover className="mb-0">
                          <thead>
                            <tr>
                                <th>SQN</th>
                              <th>Date</th>
                              <th>Student</th>
                              <th>Class</th>
                              <th>Teacher</th>
                              <th>Status</th>
                              <th>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailData.attendance.length > 0 ? (
                              detailData.attendance.map((record, index) => (
                                <tr key={record._id}>
                                    <td>{++index}</td>
                                  <td>{moment(record.date).format('MMM D, YYYY')}</td>
                                  <td>{record.student?.name || 'N/A'}</td>
                                  <td>{record.student?.class || '-'}</td>
                                  <td>{record.teacher?.name || 'N/A'}</td>
                                  <td>
                                    <Badge color={statusOptions.find(s => s.value === record.status)?.color || 'secondary'}>
                                      {record.status}
                                    </Badge>
                                  </td>
                                  <td>{record.notes || '-'}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" className="text-center py-4">
                                  No attendance records found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </CardBody>
                  ) : (
                    <CardBody className="text-center py-5">
                      {isLoading ? (
                        <>
                          <Spinner color="primary" />
                          <div className="mt-2">Loading detailed data...</div>
                        </>
                      ) : (
                        "No detailed data available"
                      )}
                    </CardBody>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </Container>
      <ToastContainer limit={1} closeButton={false} />
    </div>
  );
};

export default AttendanceReportPage;