import { useState, useEffect } from "react";
import {
  Card, CardHeader, CardBody, CardFooter,
  Col, Container, Row,
  Form, Input, Label, Button, Table, Spinner, Badge, Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import moment from 'moment';
import { api as API_URL } from "../../../config";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

const ExpensesPage = () => {
  // State management
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' or 'edit'
    data: null
  });
  const [filters, setFilters] = useState({
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().endOf('month').format('YYYY-MM-DD'),
    expenseType: '',
    paymentMethod: ''
  });
  const [formData, setFormData] = useState({
    expenseType: '',
    amount: '',
    description: '',
    date: moment().format('YYYY-MM-DD'),
    paidTo: '',
    paymentMethod: 'cash',
    approvedBy: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Payment method options
  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'wallet', label: 'wallet' },
    { value: 'bank', label: 'Bank Transfer' }
  ];

  // Fetch all necessary data
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch expense types
      const typesResponse = await fetch(`${API_URL.API_URL}/expense-types?activeOnly=true`);
      const typesData = await typesResponse.json();
      if (typesData.success) {
        setExpenseTypes(typesData.data.map(type => ({
          value: type._id,
          label: type.name
        })));
      }

      // Fetch staff members (for approvers)
    //   const staffResponse = await fetch(`${API_URL.API_URL}/staff`);
    //   const staffData = await staffResponse.json();
    //   if (staffData.success) {
    //     setStaffMembers(staffData.data.map(staff => ({
    //       value: staff._id,
    //       label: staff.name
    //     })));
    //   }

      // Fetch expenses
      await fetchExpenses();
    } catch (error) {
      toast.error("Error loading initial data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch expenses with filters
  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      let url = `${API_URL.API_URL}/expenses?startDate=${filters.startDate}&endDate=${filters.endDate}`;
      if (filters.expenseType) url += `&expenseType=${filters.expenseType}`;
      if (filters.paymentMethod) url += `&paymentMethod=${filters.paymentMethod}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setExpenses(data.data);
      }
    } catch (error) {
      toast.error("Error loading expenses: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle form input changes
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

  // Handle select changes
  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : ''
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.expenseType) errors.expenseType = 'Expense type is required';
    if (!formData.amount || isNaN(formData.amount)) errors.amount = 'Valid amount is required';
    if (parseFloat(formData.amount) <= 0) errors.amount = 'Amount must be greater than 0';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.paymentMethod) errors.paymentMethod = 'Payment method is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const url = modal.mode === 'create' 
        ? `${API_URL.API_URL}/expenses` 
        : `${API_URL.API_URL}/expenses/${modal.data._id}`;
      
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
        toast.success(`Expense ${modal.mode === 'create' ? 'created' : 'updated'} successfully`);
        setModal({ isOpen: false, mode: 'create', data: null });
        fetchExpenses();
      } else {
        toast.error(data.message || `Failed to ${modal.mode === 'create' ? 'create' : 'update'} expense`);
      }
    } catch (error) {
      toast.error(`Error ${modal.mode === 'create' ? 'creating' : 'updating'} expense: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Open modal for creating new expense
  const openCreateModal = () => {
    setFormData({
      expenseType: '',
      amount: '',
      description: '',
      date: moment().format('YYYY-MM-DD'),
      paidTo: '',
      paymentMethod: 'cash',
      approvedBy: ''
    });
    setModal({
      isOpen: true,
      mode: 'create',
      data: null
    });
  };

  // Open modal for editing expense
  const openEditModal = (expense) => {
    setFormData({
      expenseType: expense.expenseType._id,
      amount: expense.amount,
      description: expense.description,
      date: moment(expense.date).format('YYYY-MM-DD'),
      paidTo: expense.paidTo,
      paymentMethod: expense.paymentMethod,
      approvedBy: expense.approvedBy?._id || ''
    });
    setModal({
      isOpen: true,
      mode: 'edit',
      data: expense
    });
  };

  // Delete expense
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL.API_URL}/expenses/${id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Expense deleted successfully');
          fetchExpenses();
        } else {
          toast.error(data.message || 'Failed to delete expense');
        }
      } catch (error) {
        toast.error('Error deleting expense: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Calculate total amount
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Initial data load
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch expenses when filters change
  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Expense Management" pageTitle="Finance" />
        
        <Row className="justify-content-center">
          <Col lg={12}>
            <Card className="default-card-wrapper">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Expenses</h5>
                <Button 
                  color="primary" 
                  className="rounded-pill px-4"
                  onClick={openCreateModal}
                >
                  <i className="ri-add-line me-1"></i> Add New Expense
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
                  <Col md={3}>
                    <Label>Expense Type</Label>
                    <Select
                      options={expenseTypes}
                      value={expenseTypes.find(opt => opt.value === filters.expenseType)}
                      onChange={(opt) => setFilters(prev => ({ ...prev, expenseType: opt?.value || '' }))}
                      isClearable
                      placeholder="All types"
                    />
                  </Col>
                  <Col md={3}>
                    <Label>Payment Method</Label>
                    <Select
                      options={paymentMethods}
                      value={paymentMethods.find(opt => opt.value === filters.paymentMethod)}
                      onChange={(opt) => setFilters(prev => ({ ...prev, paymentMethod: opt?.value || '' }))}
                      isClearable
                      placeholder="All methods"
                    />
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button 
                      color="primary" 
                      className="rounded-pill px-4"
                      onClick={fetchExpenses}
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
                        <th>#</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Paid To</th>
                        <th>Payment Method</th>
                        <th>Approved By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.length > 0 ? (
                        expenses.map((expense, index) => (
                          <tr key={expense._id}>
                            <td>{index + 1}</td>
                            <td>{moment(expense.date).format('DD MMM YYYY')}</td>
                            <td>{expense.expenseType?.name || 'N/A'}</td>
                            <td>{expense.description || '-'}</td>
                            <td>{expense.amount.toFixed(2)}</td>
                            <td>{expense.paidTo || '-'}</td>
                            <td>
                              <Badge color="info" className="text-capitalize">
                                {expense.paymentMethod.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td>{expense.approvedBy?.name || '-'}</td>
                            <td>


 <div className="hstack gap-2">
        <button
          className="btn btn-sm btn-soft-primary"
          onClick={() => openEditModal(expense)}
        >
          <i className="ri-pencil-fill"></i>
        </button>
        <button
          className="btn btn-sm btn-soft-danger"
          onClick={() => handleDelete(expense._id)}
        >
          <i className="ri-delete-bin-5-fill"></i>
        </button>
      </div>



                              {/* <Button 
                                color="light" 
                                size="sm"
                                className="me-2"
                                onClick={() => openEditModal(expense)}
                              >
                                <i className="ri-pencil-line"></i> Edit
                              </Button>
                              <Button 
                                color="danger" 
                                size="sm"
                                onClick={() => handleDelete(expense._id)}
                              >
                                <i className="ri-delete-bin-line"></i> Delete
                              </Button> */}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-4">
                            {isLoading ? (
                              <Spinner color="primary" />
                            ) : (
                              "No expenses found for the selected filters"
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
                  Showing {expenses.length} expenses
                </div>
                <div className="fw-bold">
                  Total: {totalAmount.toFixed(2)}
                </div>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </Container>
      
      {/* Create/Edit Expense Modal */}
      <Modal isOpen={modal.isOpen} toggle={() => setModal(prev => ({ ...prev, isOpen: false }))} size="lg">
        <ModalHeader toggle={() => setModal(prev => ({ ...prev, isOpen: false }))}>
          {modal.mode === 'create' ? 'Create New' : 'Edit'} Expense
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Row>
              <Col md={6} className="mb-3">
                <Label>Expense Type *</Label>
                <Select
                  options={expenseTypes}
                  value={expenseTypes.find(opt => opt.value === formData.expenseType)}
                  onChange={(opt) => handleSelectChange('expenseType', opt)}
                  isClearable
                  placeholder="Select expense type"
                />
                {validationErrors.expenseType && (
                  <div className="text-danger small mt-1">{validationErrors.expenseType}</div>
                )}
              </Col>
              
              <Col md={6} className="mb-3">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  invalid={!!validationErrors.amount}
                  placeholder="Enter amount"
                  step="0.01"
                />
                {validationErrors.amount && (
                  <div className="text-danger small mt-1">{validationErrors.amount}</div>
                )}
              </Col>
              
              <Col md={6} className="mb-3">
                <Label>Date *</Label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  invalid={!!validationErrors.date}
                />
                {validationErrors.date && (
                  <div className="text-danger small mt-1">{validationErrors.date}</div>
                )}
              </Col>
              
              <Col md={6} className="mb-3">
                <Label>Payment Method *</Label>
                <Input
                  type="select"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  invalid={!!validationErrors.paymentMethod}
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </Input>
                {validationErrors.paymentMethod && (
                  <div className="text-danger small mt-1">{validationErrors.paymentMethod}</div>
                )}
              </Col>
              
              <Col md={6} className="mb-3">
                <Label>Paid To</Label>
                <Input
                  type="text"
                  name="paidTo"
                  value={formData.paidTo}
                  onChange={handleInputChange}
                  placeholder="Enter recipient name"
                />
              </Col>
              
              <Col md={6} className="mb-3">
                <Label>Approved By</Label>
                 <Input
                  type="input"
                  name="approvedBy"
                  value={formData.approvedBy}
                  onChange={handleInputChange}
                  placeholder="abdishakur"
                //   rows={3}
                />
                {/* <Select
                  options={staffMembers}
                  value={staffMembers.find(opt => opt.value === formData.approvedBy)}
                  onChange={(opt) => handleSelectChange('approvedBy', opt)}
                  isClearable
                  placeholder="Select approver"
                /> */}
              </Col>
              
              <Col md={12} className="mb-3">
                <Label>Description</Label>
                <Input
                  type="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description (optional)"
                  rows={3}
                />
              </Col>
            </Row>
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

export default ExpensesPage;