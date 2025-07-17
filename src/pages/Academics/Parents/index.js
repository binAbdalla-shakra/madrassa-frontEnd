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

const Parents = () => {
  // State management
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    status: '',
    discountType: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    gender: "",
    status: "Active",
    isDiscountPercent: false,
    discountAmount: 0,
    discountPercent: 0
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

  const discountTypeOptions = [
    { value: "", label: "All Types" },
    { value: "amount", label: "Amount" },
    { value: "percent", label: "Percent" }
  ];

  // Fetch parents with filters
  const fetchParents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.status) params.append('status', filters.status);
      if (filters.discountType) {
        params.append('isDiscountPercent', filters.discountType === 'percent');
      }

      const response = await fetch(`${api.API_URL}/parents?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch parents');
      
      setParents(data.data || []);
    } catch (error) {
      setError(error.message);
      toast.error(`Error loading parents: ${error.message}`);
    } finally {
      setLoading(false);
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
    const requiredFields = ['name', 'contactNumber', 'address', 'gender', 'status'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      toast.warning(`Please fill all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (formData.isDiscountPercent && (formData.discountPercent < 0 || formData.discountPercent > 100)) {
      toast.warning("Discount percent must be between 0 and 100");
      return false;
    }

    if (!formData.isDiscountPercent && formData.discountAmount < 0) {
      toast.warning("Discount amount cannot be negative");
      return false;
    }

    return true;
  };

  // Create new parent
  const createParent = async () => {
    if (!validateForm()) return;

    try {
      const authUser = JSON.parse(sessionStorage.getItem("authUser"));
      const parentData = {
        ...formData,
        madrassaId: authUser?.data?.user?.madrassaId,
        CreatedBy: authUser?.data?.user?.username || "Admin"
      };

      const response = await fetch(`${api.API_URL}/parents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parentData)
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to create parent');

      toast.success("Parent created successfully");
      fetchParents();
      setModal(false);
    } catch (error) {
      toast.error(`Error creating parent: ${error.message}`);
    }
  };

  // Update parent
  const updateParent = async () => {
    if (!validateForm() || !selectedParent) return;

    try {
      const authUser = JSON.parse(sessionStorage.getItem("authUser"));
      const parentData = {
        ...formData,
        _id: selectedParent._id,
        madrassaId: authUser?.data?.user?.madrassaId,
        ModifiedBy: authUser?.data?.user?.username || "Admin",
        ModifiedDate: new Date().toISOString()
      };

      const response = await fetch(`${api.API_URL}/parents/${selectedParent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parentData)
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to update parent');

      toast.success("Parent updated successfully");
      fetchParents();
      setModal(false);
    } catch (error) {
      toast.error(`Error updating parent: ${error.message}`);
    }
  };

  // Delete parent
  const deleteParent = async () => {
    if (!selectedParent) return;

    try {
      const response = await fetch(`${api.API_URL}/parents/${selectedParent._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to delete parent');

      toast.success("Parent deleted successfully");
      setDeleteModal(false);
      fetchParents();
    } catch (error) {
      toast.error(`Error deleting parent: ${error.message}`);
    }
  };

  // Open modal for edit
  const handleEdit = (parent) => {
    setSelectedParent(parent);
    setFormData({
      name: parent.name,
      email: parent.email || "",
      contactNumber: parent.contactNumber,
      address: parent.address,
      gender: parent.gender,
      status: parent.status,
      isDiscountPercent: parent.isDiscountPercent || false,
      discountAmount: parent.discountAmount || 0,
      discountPercent: parent.discountPercent || 0
    });
    setIsEdit(true);
    setModal(true);
  };

  // Open modal for create
  const handleCreate = () => {
    setSelectedParent(null);
    setFormData({
      name: "",
      email: "",
      contactNumber: "",
      address: "",
      gender: "",
      status: "Active",
      isDiscountPercent: false,
      discountAmount: 0,
      discountPercent: 0
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
      name: 'Contact',
      selector: row => row.contactNumber,
      sortable: true
    },
    {
      name: 'Email',
      selector: row => row.email || '-',
      sortable: true
    },
    {
      name: 'Gender',
      selector: row => row.gender,
      sortable: true
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
      name: 'Discount',
      cell: row => (
        <span>
          {row.isDiscountPercent 
            ? `${row.discountPercent}%` 
            : `$${row.discountAmount}`}
        </span>
      )
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
          <Button color="soft-primary" size="sm" onClick={() => handleEdit(row)}>
            <i className="ri-pencil-line" />
          </Button>
          <Button color="soft-danger" size="sm" onClick={() => {
            setSelectedParent(row);
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
    fetchParents();
  }, [filters]);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Parents" pageTitle="Academics" />
        
        {/* Filter Controls */}
        <Card className="mb-3">
          <CardBody>
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label>Search</Label>
                  <Input
                    type="text"
                    name="search"
                    placeholder="Search by name, email or phone"
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
              <Col md={2}>
                <FormGroup>
                  <Label>Discount Type</Label>
                  <Select
                    options={discountTypeOptions}
                    value={discountTypeOptions.find(opt => opt.value === filters.discountType)}
                    onChange={(opt) => handleSelectFilterChange('discountType', opt)}
                    isClearable
                  />
                </FormGroup>
              </Col>
              <Col md={2} className="d-flex align-items-end mb-3">
                <Button color="primary" onClick={fetchParents} disabled={loading}>
                  {loading ? 'Filtering...' : 'Apply Filters'}
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Parent List</h5>
            <Button color="primary" onClick={handleCreate}>
              <i className="ri-add-line me-1" /> Add Parent
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
                data={parents}
                pagination
                highlightOnHover
                responsive
                noDataComponent="No parents found matching your criteria"
              />
            )}
          </CardBody>
        </Card>
      </Container>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg">
        <ModalHeader toggle={() => setModal(false)}>
          {isEdit ? 'Edit Parent' : 'Add New Parent'}
        </ModalHeader>
        <Form onSubmit={(e) => {
          e.preventDefault();
          isEdit ? updateParent() : createParent();
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
                  <Label>Status <span className="text-danger">*</span></Label>
                  <Select
                    options={statusOptions.filter(opt => opt.value)}
                    value={statusOptions.find(opt => opt.value === formData.status)}
                    onChange={(opt) => handleSelectChange('status', opt)}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    name="isDiscountPercent"
                    checked={formData.isDiscountPercent}
                    onChange={handleInputChange}
                    id="isDiscountPercent"
                  />
                  <Label for="isDiscountPercent" check>
                    Percentage Discount (unchecked for fixed amount)
                  </Label>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    {formData.isDiscountPercent ? 'Discount Percentage' : 'Discount Amount'}
                  </Label>
                  <Input
                    type="number"
                    name={formData.isDiscountPercent ? 'discountPercent' : 'discountAmount'}
                    value={formData.isDiscountPercent ? formData.discountPercent : formData.discountAmount}
                    onChange={handleInputChange}
                    min={0}
                    max={formData.isDiscountPercent ? 100 : undefined}
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
        onDeleteClick={deleteParent}
        onCloseClick={() => setDeleteModal(false)}
      />

      <ToastContainer />
    </div>
  );
};

export default Parents;