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

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { api as API_URL } from "../../../config";

const ReceiptPage = () => {
  // State for parents list and selection
  const [parents, setParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);

  // State for receipts list
  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().endOf('month').format('YYYY-MM-DD')
  });
  const authUser = JSON.parse(sessionStorage.getItem("authUser"));
  // State for new receipt modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [availableFees, setAvailableFees] = useState([]);
  const [newReceipt, setNewReceipt] = useState({
    feeId: '',
    amountPaid: '',
    paymentMethod: 'cash',
    notes: '',
    receivedBy: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Payment method options
  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'wallet', label: 'wallet' },


    { value: 'bank', label: 'Bank Transfer' },
  ];

  // Fetch all parents
  const fetchParents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL.API_URL}/parents`);
      const data = await response.json();
      //   if (data.success) {

      //   }
      setParents(data.data.map(parent => ({
        value: parent._id,
        label: parent.name,
        ...parent
      })));
    } catch (error) {
      toast.error("Error loading parents: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch receipts for selected parent
  const fetchReceipts = async () => {
    if (!selectedParent) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL.API_URL}/finance/parents/${selectedParent.value}/receipts?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`
      );
      const data = await response.json();
      if (data.success) {
        setReceipts(data.data);
      }
    } catch (error) {
      toast.error("Error loading receipts: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available fees for selected parent
  const fetchAvailableFees = async () => {
    if (!selectedParent) return;

    try {
      const response = await fetch(
        `${API_URL.API_URL}/fee/fees/parent/${selectedParent.value}?status=pending`
      );
      const data = await response.json();
      if (data.success) {
        setAvailableFees(data.data.map(fee => ({
          value: fee._id,
          label: `${moment(`${fee.year}-${fee.month}`, 'YYYY-M').format('MMM YYYY')} - ${fee.feeType?.name} - ${fee.studentCount} student(s) - ${fee.totalAmount.toFixed(2)}`,
          ...fee
        })));
      }
    } catch (error) {
      toast.error("Error loading fees: " + error.message);
    }
  };

  // Handle parent selection
  const handleParentSelect = (selectedOption) => {
    setSelectedParent(selectedOption);
    setReceipts([]); // Clear previous receipts when parent changes
  };

  // Handle date filter change
  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({ ...prev, [name]: value }));
  };

  // Handle new receipt input change
  const handleReceiptChange = (e) => {
    const { name, value } = e.target;
    setNewReceipt(prev => ({ ...prev, [name]: value }));

    // Clear validation error when field changes
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle fee selection
  const handleFeeSelect = (selectedOption) => {
    setNewReceipt(prev => ({
      ...prev,
      feeId: selectedOption ? selectedOption.value : '',
      amountPaid: selectedOption ? selectedOption.totalAmount.toFixed(2) : ''
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!selectedParent) errors.parent = 'Please select a parent';
    if (!newReceipt.feeId) errors.feeId = 'Please select a fee';
    if (!newReceipt.amountPaid || isNaN(newReceipt.amountPaid)) errors.amountPaid = 'Please enter a valid amount';
    if (!newReceipt.paymentMethod) errors.paymentMethod = 'Please select payment method';
    // if (!newReceipt.receivedBy) errors.receivedBy = 'Please enter receiver name';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit new receipt
  const handleSubmitReceipt = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    newReceipt.receivedBy = authUser?.data?.user.username || "admin";
    try {
      const response = await fetch(`${API_URL.API_URL}/finance/parents/${selectedParent.value}/receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReceipt)
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Receipt created successfully");
        setIsCreateModalOpen(false);
        fetchReceipts();
        setNewReceipt({
          feeId: '',
          amountPaid: '',
          paymentMethod: 'cash',
          notes: '',
          receivedBy: ''
        });
      } else {
        toast.error(data.message || "Failed to create receipt");
      }
    } catch (error) {
      toast.error("Error creating receipt: " + error.message);
    }
  };

  // Print receipt
  const handlePrintReceipt = (receiptId) => {
    window.open(`/receipts/${receiptId}/print`, '_blank');
  };

  // Initial data load
  useEffect(() => {
    fetchParents();
  }, []);

  // Load receipts when parent or date filter changes
  useEffect(() => {
    fetchReceipts();
  }, [selectedParent, dateFilter]);

  // Load fees when modal opens
  useEffect(() => {
    if (isCreateModalOpen && selectedParent) {
      fetchAvailableFees();
    }
  }, [isCreateModalOpen, selectedParent]);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Receipt Management" pageTitle="Finance" />

        <Row className="justify-content-center">
          <Col lg={12}>
            <Card className="default-card-wrapper">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Receipts</h5>
                <Button
                  color="primary"
                  className="rounded-pill px-4"
                  onClick={() => setIsCreateModalOpen(true)}
                  disabled={!selectedParent}
                >
                  <i className="ri-add-line me-1"></i> Create Receipt
                </Button>
              </CardHeader>

              <CardBody>
                <Row className="mb-3">
                  <Col md={4}>
                    <Label>Select Parent</Label>
                    <Select
                      options={parents}
                      value={selectedParent}
                      onChange={handleParentSelect}
                      placeholder="Search for a parent..."
                      isClearable
                      isLoading={isLoading}
                    />
                    {validationErrors.parent && (
                      <div className="text-danger small mt-1">{validationErrors.parent}</div>
                    )}
                  </Col>

                  <Col md={2}>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      name="startDate"
                      value={dateFilter.startDate}
                      onChange={handleDateFilterChange}
                      disabled={!selectedParent}
                    />
                  </Col>
                  <Col md={2}>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      name="endDate"
                      value={dateFilter.endDate}
                      onChange={handleDateFilterChange}
                      disabled={!selectedParent}
                    />
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button
                      color="primary"
                      className="rounded-pill px-4"
                      onClick={fetchReceipts}
                      disabled={isLoading || !selectedParent}
                    >
                      {isLoading ? <Spinner size="sm" /> : 'Filter'}
                    </Button>
                  </Col>
                </Row>

                {selectedParent && (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Receipt No.</th>
                          <th>Date</th>
                          <th>Fee Period</th>
                          <th>Amount</th>
                          <th>Payment Method</th>
                          <th>Received By</th>
                          <th>Note</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receipts.length > 0 ? (
                          receipts.map((receipt, index) => (
                            <tr key={receipt._id}>
                              <td>{index + 1}</td>
                              <td>{receipt.receiptNumber}</td>
                              <td>{moment(receipt.paymentDate).format('DD MMM YYYY')}</td>
                              <td>
                                {receipt.fee ?
                                  moment(`${receipt.fee.year}-${receipt.fee.month}`, 'YYYY-M').format('MMM YYYY') : 'N/A'}
                              </td>
                              <td>{receipt.amountPaid.toFixed(2)}</td>
                              <td>
                                <Badge color="info" className="text-capitalize">
                                  {receipt.paymentMethod.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td>{receipt.receivedBy}</td>
                              <td>{receipt.notes}</td>
                              <td>
                                <Button
                                  color="light"
                                  size="sm"
                                  onClick={() => handlePrintReceipt(receipt._id)}
                                >
                                  <i className="ri-printer-line"></i> Print
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
                                selectedParent ? "No receipts found for the selected period" : "Please select a parent"
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>

              {selectedParent && (
                <CardFooter className="d-flex justify-content-between">
                  <div className="text-muted">
                    Showing {receipts.length} records for {selectedParent.label}
                  </div>
                  <div>
                    <Button color="light" className="me-2" disabled={receipts.length === 0}>
                      <i className="ri-download-line me-1"></i> Export
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Create Receipt Modal */}
      <Modal isOpen={isCreateModalOpen} toggle={() => setIsCreateModalOpen(!isCreateModalOpen)} size="lg">
        <ModalHeader toggle={() => setIsCreateModalOpen(false)}>
          Create New Receipt for {selectedParent?.label || 'Parent'}
        </ModalHeader>
        <Form onSubmit={handleSubmitReceipt}>
          <ModalBody>
            <Row>
              <Col md={12} className="mb-3">
                <Label>Select Fee</Label>
                <Select
                  options={availableFees}
                  onChange={handleFeeSelect}
                  placeholder="Search for a fee..."
                  isClearable
                  isLoading={isLoading}
                />
                {validationErrors.feeId && (
                  <div className="text-danger small mt-1">{validationErrors.feeId}</div>
                )}
              </Col>

              <Col md={6} className="mb-3">
                <Label>Amount Paid</Label>
                <Input
                  type="text"
                  name="amountPaid"
                  value={newReceipt.amountPaid}
                  onChange={handleReceiptChange}
                  invalid={!!validationErrors.amountPaid}
                  readOnly
                  style={{
                    backgroundColor: '#f8f9fa',  // light gray
                    cursor: 'not-allowed',
                    borderColor: '#ced4da'
                  }}

                />
                {validationErrors.amountPaid && (
                  <div className="text-danger small mt-1">{validationErrors.amountPaid}</div>
                )}
              </Col>

              <Col md={6} className="mb-3">
                <Label>Payment Method</Label>
                <Input
                  type="select"
                  name="paymentMethod"
                  value={newReceipt.paymentMethod}
                  onChange={handleReceiptChange}
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

              {/* <Col md={6} className="mb-3">
                <Label>Received By</Label>
                <Input
                  type="text"
                  name="receivedBy"
                  value={newReceipt.receivedBy}
                  onChange={handleReceiptChange}
                  invalid={!!validationErrors.receivedBy}
                  placeholder="Enter staff name"
                />
                {validationErrors.receivedBy && (
                  <div className="text-danger small mt-1">{validationErrors.receivedBy}</div>
                )}
              </Col> */}

              <Col md={12} className="mb-3">
                <Label>Notes</Label>
                <Input
                  type="text"
                  name="notes"
                  value={newReceipt.notes}
                  onChange={handleReceiptChange}
                  placeholder="Optional notes"
                />
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Create Receipt'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ToastContainer limit={1} closeButton={false} />
    </div>
  );
};

export default ReceiptPage;