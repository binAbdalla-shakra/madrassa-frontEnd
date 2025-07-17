import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Select from "react-select";
import {
  Card, CardHeader, CardBody,
  Col, Container, Row,
  Form, Input, Label, FormGroup,
  Modal, ModalBody, ModalFooter, ModalHeader,
  Button, Badge
} from "reactstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import DeleteModal from "../../../Components/Common/DeleteModal";
import Loader from "../../../Components/Common/Loader";
import { api } from "../../../config";

const Students = () => {
  // State management
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    status: '',
    parent: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    birthdate: "",
    address: "",
    gender: "",
    parent: "",
    isActive: true
  });

  // Options for selects
  const genderOptions = [
    { value: "", label: "All Genders" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" }
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "true", label: "Active" },  // Changed to string "true"
    { value: "false", label: "Inactive" } // Changed to string "false"
  ];

  // Fetch students with filters
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.status) params.append('isActive', filters.status);
      if (filters.parent) params.append('parent', filters.parent);

      const response = await fetch(`${api.API_URL}/students?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch students');
      
      setStudents(data.data || []);
    } catch (error) {
      setError(error.message);
      toast.error(`Error loading students: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch parents
  const fetchParents = async () => {
    try {
      const response = await fetch(`${api.API_URL}/parents`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch parents');
      
      setParents(data.data || []);
    } catch (error) {
      toast.error(`Error loading parents: ${error.message}`);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedOption?.value || ""
    }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle select filter changes
  const handleSelectFilterChange = (name, selectedOption) => {
    setFilters(prev => ({
      ...prev,
      [name]: selectedOption?.value || ""
    }));
  };

  // Validate form
  const validateForm = () => {
    const requiredFields = ['name', 'birthdate', 'address', 'gender', 'parent'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      toast.warning(`Please fill all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    return true;
  };

  // Create new student
  const createStudent = async () => {
    if (!validateForm()) return;

    try {
      const authUser = JSON.parse(sessionStorage.getItem("authUser"));
      const studentData = {
        ...formData,
        isActive: formData.isActive === "true", // Convert string to boolean
        madrassaId: authUser?.data?.user?.madrassaId,
        createdBy: authUser?.data?.user?.username || "Admin"
      };

      const response = await fetch(`${api.API_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData)
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to create student');

      toast.success("Student created successfully");
      fetchStudents();
      setModal(false);
    } catch (error) {
      toast.error(`Error creating student: ${error.message}`);
    }
  };

  // Update student
  const updateStudent = async () => {
    if (!validateForm() || !selectedStudent) return;

    try {
      const authUser = JSON.parse(sessionStorage.getItem("authUser"));
      const studentData = {
        ...formData,
        isActive: formData.isActive === "true", // Convert string to boolean
        _id: selectedStudent._id,
        madrassaId: authUser?.data?.user?.madrassaId,
        modifiedBy: authUser?.data?.user?.username || "Admin",
        modifiedDate: new Date().toISOString()
      };

      const response = await fetch(`${api.API_URL}/students/${selectedStudent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData)
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to update student');

      toast.success("Student updated successfully");
      fetchStudents();
      setModal(false);
    } catch (error) {
      toast.error(`Error updating student: ${error.message}`);
    }
  };

  // Delete student
  const deleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      const response = await fetch(`${api.API_URL}/students/${selectedStudent._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to delete student');

      toast.success("Student deleted successfully");
      setDeleteModal(false);
      fetchStudents();
    } catch (error) {
      toast.error(`Error deleting student: ${error.message}`);
    }
  };

  // Open modal for edit
  const handleEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      birthdate: student.birthdate ? new Date(student.birthdate).toISOString().split('T')[0] : "",
      address: student.address,
      gender: student.gender,
      parent: student.parent?._id || "",
      isActive: student.isActive ? "true" : "false" // Convert boolean to string
    });
    setIsEdit(true);
    setModal(true);
  };

  // Open modal for create
  const handleCreate = () => {
    setSelectedStudent(null);
    setFormData({
      name: "",
      birthdate: "",
      address: "",
      gender: "",
      parent: "",
      isActive: "true" // Default to active as string
    });
    setIsEdit(false);
    setModal(true);
  };

  // Table columns
  const columns = [
    {
      name: '#',
      cell: (row, index) => index + 1,
      width: '60px'
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true
    },
    {
      name: 'Gender',
      selector: row => row.gender,
      sortable: true
    },
    {
      name: 'Parent',
      selector: row => row.parent?.name || '-',
      sortable: true
    },
    {
      name: 'Parent Contact',
      selector: row => row.parent?.contactNumber || '-',
      sortable: true
    },
    {
      name: 'Address',
      selector: row => row.address,
      sortable: true
    },
    {
      name: 'Birthdate',
      selector: row => new Date(row.birthdate).toISOString().split('T')[0],
      sortable: true
    },
    {
      name: 'AdmissionDate',
      selector: row => new Date(row.admissionDate).toISOString().split('T')[0],
      sortable: true
    },
    {
      name: 'Status',
      cell: row => (
        <Badge color={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
      sortable: true
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
          <Button color="soft-primary" size="sm" onClick={() => handleEdit(row)}>
            <i className="ri-pencil-line" />
          </Button>
          <Button color="soft-danger" size="sm" onClick={() => {
            setSelectedStudent(row);
            setDeleteModal(true);
          }}>
            <i className="ri-delete-bin-line" />
          </Button>
        </div>
      ),
      width: '120px'
    }
  ];

  // Initial data load
  useEffect(() => {
    fetchStudents();
    fetchParents();
  }, [filters]);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Students" pageTitle="Academics" />
        
        {/* Filter Controls */}
        <Card className="mb-3">
          <CardBody>
            <Row>
              <Col md={3}>
                <FormGroup>
                  <Label>Search</Label>
                  <Input
                    type="text"
                    name="search"
                    placeholder="Search by name, parent, etc."
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label>Gender</Label>
                  <Select
                    options={genderOptions}
                    value={genderOptions.find(opt => opt.value === filters.gender)}
                    onChange={(opt) => handleSelectFilterChange('gender', opt)}
                    isClearable
                  />
                </FormGroup>
              </Col>
              <Col md={2}>
                <FormGroup>
                  <Label>Status</Label>
                  <Select
                    options={statusOptions}
                    value={statusOptions.find(opt => opt.value === filters.status)}
                    onChange={(opt) => handleSelectFilterChange('status', opt)}
                    isClearable
                  />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label>Parent</Label>
                  <Select
                    options={[
                      { value: "", label: "All Parents" },
                      ...parents.map(parent => ({
                        value: parent._id,
                        label: parent.name
                      }))
                    ]}
                    value={parents.find(p => p._id === filters.parent) ? 
                      { value: filters.parent, label: parents.find(p => p._id === filters.parent)?.name } : 
                      null
                    }
                    onChange={(opt) => handleSelectFilterChange('parent', opt)}
                    isClearable
                  />
                </FormGroup>
              </Col>
              <Col md={2} className="d-flex align-items-end mb-3">
                <Button color="primary" onClick={fetchStudents} disabled={loading}>
                  {loading ? 'Filtering...' : 'Apply Filters'}
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Student List</h5>
            <Button color="primary" onClick={handleCreate}>
              <i className="ri-add-line me-1" /> Add Student
            </Button>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Loader />
            ) : error ? (
              <div className="text-danger">{error}</div>
            ) : (
              <DataTable
                columns={columns}
                data={students}
                pagination
                highlightOnHover
                responsive
                noDataComponent="No students found matching your criteria"
              />
            )}
          </CardBody>
        </Card>
      </Container>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg">
        <ModalHeader toggle={() => setModal(false)}>
          {isEdit ? 'Edit Student' : 'Add New Student'}
        </ModalHeader>
        <Form onSubmit={(e) => {
          e.preventDefault();
          isEdit ? updateStudent() : createStudent();
        }}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Name <span className="text-danger">*</span></Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Birthdate <span className="text-danger">*</span></Label>
                  <Input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Address <span className="text-danger">*</span></Label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Gender <span className="text-danger">*</span></Label>
                  <Select
                    options={genderOptions.filter(opt => opt.value)}
                    value={genderOptions.find(opt => opt.value === formData.gender)}
                    onChange={(opt) => handleSelectChange('gender', opt)}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Parent <span className="text-danger">*</span></Label>
                  <Select
                    options={parents.map(parent => ({
                      value: parent._id,
                      label: parent.name
                    }))}
                    value={parents.find(p => p._id === formData.parent) ? 
                      { value: formData.parent, label: parents.find(p => p._id === formData.parent)?.name } : 
                      null
                    }
                    onChange={(opt) => handleSelectChange('parent', opt)}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Status <span className="text-danger">*</span></Label>
                  <Select
                    options={statusOptions.filter(opt => opt.value !== "")}
                    value={statusOptions.find(opt => opt.value === formData.isActive)}
                    onChange={(opt) => handleSelectChange('isActive', opt)}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={deleteStudent}
        onCloseClick={() => setDeleteModal(false)}
      />

      <ToastContainer />
    </div>
  );
};

export default Students;