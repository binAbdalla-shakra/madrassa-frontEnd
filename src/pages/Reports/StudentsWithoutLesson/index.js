import { useState, useEffect } from "react";
import {
  Card, CardHeader, CardBody,
  Col, Container, Row,
  Table, Spinner, Button,
  FormGroup, Label, Input
} from "reactstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import moment from 'moment';
import { api as API_URL } from "../../../config";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

const StudentsWithoutLessonsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    group: '',
    search: ''
  });
  const [groups, setGroups] = useState([]);

  // Fetch groups for filter
  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_URL.API_URL}/groups`);
      const data = await response.json();
      if (data.success) {
        setGroups(data.data.map(g => ({
          value: g._id,
          label: g.name,
          ...g
        })));
      }
    } catch (error) {
      toast.error("Error loading groups: " + error.message);
    }
  };

  // Fetch students without lessons
  const fetchStudentsWithoutLessons = async () => {
    if (!date) {
      toast.warning("Please select a date first");
      return;
    }

    setIsLoading(true);
    try {
      let url = `${API_URL.API_URL}/reports/students-without-lessons?date=${date}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data);
      } else {
        toast.error(data.message || "Error fetching data");
      }
    } catch (error) {
      toast.error("Error loading report: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle group filter change
  const handleGroupChange = (selectedOption) => {
    setFilters(prev => ({
      ...prev,
      group: selectedOption ? selectedOption.value : ''
    }));
  };

  // Apply search and filters
  const filteredStudents = students.filter(student => {
    // Group filter
    if (filters.group && student.groupName !== filters.group) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        student.name.toLowerCase().includes(searchLower) ||
        (student.contact && student.contact.toLowerCase().includes(searchLower)) ||
        (student.groupName && student.groupName.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Initial data load
  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb 
          title="Students Without Lessons" 
          pageTitle="Reports"
          items={[
            { title: "Reports", link: "/reports" },
            { title: "Attendance", link: "/reports/attendance" },
            { title: "Students Without Lessons", link: "#" }
          ]} 
        />
        
        <Row>
          <Col lg={12}>
            <Card className="default-card-wrapper">
              <CardHeader>
                <h5 className="mb-0">Students Without Lessons</h5>
              </CardHeader>
              <CardBody>
                <Row className="mb-4">
                  <Col md={3}>
                    <FormGroup>
                      <Label>Check Date</Label>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                    {students.length > 0 && (
                
                   
                    <Col md={3} >
                      <FormGroup>
                        <Label>Search</Label>
                        <Input
                          type="text"
                          name="search"
                          value={filters.search}
                          onChange={handleFilterChange}
                          placeholder="Search students..."
                        />
                      </FormGroup>
                    </Col>
            
                )}
                 <Col md={3} style={{display:"none"}}>
                      <FormGroup>
                        <Label>Filter by Group</Label>
                        <Select
                          options={groups}
                          value={groups.find(g => g.value === filters.group)}
                          onChange={handleGroupChange}
                          isClearable
                          placeholder="All groups"
                        />
                      </FormGroup>
                    </Col>
                  <Col md={3} className="d-flex align-items-end mb-3">
                    <Button 
                      color="primary" 
                      onClick={fetchStudentsWithoutLessons}
                      disabled={isLoading}
                    >
                      {isLoading ? <Spinner size="sm" /> : 'Generate Report'}
                    </Button>
                  </Col>
                </Row>

              
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col lg={12}>
            <Card className="default-card-wrapper">
              <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Results</h5>
                  <div className="text-muted">
                    {filteredStudents.length} students found
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                    <div className="mt-2">Loading report data...</div>
                  </div>
                ) : filteredStudents.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover striped>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Student Name</th>
                          <th>Group</th>
                          <th>Contact</th>
                          {/* <th>Actions</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student, index) => (
                          <tr key={student._id}>
                            <td>{index + 1}</td>
                            <td>{student.name}</td>
                            <td>{student.groupName || 'No group assigned'}</td>
                            <td>{student.contact || '-'}</td>
                            {/* <td>
                              <Button 
                                color="info" 
                                size="sm"
                                onClick={() => {
                                  // Implement action (e.g., navigate to student profile)
                                  toast.info(`Viewing ${student.name}'s profile`);
                                }}
                              >
                                View Profile
                              </Button>
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : students.length > 0 ? (
                  <div className="text-center py-4">
                    No students match your filters
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="ri-information-line display-5 text-muted"></i>
                    <h5 className="mt-3">No data available</h5>
                    <p className="text-muted">Select a date and generate the report</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <ToastContainer limit={1} closeButton={false} />
    </div>
  );
};

export default StudentsWithoutLessonsPage;