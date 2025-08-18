import { useState, useEffect } from "react";
import {
  Card, CardHeader, CardBody, CardFooter,
  Col, Container, Row,
  Table, Spinner, Badge, Button,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Form, Input, Label, FormGroup
} from "reactstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import moment from 'moment';
import { api as API_URL } from "../../../config";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

const AttendancePage = () => {
  // State management
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
    const authUser = JSON.parse(sessionStorage.getItem("authUser"));
  const [filters, setFilters] = useState({
    student: '',
    teacher: authUser?.data?.user._id,
    status: '',
    startDate: moment().format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD')
  });
  const [modal, setModal] = useState({
    isOpen: false,
    mode: 'single', // 'single' or 'bulk'
    data: {
      date: moment().format('YYYY-MM-DD'),
      student: '',
      teacher: '',
      status: 'present',
      notes: ''
    }
  });
  const [bulkData, setBulkData] = useState({
    date: moment().format('YYYY-MM-DD'),
    teacher: '',
    records: []
  });

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
      const response = await fetch(`${API_URL.API_URL}/attendance/teacher-groups/students/${authUser?.data?.user._id}`);
      const groupsData = await response.json();

      // Flatten all students from all groups into a single array
      const studentsData = {
        success: groupsData.success,
        data: groupsData.data.flatMap(group =>
          group.students.map(student => ({
            ...student,
            groupId: group.groupId,
            groupName: group.groupName
          })))
      };

      //   if (studentsData.success) {

      //   }
      setStudents(
        studentsData.data
          .filter(student => !student.leaveDate) // Only active students (no leaveDate)
          .map(student => ({
            value: student.studentId,
            label: student.name,
            ...student
          }))
      );

      // setStudents(
      //   studentsData.data
      //     .filter(student => student.isActive) // Only include active students
      //     .map(student => ({
      //       value: student._id,
      //       label: `${student.name}`, // Include roll number in label
      //       ...student
      //     }))
      // );
      // Fetch teachers
      const teachersRes = await fetch(`${API_URL.API_URL}/teachers`);
      const teachersData = await teachersRes.json();
      //   if (teachersData.success) {

      //   }
      setTeachers(teachersData.data.map(t => ({
        value: t._id,
        label: t.name,
        ...t
      })));

      // Fetch attendance records
      await fetchAttendance();
    } catch (error) {
      toast.error("Error loading initial data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch attendance records with filters
  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      let url = `${API_URL.API_URL}/attendance?start_date=${filters.startDate}&end_date=${filters.endDate}&teacher_id=${authUser?.data?.user._id}`;
      if (filters.student) url += `&student_id=${filters.student}`;
    //  if (filters.teacher) url += `&teacher_id=${filters.teacher}`;
      if (filters.status) url += `&status=${filters.status}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setAttendanceRecords(data.data);
      }
    } catch (error) {
      toast.error("Error loading attendance: " + error.message);
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

  // Open modal for single attendance
  const openSingleModal = () => {
    setModal({
      isOpen: true,
      mode: 'single',
      data: {
        date: moment().format('YYYY-MM-DD'),
        student: '',
        teacher: '',
        status: 'present',
        notes: ''
      }
    });
  };

  // Open modal for bulk attendance
  const openBulkModal = () => {
    setBulkData({
      date: moment().format('YYYY-MM-DD'),
      teacher: '',
      records: students.map(s => ({
        student_id: s.value,
        name: s.label,
        status: 'present',
        notes: ''
      }))
    });
    setModal({
      isOpen: true,
      mode: 'bulk',
      data: {
        date: moment().format('YYYY-MM-DD'),
        teacher: ''
      }
    });
  };

  // Handle modal input changes
  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModal(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [name]: value
      }
    }));
  };

  // Handle bulk status change
  const handleBulkStatusChange = (studentId, status) => {
    setBulkData(prev => ({
      ...prev,
      records: prev.records.map(r =>
        r.student_id === studentId ? { ...r, status } : r
      )
    }));
  };

  // Handle bulk notes change
  const handleBulkNotesChange = (studentId, notes) => {
    setBulkData(prev => ({
      ...prev,
      records: prev.records.map(r =>
        r.student_id === studentId ? { ...r, notes } : r
      )
    }));
  };
  //const authUser = JSON.parse(sessionStorage.getItem("authUser"));
  // Submit single attendance
  const handleSubmitSingle = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL.API_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: modal.data.date,
          student_id: modal.data.student,
          teacher_id: authUser?.data?.user._id,
          status: modal.data.status,
          notes: modal.data.notes
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Attendance recorded successfully");
        setModal({ isOpen: false, mode: 'single', data: null });
        fetchAttendance();
      } else {
        toast.error(data.message || "Failed to record attendance");
      }
    } catch (error) {
      toast.error("Error recording attendance: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit bulk attendance
  const handleSubmitBulk = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL.API_URL}/attendance/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: bulkData.date,
          teacher_id: authUser?.data?.user._id,
          attendance_data: bulkData.records
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Attendance recorded for ${data.count} students`);
        setModal({ isOpen: false, mode: 'bulk', data: null });
        fetchAttendance();
      } else {
        toast.error(data.message || "Failed to record bulk attendance");
      }
    } catch (error) {
      toast.error("Error recording bulk attendance: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update attendance status
  const updateAttendanceStatus = async (id, newStatus) => {
    if (window.confirm(`Change attendance status to ${newStatus}?`)) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL.API_URL}/attendance/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Attendance updated successfully");
          fetchAttendance();
        } else {
          toast.error(data.message || "Failed to update attendance");
        }
      } catch (error) {
        toast.error("Error updating attendance: " + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Initial data load
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch attendance when filters change
  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Attendance Management" pageTitle="Academics" />

        <Row className="justify-content-center">
          <Col lg={12}>
            <Card className="default-card-wrapper">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Attendance Records</h5>
                <div>
                  <Button
                    color="primary"
                    className="me-2"
                    onClick={openSingleModal}
                  >
                    <i className="ri-user-add-line me-1"></i> Single Entry
                  </Button>
                  <Button
                    color="success"
                    onClick={openBulkModal}
                  >
                    <i className="ri-group-line me-1"></i> Bulk Entry
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                <Row className="mb-3">
                  <Col md={2}>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                    />
                  </Col>
                  <Col md={2}>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                    />
                  </Col>
                  <Col md={2}>
                    <Label>Student</Label>
                    <Select
                      options={students}
                      value={students.find(s => s.value === filters.student)}
                      onChange={(opt) => handleSelectChange('student', opt)}
                      isClearable
                      placeholder="All students"
                    />
                  </Col>
                  {/* <Col md={2}>
                    <Label>Teacher</Label>
                    <Select
                      options={teachers}
                      value={teachers.find(t => t.value === filters.teacher)}
                      onChange={(opt) => handleSelectChange('teacher', opt)}
                      isClearable
                      placeholder="All teachers"
                    />
                  </Col> */}
                  <Col md={2}>
                    <Label>Status</Label>
                    <Select
                      options={statusOptions}
                      value={statusOptions.find(s => s.value === filters.status)}
                      onChange={(opt) => handleSelectChange('status', opt)}
                      isClearable
                      placeholder="All statuses"
                    />
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button
                      color="primary"
                      onClick={fetchAttendance}
                      disabled={isLoading}
                    >
                      {isLoading ? <Spinner size="sm" /> : 'Filter'}
                    </Button>
                  </Col>
                </Row>

                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>SQN</th>
                        <th>Date</th>
                        <th>Student</th>
                        {/* <th>Teacher</th> */}
                        <th>Status</th>
                        <th>Notes</th>
                        {/* <th>Actions</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.length > 0 ? (
                        attendanceRecords.map((record, index) => (
                          <tr key={record._id}>
                            <td>{++index}</td>
                            <td>{moment(record.date).format('MMM D, YYYY')}</td>
                            <td>{record.student?.name || 'N/A'}</td>
                            {/* <td>{record.teacher?.name || 'N/A'}</td> */}
                            <td>
                              <Badge color={statusOptions.find(s => s.value === record.status)?.color || 'secondary'}>
                                {record.status}
                              </Badge>
                            </td>
                            <td>{record.notes || '-'}</td>
                            {/* <td>
                              <Button 
                                color="light" 
                                size="sm"
                                onClick={() => updateAttendanceStatus(record._id, 
                                  record.status === 'present' ? 'absent' : 'present')}
                              >
                                Toggle Status
                              </Button>
                            </td> */}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            {isLoading ? (
                              <Spinner color="primary" />
                            ) : (
                              "No attendance records found for the selected filters"
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </CardBody>

              <CardFooter className="d-flex justify-content-between">
                <div className="text-muted">
                  Showing {attendanceRecords.length} records
                </div>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Single Attendance Modal */}
      <Modal isOpen={modal.isOpen && modal.mode === 'single'} toggle={() => setModal(prev => ({ ...prev, isOpen: false }))}>
        <ModalHeader toggle={() => setModal(prev => ({ ...prev, isOpen: false }))}>
          Record Single Attendance
        </ModalHeader>
        <Form onSubmit={handleSubmitSingle}>
          <ModalBody>
            <FormGroup>
              <Label>Date</Label>
              <Input
                type="date"
                name="date"
                value={modal.data?.date || ""}
                onChange={handleModalChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Student</Label>
              <Select
                options={students}
                value={students.find(s => s.value === modal.data?.student || "")}
                onChange={(opt) => setModal(prev => ({
                  ...prev,
                  data: { ...prev.data, student: opt?.value || '' }
                }))}
                isClearable
                placeholder="Select student"
                required
              />
            </FormGroup>
            {/* <FormGroup style={{display:"none"}}>
              <Label>Teacher</Label>
              <Select
                options={teachers}
                value={teachers.find(t => t.value === modal.data?.teacher || "")}
                onChange={(opt) => setModal(prev => ({
                  ...prev,
                  data: { ...prev.data, teacher: opt?.value || '' }
                }))}
                isClearable
                placeholder="Select teacher"
                // required
              />
            </FormGroup> */}
            <FormGroup>
              <Label>Status</Label>
              <Input
                type="select"
                name="status"
                value={modal.data?.status || ""}
                onChange={handleModalChange}
                required
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label>Notes</Label>
              <Input
                type="textarea"
                name="notes"
                value={modal.data?.notes || ""}
                onChange={handleModalChange}
                placeholder="Optional notes"
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Save Attendance'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Bulk Attendance Modal */}
      <Modal isOpen={modal.isOpen && modal.mode === 'bulk'} size="xl" toggle={() => setModal(prev => ({ ...prev, isOpen: false }))}>
        <ModalHeader toggle={() => setModal(prev => ({ ...prev, isOpen: false }))}>
          Record Bulk Attendance
        </ModalHeader>
        <Form onSubmit={handleSubmitBulk}>
          <ModalBody>
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    name="date"
                    value={bulkData.date}
                    onChange={(e) => setBulkData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                {/* <FormGroup style={{display:"none"}}>
                  <Label>Teacher</Label>
                  <Select
                    options={teachers}
                    value={teachers.find(t => t.value === bulkData.teacher)}
                    onChange={(opt) => setBulkData(prev => ({ ...prev, teacher: opt?.value || '' }))}
                    isClearable
                    placeholder="Select teacher"
                    // required
                  />
                </FormGroup> */}
              </Col>
            </Row>

            <div className="table-responsive mt-3">
              <Table hover>
                <thead>
                  <tr>
                    <th>SQN</th>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkData.records.map((record, index) => (
                    <tr key={record.student_id}>
                      <td>{++index}</td>
                      <td>{record.name}</td>
                      <td>
                        <Input
                          type="select"
                          value={record.status}
                          onChange={(e) => handleBulkStatusChange(record.student_id, e.target.value)}
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </Input>
                      </td>
                      <td>
                        <Input
                          type="text"
                          value={record.notes}
                          onChange={(e) => handleBulkNotesChange(record.student_id, e.target.value)}
                          placeholder="Notes"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Save All Attendance'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ToastContainer limit={1} closeButton={false} />
    </div>
  );
};

export default AttendancePage;
