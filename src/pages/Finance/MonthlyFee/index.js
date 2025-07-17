import { useState, useEffect } from "react";
import {
  Card, CardHeader, CardBody,
  Col, Container, Row,
  Form, Input, Label, Button, Table, Spinner, Badge
} from "reactstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { api as API_URL } from "../../../config";

const MonthlyFeeGeneration = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [formData, setFormData] = useState({
    month: currentMonth,
    year: currentYear
  });

  const [generatedFees, setGeneratedFees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alreadyGenerated, setAlreadyGenerated] = useState(false);

  // Check if fees already generated for selected month/year
  useEffect(() => {
    const checkExistingFees = async () => {
      try {
        const response = await fetch(
          `${API_URL.API_URL}/finance/fees/exists?month=${formData.month}&year=${formData.year}`
        );
        const data = await response.json();
        setAlreadyGenerated(data.exists);
        setGeneratedFees([])
      } catch (error) {
        console.error("Error checking existing fees:", error);
      }
    };

    checkExistingFees();
  }, [formData.month, formData.year]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateFees = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL.API_URL}/finance/fees/generate-monthly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: formData.month,
          year: formData.year
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        // Fetch the newly generated fees
        const feesResponse = await fetch(
          `${API_URL.API_URL}/finance/fees?month=${formData.month}&year=${formData.year}`
        );
        const feesData = await feesResponse.json();
        if (feesData.success) {
          setGeneratedFees(feesData.data);
          setAlreadyGenerated(true);
        }
      } else {
        toast.error(data.message || "Failed to generate fees");
      }
    } catch (error) {
      toast.error("Error generating fees: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL.API_URL}/finance/fees?month=${formData.month}&year=${formData.year}`
      );
      const data = await response.json();
      if (data.success) {
        setGeneratedFees(data.data);
      }
    } catch (error) {
      toast.error("Error loading fees: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Monthly Fee Generation" pageTitle="Finance" />
        <Row className="justify-content-center">
          <Col lg={12}>
            <Card className="default-card-wrapper">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Generate Monthly Fees</h5>
                {alreadyGenerated && (
                  <Badge color="success" pill>
                    Already Generated
                  </Badge>
                )}
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
                        onChange={() => {}} // Readonly but needs onChange
                        readOnly
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
                            {new Date(0, i).toLocaleString('default', {month: 'long'})}
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
                            onClick={handleLoadFees}
                            disabled={isLoading}
                          >
                            {isLoading ? (
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
                            disabled={isLoading}
                          >
                            {isLoading ? (
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
                          disabled={isLoading}
                        >
                          {isLoading ? (
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
                    Generated Fees for {new Date(0, formData.month - 1).toLocaleString('default', {month: 'long'})} {formData.year}
                  </h5>
                </CardHeader>
                <CardBody>
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Parent</th>
                          <th>Students</th>
                          <th>Base Amount</th>
                          <th>Discount</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedFees.map((fee, index) => (
                          <tr key={fee._id}>
                            <td>{index + 1}</td>
                            <td>{fee.parent?.name || 'N/A'}</td>
                            <td>{fee.studentCount}</td>
                            <td>{fee.baseAmount?.toFixed(2)}</td>
                            <td>{fee.discountAmount?.toFixed(2)}</td>
                            <td>{fee.totalAmount?.toFixed(2)}</td>
                            <td>
                              <Badge color={fee.status === 'pending' ? 'warning' : 'success'}>
                                {fee.status}
                              </Badge>
                            </td>
                            <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
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
      </Container>
      <ToastContainer limit={1} closeButton={false} />
    </div>
  );
};

export default MonthlyFeeGeneration;