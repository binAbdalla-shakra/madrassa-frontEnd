import { useState, useEffect } from "react";
import {
  Card, CardHeader, CardBody, CardFooter,
  Col, Container, Row,
  Form, Input, Label, Button, Table, Spinner, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, FormGroup
} from "reactstrap";
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { api as API_URL } from "../../../config";

const FeeTypes = () => {
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFeeType, setCurrentFeeType] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: 'tuition',
    description: '',
    amount: 0,
    isRecurring: false,
    frequency: null,
    isActive: true,
    appliesTo: 'active'
  });
const authUser = JSON.parse(sessionStorage.getItem("authUser"));
  // Fetch fee types and categories on component mount
  useEffect(() => {
    fetchFeeTypes();
    fetchCategories();
  }, []);

  const fetchFeeTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL.API_URL}/fee/fee-types`);
      const data = await response.json();
      if (data.success) {
        setFeeTypes(data.data);
      }
    } catch (error) {
      toast.error("Error fetching fee types: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL.API_URL}/fee/fee-types/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      toast.error("Error fetching categories: " + error.message);
    }
  };

  const toggleModal = () => {
    setModal(!modal);
    if (!modal) {
      setEditMode(false);
      setCurrentFeeType(null);
      setFormData({
        name: '',
        category: 'tuition',
        description: '',
        amount: 0,
        isRecurring: false,
        frequency: null,
        isActive: true,
        appliesTo: 'active'
      });
    }
  };

  const handleEdit = (feeType) => {
    setCurrentFeeType(feeType);
    setFormData({
      name: feeType.name,
      category: feeType.category,
      description: feeType.description || '',
      amount: feeType.amount,
      isRecurring: feeType.isRecurring,
      frequency: feeType.frequency || null,
      isActive: feeType.isActive,
      appliesTo: feeType.appliesTo || 'active'
    });
    setEditMode(true);
    setModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editMode 
        ? `${API_URL.API_URL}/fee/fee-types/${currentFeeType._id}`
        : `${API_URL.API_URL}/fee/fee-types`;
      
      const method = editMode ? 'PUT' : 'POST';


// Clone the form data
const dataToSend = { ...formData };

if (method === 'POST') {
  dataToSend.createdBy = authUser?.data?.user.username || "Admin";
} else if (method === 'PUT') {
  dataToSend.updatedBy = authUser?.data?.user.username || "Admin";
}

const response = await fetch(url, {
  method,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(dataToSend),
});


      const data = await response.json();

      if (data.success) {
        toast.success(editMode ? "Fee type updated successfully" : "Fee type created successfully");
        fetchFeeTypes();
        toggleModal();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this fee type?")) {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL.API_URL}/fee/fee-types/${id}/deactivate`, {
          method: 'PATCH'
        });
        const data = await response.json();
        if (data.success) {
          toast.success("Fee type deactivated successfully");
          fetchFeeTypes();
        }
      } catch (error) {
        toast.error("Error deactivating fee type: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Fee Types" pageTitle="Finance" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Fee Types</h5>
                <Button color="primary" onClick={toggleModal}>
                  <i className="ri-add-line align-bottom me-1"></i> Add Fee Type
                </Button>
              </CardHeader>
              <CardBody>
                {loading && !feeTypes.length ? (
                  <div className="text-center">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Recurring</th>
                          <th>Applies To</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeTypes.map((feeType, index) => (
                          <tr key={feeType._id}>
                            <td>{index + 1}</td>
                            <td>{feeType.name}</td>
                            <td>
                              <Badge color="info" className="text-capitalize">
                                {feeType.category}
                              </Badge>
                            </td>
                            <td>{feeType.amount.toFixed(2)}</td>
                            <td>
                              {feeType.isRecurring ? (
                                <Badge color="success">
                                  {feeType.frequency || 'Recurring'}
                                </Badge>
                              ) : (
                                <Badge color="secondary">One-time</Badge>
                              )}
                            </td>
                            <td className="text-capitalize">{feeType.appliesTo}</td>
                            <td>
                              <Badge color={feeType.isActive ? "success" : "danger"}>
                                {feeType.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td>
                              <div className="hstack gap-2">
                                <Button
                                  color="soft-primary"
                                  size="sm"
                                  onClick={() => handleEdit(feeType)}
                                >
                                  <i className="ri-pencil-line"></i>
                                </Button>
                                {feeType.isActive && (
                                  <Button
                                    color="soft-danger"
                                    size="sm"
                                    onClick={() => handleDeactivate(feeType._id)}
                                  >
                                    <i className="ri-close-line"></i>
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Add/Edit Modal */}
        <Modal isOpen={modal} toggle={toggleModal} centered>
          <ModalHeader toggle={toggleModal}>
            {editMode ? "Edit Fee Type" : "Add New Fee Type"}
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <div className="mb-3">
                <Label>Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <Label>Category</Label>
                <Input
                  type="select"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Input>
              </div>

              <div className="mb-3">
                <Label>Description</Label>
                <Input
                  type="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <Label>Amount</Label>
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="mb-3">
                <FormGroup check>
                  <Input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                    id="isRecurring"
                  />
                  <Label check for="isRecurring">
                    Recurring Fee
                  </Label>
                </FormGroup>
              </div>

              {formData.isRecurring && (
                <div className="mb-3">
                  <Label>Frequency</Label>
                  <Input
                    type="select"
                    name="frequency"
                    value={formData.frequency || ''}
                    onChange={handleChange}
                    required={formData.isRecurring}
                  >
                    <option value="">Select Frequency</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </Input>
                </div>
              )}

              <div className="mb-3">
                <Label>Applies To</Label>
                <Input
                  type="select"
                  name="appliesTo"
                  value={formData.appliesTo}
                  onChange={handleChange}
                >
                  <option value="all">All Students</option>
                  <option value="active">Active Students</option>
                  <option value="new">New Students</option>
                  <option value="graduating">Graduating Students</option>
                  <option value="specific">Specific Students</option>
                </Input>
              </div>

              {editMode && (
                <div className="mb-3">
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      id="isActive"
                    />
                    <Label check for="isActive">
                      Active
                    </Label>
                  </FormGroup>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="light" onClick={toggleModal}>
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={loading}>
                {loading ? (
                  <Spinner size="sm" />
                ) : editMode ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
        <ToastContainer/>
      </Container>
    </div>
  );
};

export default FeeTypes;