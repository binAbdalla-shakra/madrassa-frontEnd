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

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  const [uploadModal, setUploadModal] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const downloadSampleExcel = () => {
    const sampleData = [
      {
        name: "Student 1",
        gender: "Male",
        birthdate: "2010-05-15",
        address: "123 Main St",
        parentContactNumber: "+252615960707",
        // registrationNumber: "REG001",
        monthlyFee: 20,
        isActive: "true"
      },
      {
        name: "Student 2",
        gender: "Female",
        birthdate: "2011-08-22",
        address: "456 Oak Ave",
        parentContactNumber: "+252615960707",
        // registrationNumber: "REG002",
        monthlyFee: 20,
        isActive: "true"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, "students_sample.xlsx");
  };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setExcelData(jsonData);
      setPreviewData(jsonData); // Show first 5 rows for preview
    };

    reader.readAsArrayBuffer(file);
  };

  const handleBulkUpload = async () => {
    if (excelData.length === 0) {
      toast.warning("No data to upload");
      return;
    }

    try {
      setUploadProgress(0);
      const authUser = JSON.parse(sessionStorage.getItem("authUser"));
      const madrassaId = authUser?.data?.user?.madrassaId;
      const createdBy = authUser?.data?.user?.username || "Admin";

      // Process in chunks for better performance
      const chunkSize = 10;
      const totalChunks = Math.ceil(excelData.length / chunkSize);
      let successfulUploads = 0;

      for (let i = 0; i < excelData.length; i += chunkSize) {
        const chunk = excelData.slice(i, i + chunkSize);

        const response = await fetch(`${api.API_URL}/students/bulk-import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentsData: chunk,
            madrassaId,
            createdBy
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to upload chunk ${i / chunkSize + 1}`);
        }

        successfulUploads += chunk.length;
        setUploadProgress(Math.round(((i + chunkSize) / excelData.length) * 100));
      }

      toast.success(`Successfully uploaded students`);
      setUploadModal(false);
      fetchStudents(); // Refresh the student list
    } catch (error) {
      toast.error(`Error during bulk upload: ${error.message}`);
    } finally {
      setUploadProgress(0);
    }
  };


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
            <div>
              <Button color="secondary" className="me-2" onClick={downloadSampleExcel}>
                <i className="ri-download-line me-1" /> Download Sample
              </Button>
              <Button color="info" className="me-2" onClick={() => {
                setUploadModal(true);
                setExcelData([]);       // Clear any previously loaded Excel data
                setPreviewData([]);     // Clear the preview data
                setUploadProgress(0);   // Reset progress

              }}>
                <i className="ri-upload-line me-1" /> Upload Students
              </Button>
              <Button color="primary" onClick={handleCreate}>
                <i className="ri-add-line me-1" /> Add Student
              </Button>
            </div>
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

      // Add this modal component (with your other modals)
      <Modal isOpen={uploadModal} toggle={() => setUploadModal(false)} size="xl">
        <ModalHeader toggle={() => setUploadModal(false)}>
          Upload Students from Excel
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Select Excel File</Label>
            <Input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
            />
            <small className="text-muted">
              File should match the sample format. Max 1000 rows.
            </small>
          </FormGroup>

          {previewData.length > 0 && (
            <>
              <h5 className="mt-4">Preview (First 5 Rows)</h5>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      {Object.keys(previewData[0]).map(key => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j}>{val?.toString() || ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3">
                <strong>Total Rows to Import:</strong> {excelData.length}
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {uploadProgress > 0 && (
            <div className="progress w-100 mb-3">
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${uploadProgress}%` }}
                aria-valuenow={uploadProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {uploadProgress}%
              </div>
            </div>
          )}
          <Button color="light" onClick={() => setUploadModal(false)}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleBulkUpload}
            disabled={excelData.length === 0 || uploadProgress > 0}
          >
            {uploadProgress > 0 ? 'Uploading...' : 'Upload Students'}
          </Button>
        </ModalFooter>
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