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

const Teachers = () => {
  // State management
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    status: '',
    specialization: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    gender: "",
    specialization: "",
    status: "Active",
    shift: "FullTime", // Default value
  baseSalary: 0

  });

  // Options for selects
  const genderOptions = [
    { value: "", label: "All Genders" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" }
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" }
  ];

const shiftOptions = [
  { value: "Morning", label: "Morning" },
  { value: "Afternoon", label: "Afternoon" },
  { value: "FullTime", label: "Full time (All day)" }
];


  // Fetch teachers with filters
  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.status) params.append('status', filters.status);
      if (filters.specialization) params.append('specialization', filters.specialization);

      const response = await fetch(`${api.API_URL}/teachers?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch teachers');
      
      setTeachers(data.data || []);
    } catch (error) {
      setError(error.message);
      toast.error(`Error loading teachers: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
  const requiredFields = ['name', 'contactNumber', 'address', 'gender', 'status', 'shift', 'baseSalary'];
  const missingFields = requiredFields.filter(field => !formData[field]);

  if (missingFields.length > 0) {
    toast.warning(`Please fill all required fields: ${missingFields.join(', ')}`);
    return false;
  }

  if (isNaN(formData.baseSalary)) {
    toast.warning('Base salary must be a valid number');
    return false;
  }

  return true;
};

  // Create new teacher
  const createTeacher = async () => {
    if (!validateForm()) return;

    try {
      const authUser = JSON.parse(sessionStorage.getItem("authUser"));
      const teacherData = {
        ...formData,
        madrassaId: authUser?.data?.user?.madrassaId,
        createdBy: authUser?.data?.user?.username || "Admin"
      };

      const response = await fetch(`${api.API_URL}/teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData)
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to create teacher');

      toast.success("Teacher created successfully");
      fetchTeachers();
      setModal(false);
    } catch (error) {
      toast.error(`Error creating teacher: ${error.message}`);
    }
  };

  // Update teacher
  const updateTeacher = async () => {
    if (!validateForm() || !selectedTeacher) return;

    try {
      const authUser = JSON.parse(sessionStorage.getItem("authUser"));
      const teacherData = {
        ...formData,
        _id: selectedTeacher._id,
        madrassaId: authUser?.data?.user?.madrassaId,
        modifiedBy: authUser?.data?.user?.username || "Admin",
        modifiedDate: new Date().toISOString()
      };

      const response = await fetch(`${api.API_URL}/teachers/${selectedTeacher._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData)
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to update teacher');

      toast.success("Teacher updated successfully");
      fetchTeachers();
      setModal(false);
    } catch (error) {
      toast.error(`Error updating teacher: ${error.message}`);
    }
  };

  // Delete teacher
  const deleteTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      const response = await fetch(`${api.API_URL}/teachers/${selectedTeacher._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to delete teacher');

      toast.success("Teacher deleted successfully");
      setDeleteModal(false);
      fetchTeachers();
    } catch (error) {
      toast.error(`Error deleting teacher: ${error.message}`);
    }
  };

  // Open modal for edit
const handleEdit = (teacher) => {
  setSelectedTeacher(teacher);
  setFormData({
    name: teacher.name,
    email: teacher.email || "",
    contactNumber: teacher.contactNumber,
    address: teacher.address,
    gender: teacher.gender,
    specialization: teacher.specialization || "",
    status: teacher.status || "Active",
    shift: teacher.shift || "FullTime",
    baseSalary: teacher.baseSalary || 0
  });
  setIsEdit(true);
  setModal(true);
};

  // Open modal for create
  const handleCreate = () => {
    setSelectedTeacher(null);
    setFormData({
      name: "",
      email: "",
      contactNumber: "",
      address: "",
      gender: "",
      specialization: "",
      status: "Active",
      shift: "FullTime", // Default value
  baseSalary: 0

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
      name: 'Email',
      selector: row => row.email || '-',
      sortable: true
    },
    {
      name: 'Contact',
      selector: row => row.contactNumber,
      sortable: true
    },
    {
      name: 'Gender',
      selector: row => row.gender,
      sortable: true
    },
    {
      name: 'Specialization',
      selector: row => row.specialization || '-',
      sortable: true
    },
    // Add these new columns to the columns array
{
  name: 'Shift',
  selector: row => row.shift,
  sortable: true
},
{
  name: 'Base Salary',
  selector: row => `$${row.baseSalary?.toLocaleString()||'0.00'}`,
  sortable: true,
  right: true
},
    {
      name: 'Status',
      cell: row => (
        <Badge color={row.status === 'Active' ? 'success' : 'danger'}>
          {row.status}
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
            setSelectedTeacher(row);
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
    fetchTeachers();
  }, [filters]);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Teachers" pageTitle="Academics" />
        
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
                    placeholder="Search by name, email, etc."
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
                  <Label>Specialization</Label>
                  <Input
                    type="text"
                    name="specialization"
                    placeholder="Filter by specialization"
                    value={filters.specialization}
                    onChange={handleFilterChange}
                  />
                </FormGroup>
              </Col>
              <Col md={2} className="d-flex align-items-end mb-3">
                <Button color="primary" className="btn btn-primary" onClick={fetchTeachers} disabled={loading}> <i className="ri-filter-line"></i>


                  {loading ? 'Filtering...' : 'Apply Filters'}
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Teacher List</h5>
            <Button color="primary" onClick={handleCreate}>
              <i className="ri-add-line me-1" /> Add Teacher
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
                data={teachers}
                pagination
                highlightOnHover
                responsive
                noDataComponent="No teachers found matching your criteria"
              />
            )}
          </CardBody>
        </Card>
      </Container>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg">
        <ModalHeader toggle={() => setModal(false)}>
          {isEdit ? 'Edit Teacher' : 'Add New Teacher'}
        </ModalHeader>
        <Form onSubmit={(e) => {
          e.preventDefault();
          isEdit ? updateTeacher() : createTeacher();
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
                  <Label>Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Contact Number <span className="text-danger">*</span></Label>
                  <Input
                    name="contactNumber"
                    value={formData.contactNumber}
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
                  <Label>Specialization</Label>
                  <Input
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
              {/* Add these new form groups inside the ModalBody, after the status field */}
<Col md={6}>
  <FormGroup>
    <Label>Shift <span className="text-danger">*</span></Label>
    <Select
      options={shiftOptions}
      value={shiftOptions.find(opt => opt.value === formData.shift)}
      onChange={(opt) => handleSelectChange('shift', opt)}
      required
    />
  </FormGroup>
</Col>
<Col md={6}>
  <FormGroup>
    <Label>Base Salary <span className="text-danger">*</span></Label>
    <Input
      type="number"
      name="baseSalary"
      value={formData.baseSalary}
      onChange={handleInputChange}
      required
      min="0"
    />
  </FormGroup>
</Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Status <span className="text-danger">*</span></Label>
                  <Select
                    options={statusOptions.filter(opt => opt.value !== "")}
                    value={statusOptions.find(opt => opt.value === formData.status)}
                    onChange={(opt) => handleSelectChange('status', opt)}
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
        onDeleteClick={deleteTeacher}
        onCloseClick={() => setDeleteModal(false)}
      />

      <ToastContainer />
    </div>
  );
};

export default Teachers;