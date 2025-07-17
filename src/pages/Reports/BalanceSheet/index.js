import { useState, useEffect } from "react";
import {
  Card, CardHeader, CardBody,
  Col, Container, Row,
  Table, Spinner, Badge, Button,
  FormGroup, Label
} from "reactstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { api as API_URL } from "../../../config";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import moment from "moment";

const ParentFinanceReport = () => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('table');
  const [parents, setParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);

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
          label: `${parent.name} (${parent.contactNumber})`,
          ...parent
        })));
    } catch (error) {
      toast.error("Error loading parents: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch parent finance report
  const fetchParentReport = async (parentId) => {
    if (!parentId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL.API_URL}/finance/parents/${parentId}/reports/monthly`);
      const data = await response.json();
      if (data.success) {
        setReport(data.data);
      } else {
        toast.error(data.message || "Failed to load report");
      }
    } catch (error) {
      toast.error("Error loading report: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle parent selection change
  const handleParentChange = (selectedOption) => {
    setSelectedParent(selectedOption);
    setReport(null); // Clear previous report when parent changes
    if (selectedOption) {
      fetchParentReport(selectedOption.value);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Download text report
  const downloadTextReport = () => {
    if (!report?.asText) return;
    
    const filename = `finance-report-${selectedParent?.label.replace(/[^a-z0-9]/gi, '_')}-${moment().format('YYYY-MM-DD')}.txt`;
    const blob = new Blob([report.asText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Initial data load
  useEffect(() => {
    fetchParents();
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb 
          title="Parent Finance Report" 
          pageTitle="Finance" 
          parentPage="Reports" 
        />
        
        <Row className="justify-content-center">
          <Col lg={12}>
            <Card className="default-card-wrapper">
              <CardHeader>
                <Row>
                  <Col md={6}>
                    <h5 className="mb-0">Parent Financial Report</h5>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Select Parent</Label>
                      <Select
                        options={parents}
                        value={selectedParent}
                        onChange={handleParentChange}
                        placeholder="Search for a parent..."
                        isClearable
                        isLoading={isLoading}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardHeader>
              
              {selectedParent ? (
                report ? (
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <Badge color="info" className="me-2">
                          Discount: {report.parent.discount}
                        </Badge>
                        <Badge color={report.finalBalance >= 0 ? "success" : "danger"}>
                          Final Balance: {formatCurrency(report.finalBalance)}
                        </Badge>
                      </div>
                      <div>
                        <Button
                          color={activeTab === 'table' ? 'primary' : 'light'}
                          className="me-2"
                          onClick={() => setActiveTab('table')}
                        >
                          <i className="ri-table-2 me-1"></i> Table
                        </Button>
                        <Button
                          color={activeTab === 'text' ? 'primary' : 'light'}
                          className="me-2"
                          onClick={() => setActiveTab('text')}
                        >
                          <i className="ri-file-text-line me-1"></i> Text
                        </Button>
                        <Button
                          color="success"
                          onClick={downloadTextReport}
                        >
                          <i className="ri-download-line me-1"></i> Download
                        </Button>
                      </div>
                    </div>
                    
                    {activeTab === 'table' ? (
                      <div className="table-responsive">
                        <Table hover className="mb-0">
                          <thead>
                            <tr>
                              <th>SQN</th>
                              <th>Month</th>
                              <th className="text-end">Generated Fees</th>
                              <th className="text-end">Payments Received</th>
                              <th className="text-end">Monthly Balance</th>
                              <th className="text-end">Running Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.monthlyReport.map((month, index) => (
                              <tr key={`${month.year}-${month.month}`}>
                                <td>{++index}</td>
                                <td>
                                  {month.monthName} {month.year}
                                </td>
                                <td className="text-end">
                                  {month.generatedAmount > 0 ? (
                                    <span className="text-danger">
                                      -{formatCurrency(month.generatedAmount)}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="text-end">
                                  {month.receiptedAmount > 0 ? (
                                    <span className="text-success">
                                      +{formatCurrency(month.receiptedAmount)}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="text-end">
                                  {formatCurrency(month.generatedAmount - month.receiptedAmount)}
                                </td>
                                <td className="text-end fw-bold">
                                  {formatCurrency(month.balance)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <pre className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                        {report.asText}
                      </pre>
                    )}
                  </CardBody>
                ) : (
                  <CardBody className="text-center py-5">
                    {isLoading ? (
                      <>
                        <Spinner color="primary" />
                        <div className="mt-2">Loading report...</div>
                      </>
                    ) : (
                      "No report data available for selected parent"
                    )}
                  </CardBody>
                )
              ) : (
                <CardBody className="text-center py-5">
                  Please select a parent to view financial report
                </CardBody>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
      <ToastContainer limit={1} closeButton={false} />
    </div>
  );
};

export default ParentFinanceReport;