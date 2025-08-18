import { useState, useEffect } from "react";
import {
  Card, CardHeader, CardBody, CardFooter,
  Col, Container, Row,
  Table, Spinner, Badge, Button,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Form, Input, Label, FormGroup, InputGroup, InputGroupText
} from "reactstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { api as API_URL } from "../../../config";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import moment from "moment";

const LessonsPage = () => {
  // State management
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [ayahs, setAyahs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const authUser = JSON.parse(sessionStorage.getItem("authUser"));

  const [filters, setFilters] = useState({
    student: '',
    teacher: authUser?.data?.user._id,
    surah: '',
    status: '',
    startDate: moment().format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    isConcluded: ''
  });
  const [modal, setModal] = useState({
    isOpen: false,
    mode: 'create',
    data: {
      lessonDate: moment().format('YYYY-MM-DD'),
      student: '',
      teacher: '',
      surah_number: '',
      surah_name: '',
      from_ayah: '',
      to_ayah: '',
      is_concluded: false,
      feedback: '',
      notes: '',
      materials_used: [],
      homework_assigned: '',
      status: 'completed'
    }
  });
  
  // Status options
  const statusOptions = [
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'repeated', label: 'repeated', color: 'danger' }
  ];

  // Fetch initial data
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch students
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

      // Fetch teachers
      const teachersRes = await fetch(`${API_URL.API_URL}/teachers`);
      const teachersData = await teachersRes.json();
      setTeachers(teachersData.data.map(t => ({
        value: t._id,
        label: t.name,
        ...t
      })));

      // Fetch all Surahs from AlQuran Cloud API
      const surahsRes = await fetch('https://api.alquran.cloud/v1/surah');
      const surahsData = await surahsRes.json();
      if (surahsData.code === 200) {
        setSurahs(surahsData.data.map(s => ({
          value: s.number,
          label: `${s.number}. ${s.name}`,
          ...s
        })));
      }

      // Fetch lessons
      await fetchLessons();
    } catch (error) {
      toast.error("Error loading initial data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch ayahs for selected surah
  const fetchAyahs = async (surahNumber) => {
    if (!surahNumber) return;

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const data = await res.json();
      if (data.code === 200) {
        const ayahOptions = data.data.ayahs.map(ayah => ({
          value: ayah.numberInSurah,
          label: ayah.text
          //   text: ayah.text
        }));

        setAyahs(ayahOptions);

        // Update modal data with surah name
        // setModal(prev => ({
        //   ...prev,
        //   data: {
        //     ...prev.data,
        //     surah_name: data.data.englishName,
        //     from_ayah: 1,
        //     to_ayah: ayahOptions.length > 0 ? ayahOptions[ayahOptions.length - 1].value : 1
        //   }
        // }));
      }
    } catch (error) {
      toast.error("Error loading ayahs: " + error.message);
    }
  };

  // Fetch lessons with filters
  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      let url = `${API_URL.API_URL}/lessons?start_date=${filters.startDate}&end_date=${filters.endDate}`;
      if (filters.student) url += `&student_id=${filters.student}`;
      if (filters.teacher) url += `&teacher_id=${filters.teacher}`;
      if (filters.surah) url += `&surah_number=${filters.surah}`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.isConcluded !== '') url += `&is_concluded=${filters.isConcluded}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setLessons(data.data);
      }
    } catch (error) {
      toast.error("Error loading lessons: " + error.message);
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

  // Open modal for creating/editing
  const openModal = (mode, lesson = null) => {
    if (mode === 'create') {
      setModal({
        isOpen: true,
        mode: 'create',
        data: {
          lessonDate: moment().format('YYYY-MM-DD'),
          student: '',
          teacher: authUser?.data?.user._id,
          surah_number: '',
          surah_name: '',
          from_ayah: '',
          to_ayah: '',
          is_concluded: false,
          feedback: '',
          notes: '',
          materials_used: [],
          homework_assigned: '',
          status: 'completed'
        }
      });
    } else {
      setModal({
        isOpen: true,
        mode: 'edit',
        data: {
          ...lesson,
          from_ayah: lesson.from_ayah,
          student: lesson?.student?._id,
          teacher: authUser?.data?.user._id,
          lessonDate: moment(lesson.lessonDate).format('YYYY-MM-DD')
        }
      });
      if (lesson.surah_number) {
        fetchAyahs(lesson.surah_number);
      }
    }
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

  // Handle surah selection change
  const handleSurahChange = (selectedOption) => {
    setModal(prev => ({
      ...prev,
      data: {
        ...prev.data,
        surah_number: selectedOption ? selectedOption.value : '',
        surah_name: selectedOption ? selectedOption.name : '',
        from_ayah: 1,
        to_ayah: selectedOption ? selectedOption.numberOfAyahs : 1
      }
    }));

    if (selectedOption) {
      fetchAyahs(selectedOption.value);
    } else {
      setAyahs([]);
    }
  };

  // Handle ayah selection change
  const handleAyahChange = (name, selectedOption) => {
    setModal(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [name]: selectedOption ? selectedOption.value : 1
      }
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!modal.data.student || !modal.data.teacher || !modal.data.surah_number) {
      toast.warning("Please select student, teacher and surah");
      return false;
    }
    if (modal.data.from_ayah > modal.data.to_ayah) {
      toast.warning("From ayah cannot be greater than to ayah");
      return false;
    }
    return true;
  };

  // Submit lesson
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const url = modal.mode === 'create'
        ? `${API_URL.API_URL}/lessons`
        : `${API_URL.API_URL}/lessons/${modal.data._id}`;

      const method = modal.mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modal.data)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Lesson ${modal.mode === 'create' ? 'created' : 'updated'} successfully`);
        setModal({ isOpen: false, mode: 'create' });
        fetchLessons();
      } else {
        toast.error(data.message || `Failed to ${modal.mode === 'create' ? 'create' : 'update'} lesson`);
      }
    } catch (error) {
      toast.error(`Error ${modal.mode === 'create' ? 'creating' : 'updating'} lesson: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch lessons when filters change
  useEffect(() => {
    fetchLessons();
  }, [filters]);


  // Add this function to check if to_ayah is the last ayah
  const isLastAyah = () => {
    if (!modal.data?.surah_number || !ayahs.length) return false;
    const lastAyah = ayahs[ayahs.length - 1].value;
    return modal.data.to_ayah === lastAyah;
  };
  useEffect(() => {
    if (
      modal.data?.surah_number &&
      modal.data?.to_ayah &&
      ayahs.length
    ) {
      const lastAyah = ayahs[ayahs.length - 1].value;
      const shouldBeConcluded = modal.data.to_ayah === lastAyah;

      if (modal.data.is_concluded !== shouldBeConcluded) {
        setModal(prev => ({
          ...prev,
          data: { ...prev.data, is_concluded: shouldBeConcluded }
        }));
      }
    }
  }, [modal.data?.to_ayah, modal.data?.surah_number, ayahs]);



  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Quran Lessons" pageTitle="Academics" />

        <Row className="justify-content-center">
          <Col lg={12}>
            <Card className="default-card-wrapper">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Lesson Records</h5>
                <Button
                  color="primary"
                  onClick={() => openModal('create')}
                >
                  <i className="ri-add-line me-1"></i> New Lesson
                </Button>
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
                    <Label>Surah</Label>
                    <Select
                      options={surahs}
                      value={surahs.find(s => s.value === filters.surah)}
                      onChange={(opt) => handleSelectChange('surah', opt)}
                      isClearable
                      placeholder="All surahs"
                    />
                  </Col>
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
                      onClick={fetchLessons}
                      disabled={isLoading}
                    >
                      {isLoading ? <Spinner size="sm" /> : 'Filter'}
                    </Button>
                  </Col>
                </Row>
                <Row className="mb-3">
                  {/* <Col md={2}>
                    <Label>Concluded</Label>
                    <Input
                      type="select"
                      name="isConcluded"
                      value={filters.isConcluded}
                      onChange={handleFilterChange}
                    >
                      <option value="">All</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Input>
                  </Col> */}

                </Row>

                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>SQN</th>
                        <th>Date</th>
                        <th>Student</th>
                        {/* <th>Teacher</th> */}
                        <th>Surah</th>
                        <th>Verses</th>
                        <th>Status</th>
                        <th>Concluded</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lessons.length > 0 ? (
                        lessons.map((lesson, index) => (
                          <tr key={lesson._id}>
                            <td>{++index}</td>
                            <td>{moment(lesson.lessonDate).format('MMM D, YYYY')}</td>
                            <td>{lesson.student?.name || 'N/A'}</td>
                            {/* <td>{lesson.teacher?.name || 'N/A'}</td> */}
                            <td>
                              {lesson.surah_number}. {lesson.surah_name}
                            </td>
                            <td>
                              {lesson.from_ayah}-{lesson.to_ayah}
                            </td>
                            <td>
                              <Badge color={statusOptions.find(s => s.value === lesson.status)?.color || 'secondary'}>
                                {lesson.status}
                              </Badge>
                            </td>
                            <td>
                              <Badge color={lesson.is_concluded ? 'success' : 'warning'}>
                                {lesson.is_concluded ? 'Yes' : 'No'}
                              </Badge>
                            </td>
                            <td>
                              <Button
                                color="light"
                                size="sm"
                                onClick={() => openModal('edit', lesson)}
                              >
                                <i className="ri-pencil-line"></i> Edit
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            {isLoading ? (
                              <Spinner color="primary" />
                            ) : (
                              "No lesson records found for the selected filters"
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
                  Showing {lessons.length} records
                </div>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Lesson Modal */}
      <Modal isOpen={modal.isOpen} size="xl" toggle={() => setModal(prev => ({ ...prev, isOpen: false }))}>
        <ModalHeader toggle={() => setModal(prev => ({ ...prev, isOpen: false }))}>
          {modal.mode === 'create' ? 'Create New Lesson' : 'Edit Lesson'}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label>Date <span className="text-danger">*</span></Label>
                  <Input
                    type="date"
                    name="lessonDate"
                    value={modal.data?.lessonDate || ""}
                    onChange={handleModalChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>Status <span className="text-danger">*</span></Label>
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
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>Student <span className="text-danger">*</span></Label>
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
              </Col>
              {/* <Col md={6}>
                <FormGroup>
                  <Label>Teacher <span className="text-danger">*</span></Label>
                  <Select
                    options={teachers}
                    value={teachers.find(t => t.value === modal.data?.teacher || "")}
                    onChange={(opt) => setModal(prev => ({
                      ...prev,
                      data: { ...prev.data, teacher: opt?.value || '' }
                    }))}
                    isClearable
                    placeholder="Select teacher"
                    required
                  />
                </FormGroup>
              </Col> */}
              <Col md={4}>
                <FormGroup>
                  <Label>Surah <span className="text-danger">*</span></Label>
                  <Select
                    options={surahs}
                    value={surahs.find(s => s.value === modal.data?.surah_number || "")}
                    onChange={handleSurahChange}
                    isClearable
                    placeholder="Select surah"
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>From Ayah <span className="text-danger">*</span></Label>
                  <Select
                    options={ayahs}
                    value={ayahs.find(a => a.value === modal.data?.from_ayah)}
                    onChange={(opt) => handleAyahChange('from_ayah', opt)}
                    isClearable
                    placeholder="Select starting ayah"
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>To Ayah <span className="text-danger">*</span></Label>
                  <Select
                    options={ayahs.filter(a => a.value >= (modal.data?.from_ayah || 1))}
                    value={ayahs.find(a => a.value === modal.data?.to_ayah)}
                    onChange={(opt) => handleAyahChange('to_ayah', opt)}
                    isClearable
                    placeholder="Select ending ayah"
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup check className="mb-3">
                  <Label check>
                    <Input
                      type="checkbox"
                      name="is_concluded"
                      checked={modal.data?.is_concluded || false}
                      // onChange={(e) => {
                      // if (!isLastAyah()) {
                      //     setModal(prev => ({
                      //     ...prev,
                      //     data: { ...prev.data, is_concluded: e.target.checked }
                      //     }));
                      // }
                      // }}
                      className="me-2"
                      style={{ width: '18px', height: '18px' }}
                      disabled
                    />
                    <span style={{ fontSize: '16px', verticalAlign: 'middle' }}>
                      Is Lesson Concluded? {isLastAyah() && "(Auto-concluded for last ayah)"}
                    </span>
                  </Label>
                </FormGroup>
              </Col>
              <Col md={12} style={{ display: "none" }}>
                <FormGroup>
                  <Label>Homework Assigned</Label>
                  <Input
                    type="text"
                    name="homework_assigned"
                    value={modal.data?.homework_assigned || ""}
                    onChange={handleModalChange}
                    placeholder="Optional homework"
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Feedback</Label>
                  <Input
                    type="textarea"
                    name="feedback"
                    value={modal.data?.feedback || ""}
                    onChange={handleModalChange}
                    placeholder="Teacher feedback"
                    rows={3}
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Notes</Label>
                  <Input
                    type="textarea"
                    name="notes"
                    value={modal.data?.notes || ""}
                    onChange={handleModalChange}
                    placeholder="Additional notes"
                    rows={3}
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Save Lesson'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ToastContainer limit={1} closeButton={false} />
    </div>
  );
};

export default LessonsPage;
