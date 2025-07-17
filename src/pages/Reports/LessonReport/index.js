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

const LessonReportPage = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    student: '',
    teacher: '',
    status: '',
    surahNumber: '',
    isConcluded: '',
    startDate: moment().format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    checkDate: moment().format('YYYY-MM-DD'),

  });
  const [summaryData, setSummaryData] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [studentsWithoutLessons, setStudentsWithoutLessons] = useState([]);

  // Status options
  const statusOptions = [
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'repeated', label: 'repeated', color: 'danger' }
  ];

  // Conclusion options
  const conclusionOptions = [
    { value: 'true', label: 'Concluded' },
    { value: 'false', label: 'Not Concluded' }
  ];

  // Fetch initial data
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch students
      const studentsRes = await fetch(`${API_URL.API_URL}/students`);
      const studentsData = await studentsRes.json();
      if (studentsData.success) {
        setStudents(studentsData.data
           .filter(student => student.isActive) // Only include active students
          .map(s => ({
          value: s._id,
          label: s.name,
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
      let url = `${API_URL.API_URL}/reports/lessons/summary?start_date=${filters.startDate}&end_date=${filters.endDate}`;
      if (filters.student) url += `&studentId=${filters.student}`;
      if (filters.teacher) url += `&teacherId=${filters.teacher}`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.isConcluded) url += `&isConcluded=${filters.isConcluded}`;
      if (filters.surahNumber) url += `&surahNumber=${filters.surahNumber}`;

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
      let url = `${API_URL.API_URL}/reports/lessons/details?start_date=${filters.startDate}&end_date=${filters.endDate}`;
      if (filters.student) url += `&studentId=${filters.student}`;
      if (filters.teacher) url += `&teacherId=${filters.teacher}`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.isConcluded) url += `&isConcluded=${filters.isConcluded}`;
      if (filters.surahNumber) url += `&surahNumber=${filters.surahNumber}`;

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

  // Fetch students without lessons
  // const fetchStudentsWithoutLessons = async () => {
  //   try {
  //     const response = await fetch(
  //       `${API_URL.API_URL}/reports/students-without-lessons?date=${filters.checkDate}`
  //     );
  //     const data = await response.json();
  //     if (data.success) {
  //       setStudentsWithoutLessons(data.data);
  //     }
  //   } catch (error) {
  //     toast.error("Error fetching students without lessons: " + error.message);
  //   }
  // };

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
    // fetchStudentsWithoutLessons();
  }, []);

  // Chart data for summary
  const getSummaryChartData = () => {
    if (!summaryData) return null;

    return {
      labels: ['Completed','repeated'],
      datasets: [
        {
          label: 'Lesson Status Distribution',
          data: [
            summaryData.completedLessons,
            summaryData.pendingLessons,
            (summaryData.totalLessons - summaryData.completedLessons - summaryData.pendingLessons)
          ],
          backgroundColor: [
            '#28a745',
            '#dc3545',
            '#dc3545'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  // Chart data for surah progress
  const getSurahProgressChartData = () => {
    if (!detailData?.summary?.bySurah) return null;

    const sortedSurahs = [...detailData.summary.bySurah].sort((a, b) => a.surah_number - b.surah_number);

    return {
      labels: sortedSurahs.map(s => `${s.surah_number}. ${s.surah_name}`),
      datasets: [
        {
          label: 'Completion Percentage',
          data: sortedSurahs.map(s => s.completion_percentage),
          backgroundColor: '#17a2b8',
          borderColor: '#117a8b',
          borderWidth: 1
        }
      ]
    };
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Lesson Reports" pageTitle="Academics" />
        
        <Row>
          <Col lg={12}>
            <Card className="default-card-wrapper">
              <CardHeader>
                <h5 className="mb-0">Lesson Report</h5>
              </CardHeader>
              <CardBody>
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
                  {/* <Col md={2}>
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
                  </Col> */}
                  <Col md={2} >
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
                  {/* <Col md={2}>
                    <FormGroup>
                      <Label>Surah Number</Label>
                      <Input
                        type="number"
                        name="surahNumber"
                        value={filters.surahNumber}
                        onChange={handleFilterChange}
                        placeholder="All surahs"
                        min="1"
                        max="114"
                      />
                    </FormGroup>
                  </Col> */}
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
                <Row>
                  <Col md={2} style={{display:"none"}}>
                    <FormGroup>
                      <Label>Conclusion Status</Label>
                      <Select
                        options={conclusionOptions}
                        value={conclusionOptions.find(c => c.value === filters.isConcluded)}
                        onChange={(opt) => handleSelectChange('isConcluded', opt)}
                        isClearable
                        placeholder="All lessons"
                      />
                    </FormGroup>
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
                </Nav>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <TabContent activeTab={activeTab}>
          <TabPane tabId="summary">
            <Row>
              <Col lg={12}>
                <Card className="default-card-wrapper">
                  <CardHeader>
                    <h5 className="mb-0">Lesson Summary</h5>
                  </CardHeader>
                  {summaryData ? (
                    <CardBody>
                      <Row>
                        <Col md={8}>
                          <div className="mb-4">
                            <h6 className="mb-3">Lesson Status Distribution</h6>
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
                                <span>Total Lessons:</span>
                                <strong>{summaryData.totalLessons}</strong>
                              </div>
                              <div className="d-flex justify-content-between mb-3">
                                <span>Completed:</span>
<strong className="text-success">
  {summaryData.completedLessons} ({Math.round((summaryData.completedLessons / summaryData.totalLessons) * 100) || 0}%)
</strong>

                              </div>
                              <div className="d-flex justify-content-between mb-3">
                                <span>Repeated:</span>
                             <strong className="text-danger">
  {summaryData.pendingLessons} ({Math.round((summaryData.pendingLessons / summaryData.totalLessons) * 100) || 0}%)
</strong>

                              </div>
                              <div className="d-flex justify-content-between mb-3">
                                <span>Unique Surahs:</span>
                                <strong>{summaryData.uniqueSurahsCount}</strong>
                              </div>
                              <div className="d-flex justify-content-between mb-3">
                                <span>Avg Ayahs Covered:</span>
                                <strong>{summaryData.avgAyahsCovered || 0}</strong>
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
                    <h5 className="mb-0">Detailed Lesson Report</h5>
                  </CardHeader>
                  {detailData ? (
                    <CardBody>
                      <Row className="mb-4">
                        <Col md={8}>
                          <div className="mb-4">
                            <h6 className="mb-3">Surah Progress</h6>
                            <div style={{ height: '300px' }}>
                              <Bar 
                                data={getSurahProgressChartData()}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      max: 100,
                                      title: {
                                        display: true,
                                        text: 'Completion (%)'
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
    <span>Total Lessons:</span>
    <strong>{detailData.summary.totalLessons}</strong>
  </div>
  {Object.entries(detailData.summary.byStatus).map(([status, count]) => (
    <div key={status} className="d-flex justify-content-between mb-2">
      <span className="text-capitalize">{status}:</span>
      <strong>
        {count} (
          {detailData.summary.totalLessons > 0
            ? `${Math.round((count / detailData.summary.totalLessons) * 100)}%`
            : '0%'}
        )
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
                              <th>#</th>
                              <th>Date</th>
                              <th>Student</th>
                              {/* <th>Class</th> */}
                              {/* <th>Teacher</th> */}
                              <th>Surah</th>
                              <th>Ayahs</th>
                              <th>Status</th>
                              <th>Concluded</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailData.lessons.length > 0 ? (
                              detailData.lessons.map((lesson, index) => (
                                <tr key={lesson._id}>
                                  <td>{index + 1}</td>
                                  <td>{moment(lesson.lessonDate).format('MMM D, YYYY')}</td>
                                  <td>{lesson.student?.name || 'N/A'}</td>
                                  {/* <td>{lesson.student?.class || '-'}</td> */}
                                  {/* <td>{lesson.teacher?.name || 'N/A'}</td> */}
                                  <td>{lesson.surah_number}. {lesson.surah_name}</td>
                                  <td>{lesson.from_ayah}-{lesson.to_ayah}</td>
                                  <td>
                                    <Badge color={statusOptions.find(s => s.value === lesson.status)?.color || 'secondary'}>
                                      {lesson.status}
                                    </Badge>
                                  </td>
                                  <td>
                                    <Badge color={lesson.is_concluded ? 'success' : 'danger'}>
                                      {lesson.is_concluded ? 'Yes' : 'No'}
                                    </Badge>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="9" className="text-center py-4">
                                  No lesson records found
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

        {/* Students Without Lessons Section */}
        {/* <Row className="mt-4">
          <Col lg={12}>
            <Card className="default-card-wrapper">
              <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Students Without Lessons</h5>
                  <div className="d-flex">
                    <Input
                      type="date"
                      name="checkDate"
                      value={filters.checkDate}
                      onChange={handleFilterChange}
                      className="me-2"
                      style={{ width: '200px' }}
                    />
                    <Button 
                      color="primary" 
                      onClick={fetchStudentsWithoutLessons}
                      disabled={isLoading}
                    >
                      {isLoading ? <Spinner size="sm" /> : 'Check'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {studentsWithoutLessons.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Student Name</th>
                          <th>Class</th>
                          <th>Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsWithoutLessons.map((student, index) => (
                          <tr key={student._id}>
                            <td>{index + 1}</td>
                            <td>{student.name}</td>
                            <td>{student.groupName || '-'}</td>
                            <td>{student.contact || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    {isLoading ? (
                      <>
                        <Spinner color="primary" />
                        <div className="mt-2">Checking for students without lessons...</div>
                      </>
                    ) : (
                      "All students have lessons recorded for the selected date"
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row> */}
      </Container>
      <ToastContainer limit={1} closeButton={false} />
    </div>
  );
};

export default LessonReportPage;