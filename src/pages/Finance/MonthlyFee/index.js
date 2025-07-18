import { useState, useEffect } from "react";
import {
  Card, CardHeader, CardBody,
  Col, Container, Row,
  Form, Input, Label, Button, Table, Spinner, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, FormGroup
} from "reactstrap";
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { api as API_URL } from "../../../config";

const FeeGeneration = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [formData, setFormData] = useState({
    month: currentMonth,
    year: currentYear
  });
  
  const authUser = JSON.parse(sessionStorage.getItem("authUser"));
  const [generatedFees, setGeneratedFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alreadyGenerated, setAlreadyGenerated] = useState(false);
  const [customFeeModal, setCustomFeeModal] = useState(false);
  const [bulkFeeModal, setBulkFeeModal] = useState(false);
  const [feeTypes, setFeeTypes] = useState([]);
  const [parents, setParents] = useState([]);
  const [customFeeForm, setCustomFeeForm] = useState({
    feeTypeId: '',
    parentId: '',
    studentCount: 1,
    totalAmount: 0,
    discountAmount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    notes: '',
    createdBy: authUser?.data?.user.username || "Admin"
  });
  const [bulkFeeForm, setBulkFeeForm] = useState({
    feeTypeId: '',
    feeData: [],
    createdBy: authUser?.data?.user.username || "Admin"
  });

  // Check if fees already generated for selected month/year
  useEffect(() => {
    checkExistingFees();
  }, [formData.month, formData.year]);

  // Fetch fee types and parents for custom fee generation
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feeTypesRes, parentsRes] = await Promise.all([
          fetch(`${API_URL.API_URL}/fee/fee-types`),
          fetch(`${API_URL.API_URL}/parents`)
        ]);

        const feeTypesData = await feeTypesRes.json();
        const parentsData = await parentsRes.json();

        if (feeTypesData.success) setFeeTypes(feeTypesData.data);
        if (parentsData.success) setParents(parentsData.data);
      } catch (error) {
        toast.error("Error fetching data: " + error.message);
      }
    };

    fetchData();
  }, []);

  const checkExistingFees = async () => {
    try {
      const response = await fetch(
        `${API_URL.API_URL}/fee/fees/check-monthly?month=${formData.month}&year=${formData.year}`
      );
      const data = await response.json();
      setAlreadyGenerated(data.exists);
      if (!data.exists) {
        setGeneratedFees([]);
      }
    } catch (error) {
      toast.error("Error checking existing fees: " + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomFeeChange = (e) => {
    const { name, value } = e.target;
    setCustomFeeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBulkFeeChange = (e) => {
    const { name, value } = e.target;
    setBulkFeeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateFees = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL.API_URL}/fee/fees/generate-monthly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: formData.month,
          year: formData.year,
          createdBy: authUser?.data?.user.username || "Admin"
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchGeneratedFees();
        setAlreadyGenerated(true);
      } else {
        toast.error(data.message || "Failed to generate fees");
      }
    } catch (error) {
      toast.error("Error generating fees: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeneratedFees = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL.API_URL}/fee/fees?month=${formData.month}&year=${formData.year}`
      );
      const data = await response.json();
      if (data.success) {
        setGeneratedFees(data.data);
      }
    } catch (error) {
      toast.error("Error loading fees: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomFeeModal = () => {
    setCustomFeeModal(!customFeeModal);
    if (!customFeeModal) {
      setCustomFeeForm({
        feeTypeId: feeTypes.length ? feeTypes[0]._id : '',
        parentId: parents.length ? parents[0]._id : '',
        studentCount: 1,
        totalAmount: 0,
        discountAmount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        notes: '',
        createdBy: authUser?.data?.user.username || "Admin"
      });
    }
  };

  const toggleBulkFeeModal = () => {
    setBulkFeeModal(!bulkFeeModal);
    if (!bulkFeeModal) {
      setBulkFeeForm({
        feeTypeId: feeTypes.length ? feeTypes[0]._id : '',
        feeData: parents.map(parent => ({
          parentId: parent._id,
          studentCount: 1,
          totalAmount: 0,
          discountAmount: 0,
          dueDate: new Date().toISOString().split('T')[0],
          notes: ''
        })),
        createdBy: authUser?.data?.user.username || "Admin"
      });
    }
  };

  const handleGenerateCustomFee = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL.API_URL}/fee/fees/generate-custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customFeeForm)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        toggleCustomFeeModal();
        fetchGeneratedFees();
      } else {
        toast.error(data.message || "Failed to generate custom fee");
      }
    } catch (error) {
      toast.error("Error generating custom fee: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBulkFees = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL.API_URL}/fee/fees/bulk-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkFeeForm)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Generated ${data.data.length} fees with ${data.errors?.length || 0} errors`);
        toggleBulkFeeModal();
        fetchGeneratedFees();
      } else {
        toast.error(data.message || "Failed to generate bulk fees");
      }
    } catch (error) {
      toast.error("Error generating bulk fees: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (feeId) => {
    const amount = prompt("Enter payment amount:");
    if (!amount || isNaN(amount)) return;

    try {
      const response = await fetch(`${API_URL.API_URL}/fee/fees/record-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          feeId,
          amount: parseFloat(amount),
          createdBy: authUser?.data?.user.username || "Admin"
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Payment recorded successfully");
        fetchGeneratedFees();
      } else {
        toast.error(data.message || "Failed to record payment");
      }
    } catch (error) {
      toast.error("Error recording payment: " + error.message);
    }
  };

  const handleCancelFee = async (feeId) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      const response = await fetch(`${API_URL.API_URL}/fee/fees/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          feeId, 
          reason,
          createdBy: authUser?.data?.user.username || "Admin"
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Fee cancelled successfully");
        fetchGeneratedFees();
      } else {
        toast.error(data.message || "Failed to cancel fee");
      }
    } catch (error) {
      toast.error("Error cancelling fee: " + error.message);
    }
  };

  const getMonthName = (month) => {
    return new Date(0, month - 1).toLocaleString('default', { month: 'long' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'warning';
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Fee Generation" pageTitle="Finance" />
        <Row className="justify-content-center">
          <Col lg={12}>
            <Card className="default-card-wrapper">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Generate Monthly Fees</h5>
                <div>
                  {alreadyGenerated && (
                    <Badge color="success" pill className="me-2">
                      Already Generated
                    </Badge>
                  )}
                  <Button color="info" size="sm" onClick={toggleCustomFeeModal} className="me-2">
                    <i className="ri-add-line align-bottom me-1"></i> Custom Fee
                  </Button>
                  <Button color="secondary" size="sm" onClick={toggleBulkFeeModal}>
                    <i className="ri-add-box-line align-bottom me-1"></i> Bulk Generate
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <Form onSubmit={handleGenerateFees}>
                  <Row className="gy-4">
                    <Col md={6}>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        name="year"
                        type="number"
                        value={formData.year}
                        onChange={handleChange}
                        min="2020"
                        max="2030"
                      />
                    </Col>
                    <Col md={6}>
                      <Label htmlFor="month">Month</Label>
                      <Input
                        id="month"
                        name="month"
                        type="select"
                        value={formData.month}
                        onChange={handleChange}
                      >
                        {Array.from({length: 12}, (_, i) => (
                          <option key={i+1} value={i+1}>
                            {getMonthName(i+1)}
                          </option>
                        ))}
                      </Input>
                    </Col>
                    <Col md={12} className="text-center mt-3">
                      {alreadyGenerated ? (
                        <>
                          <Button 
                            color="primary" 
                            className="rounded-pill px-4 me-2"
                            onClick={fetchGeneratedFees}
                            disabled={loading}
                          >
                            {loading ? (
                              <Spinner size="sm" />
                            ) : (
                              <i className="ri-refresh-line me-1"></i>
                            )}
                            Load Fees
                          </Button>
                          <Button 
                            color="warning" 
                            className="rounded-pill px-4"
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? (
                              <Spinner size="sm" />
                            ) : (
                              <i className="ri-restart-line me-1"></i>
                            )}
                            Re-generate Fees
                          </Button>
                        </>
                      ) : (
                        <Button 
                          color="primary" 
                          className="rounded-pill px-4"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <Spinner size="sm" />
                          ) : (
                            <i className="ri-money-dollar-circle-line me-1"></i>
                          )}
                          Generate Fees
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>

            {/* Generated Fees Section */}
            {generatedFees.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <h5 className="mb-0">
                    Generated Fees for {getMonthName(formData.month)} {formData.year}
                  </h5>
                </CardHeader>
                <CardBody>
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Parent</th>
                          <th>Fee Type</th>
                          <th>Students</th>
                          <th>Base Amount</th>
                          <th>Discount</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Due Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedFees.map((fee, index) => (
                          <tr key={fee._id}>
                            <td>{index + 1}</td>
                            <td>{fee.parent?.name || 'N/A'}</td>
                            <td>{fee.feeType?.name || 'N/A'}</td>
                            <td>{fee.studentCount}</td>
                            <td>{fee.baseAmount?.toFixed(2)}</td>
                            <td>{fee.discountAmount?.toFixed(2)}</td>
                            <td>{fee.totalAmount?.toFixed(2)}</td>
                            <td>
                              <Badge color={getStatusBadge(fee.status)}>
                                {fee.status}
                              </Badge>
                            </td>
                            <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                            <td>
                              <div className="hstack gap-2">
                                {fee.status !== 'paid' && fee.status !== 'cancelled' && (
                                  <Button
                                    color="soft-success"
                                    size="sm"
                                    onClick={() => handleRecordPayment(fee._id)}
                                  >
                                    <i className="ri-money-dollar-circle-line"></i>
                                  </Button>
                                )}
                                {fee.status !== 'cancelled' && (
                                  <Button
                                    color="soft-danger"
                                    size="sm"
                                    onClick={() => handleCancelFee(fee._id)}
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
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>

        {/* Custom Fee Modal */}
        <Modal isOpen={customFeeModal} toggle={toggleCustomFeeModal} centered size="lg">
          <ModalHeader toggle={toggleCustomFeeModal}>Generate Custom Fee</ModalHeader>
          <Form onSubmit={handleGenerateCustomFee}>
            <ModalBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Fee Type</Label>
                    <Input
                      type="select"
                      name="feeTypeId"
                      value={customFeeForm.feeTypeId}
                      onChange={handleCustomFeeChange}
                      required
                    >
                      {feeTypes.map(feeType => (
                        <option key={feeType._id} value={feeType._id}>
                          {feeType.name} ({feeType.category})
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Parent</Label>
                    <Input
                      type="select"
                      name="parentId"
                      value={customFeeForm.parentId}
                      onChange={handleCustomFeeChange}
                      required
                    >
                      {parents.map(parent => (
                        <option key={parent._id} value={parent._id}>
                          {parent.name} ({parent.contactNumber})
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
              
              <Row>
                <Col md={4}>
                  <FormGroup>
                    <Label>Student Count</Label>
                    <Input
                      type="number"
                      name="studentCount"
                      value={customFeeForm.studentCount}
                      onChange={handleCustomFeeChange}
                      min="1"
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label>Base Amount</Label>
                    <Input
                      type="number"
                      name="totalAmount"
                      value={customFeeForm.totalAmount}
                      onChange={handleCustomFeeChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label>Discount Amount</Label>
                    <Input
                      type="number"
                      name="discountAmount"
                      value={customFeeForm.discountAmount}
                      onChange={handleCustomFeeChange}
                      min="0"
                      step="0.01"
                    />
                  </FormGroup>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      name="dueDate"
                      value={customFeeForm.dueDate}
                      onChange={handleCustomFeeChange}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Notes</Label>
                    <Input
                      type="textarea"
                      name="notes"
                      value={customFeeForm.notes}
                      onChange={handleCustomFeeChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </ModalBody>
            <ModalFooter>
              <Button color="light" onClick={toggleCustomFeeModal}>
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={loading}>
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  "Generate Fee"
                )}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        {/* Bulk Fee Modal */}
        <Modal isOpen={bulkFeeModal} toggle={toggleBulkFeeModal} centered size="xl">
          <ModalHeader toggle={toggleBulkFeeModal}>Bulk Generate Fees</ModalHeader>
          <Form onSubmit={handleGenerateBulkFees}>
            <ModalBody>
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Label>Fee Type</Label>
                    <Input
                      type="select"
                      name="feeTypeId"
                      value={bulkFeeForm.feeTypeId}
                      onChange={handleBulkFeeChange}
                      required
                    >
                      {feeTypes.map(feeType => (
                        <option key={feeType._id} value={feeType._id}>
                          {feeType.name} ({feeType.category})
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
              
              <div className="table-responsive">
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Parent</th>
                      <th>Student Count</th>
                      <th>Base Amount</th>
                      <th>Discount</th>
                      <th>Due Date</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkFeeForm.feeData.map((fee, index) => (
                      <tr key={index}>
                        <td>
                          {parents.find(p => p._id === fee.parentId)?.name || 'N/A'}
                          <Input type="hidden" name={`feeData[${index}].parentId`} value={fee.parentId} />
                        </td>
                        <td>
                          <Input
                            type="number"
                            name={`feeData[${index}].studentCount`}
                            value={fee.studentCount}
                            onChange={(e) => {
                              const newFeeData = [...bulkFeeForm.feeData];
                              newFeeData[index].studentCount = e.target.value;
                              setBulkFeeForm({...bulkFeeForm, feeData: newFeeData});
                            }}
                            min="1"
                            required
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            name={`feeData[${index}].totalAmount`}
                            value={fee.totalAmount}
                            onChange={(e) => {
                              const newFeeData = [...bulkFeeForm.feeData];
                              newFeeData[index].totalAmount = e.target.value;
                              setBulkFeeForm({...bulkFeeForm, feeData: newFeeData});
                            }}
                            min="0"
                            step="0.01"
                            required
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            name={`feeData[${index}].discountAmount`}
                            value={fee.discountAmount}
                            onChange={(e) => {
                              const newFeeData = [...bulkFeeForm.feeData];
                              newFeeData[index].discountAmount = e.target.value;
                              setBulkFeeForm({...bulkFeeForm, feeData: newFeeData});
                            }}
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <Input
                            type="date"
                            name={`feeData[${index}].dueDate`}
                            value={fee.dueDate}
                            onChange={(e) => {
                              const newFeeData = [...bulkFeeForm.feeData];
                              newFeeData[index].dueDate = e.target.value;
                              setBulkFeeForm({...bulkFeeForm, feeData: newFeeData});
                            }}
                            required
                          />
                        </td>
                        <td>
                          <Input
                            type="text"
                            name={`feeData[${index}].notes`}
                            value={fee.notes}
                            onChange={(e) => {
                              const newFeeData = [...bulkFeeForm.feeData];
                              newFeeData[index].notes = e.target.value;
                              setBulkFeeForm({...bulkFeeForm, feeData: newFeeData});
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="light" onClick={toggleBulkFeeModal}>
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={loading}>
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  "Generate Fees"
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

export default FeeGeneration;