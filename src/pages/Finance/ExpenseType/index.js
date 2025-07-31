import { useState, useEffect } from "react";
import {
  Card, CardHeader, CardBody,
  Col, Container, Row,
  Form, Input, Label, Button, Table, Spinner, Badge, Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api as API_URL } from "../../../config";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

const ExpenseTypesPage = () => {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' or 'edit'
    data: null
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch expense types
  const fetchExpenseTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL.API_URL}/expense-types?activeOnly=false`);
      const data = await response.json();
      if (data.success) {
        setExpenseTypes(data.data);
      }
    } catch (error) {
      toast.error("Error loading expense types: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error when field changes
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (formData.name.length > 50) errors.name = 'Name must be less than 50 characters';
    if (formData.description.length > 200) errors.description = 'Description must be less than 200 characters';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const url = modal.mode === 'create'
        ? `${API_URL.API_URL}/expense-types`
        : `${API_URL.API_URL}/expense-types/${modal.data._id}`;

      const method = modal.mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Expense type ${modal.mode === 'create' ? 'created' : 'updated'} successfully`);
        setModal({ isOpen: false, mode: 'create', data: null });
        fetchExpenseTypes();
      } else {
        toast.error(data.message || `Failed to ${modal.mode === 'create' ? 'create' : 'update'} expense type`);
      }
    } catch (error) {
      toast.error(`Error ${modal.mode === 'create' ? 'creating' : 'updating'} expense type: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Open modal for creating new expense type
  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
    setModal({
      isOpen: true,
      mode: 'create',
      data: null
    });
  };

  // Open modal for editing expense type
  const openEditModal = (expenseType) => {
    setFormData({
      name: expenseType.name,
      description: expenseType.description,
      isActive: expenseType.isActive
    });
    setModal({
      isOpen: true,
      mode: 'edit',
      data: expenseType
    });
  };


  // Delete expense type
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense type?')) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL.API_URL}/expense-types/${id._id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Expense type deleted successfully');
          fetchExpenseTypes();
        } else {
          toast.error(data.message || 'Failed to delete expense type');
        }
      } catch (error) {
        toast.error('Error deleting expense type: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Initial data load
  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Expense Types" pageTitle="Finance" />

        <Row className="justify-content-center">
          <Col lg={12}>
            <Card className="default-card-wrapper">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Expense Types</h5>
                <Button
                  color="primary"
                  className="rounded-pill px-4"
                  onClick={openCreateModal}
                >
                  <i className="ri-add-line me-1"></i> Add New
                </Button>
              </CardHeader>

              <CardBody>
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenseTypes.length > 0 ? (
                        expenseTypes.map((type, index) => (
                          <tr key={type._id}>
                            <td>{index + 1}</td>
                            <td>{type.name}</td>
                            <td>{type.description || '-'}</td>
                            <td>
                              <Badge color={type.isActive ? "success" : "danger"}>
                                {type.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td>



                              <div className="hstack gap-2">
                                <button
                                  className="btn btn-sm btn-soft-primary"
                                  onClick={() => openEditModal(type)}
                                >
                                  <i className="ri-pencil-fill"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-soft-danger"
                                  onClick={() => handleDelete(type)}
                                >
                                  <i className="ri-delete-bin-5-fill"></i>
                                </button>
                              </div>


                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            {isLoading ? (
                              <Spinner color="primary" />
                            ) : (
                              "No expense types found"
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Create/Edit Modal */}
      <Modal isOpen={modal.isOpen} toggle={() => setModal(prev => ({ ...prev, isOpen: false }))}>
        <ModalHeader toggle={() => setModal(prev => ({ ...prev, isOpen: false }))}>
          {modal.mode === 'create' ? 'Create New' : 'Edit'} Expense Type
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="mb-3">
              <Label>Name *</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                invalid={!!validationErrors.name}
                placeholder="Enter expense type name"
              />
              {validationErrors.name && (
                <div className="text-danger small mt-1">{validationErrors.name}</div>
              )}
            </div>

            <div className="mb-3">
              <Label>Description</Label>
              <Input
                type="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                invalid={!!validationErrors.description}
                placeholder="Enter description (optional)"
                rows={3}
              />
              {validationErrors.description && (
                <div className="text-danger small mt-1">{validationErrors.description}</div>
              )}
            </div>

            <div className="mb-3">
              <div className="form-check">
                <Input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="form-check-input"
                />
                <Label for="isActive" className="form-check-label">Active</Label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : modal.mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ToastContainer limit={1} closeButton={false} />
    </div>
  );
};

export default ExpenseTypesPage;