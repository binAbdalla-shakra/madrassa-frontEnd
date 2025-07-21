import { useState, useEffect, useRef } from "react";
import {
  Card, CardHeader, CardBody, CardFooter,
  Col, Container, Row,
  Table, Spinner, Badge, Button,
  FormGroup, Label, Nav, NavItem, NavLink, Collapse
} from "reactstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { api as API_URL } from "../../../config";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import moment from "moment";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { FaFilePdf, FaFileAlt, FaDownload, FaChartLine, FaReceipt } from "react-icons/fa";
import { BsCashStack, BsCreditCard, BsChevronDown, BsChevronUp } from "react-icons/bs";
import { FiDollarSign } from "react-icons/fi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ParentFinanceReport = () => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('table');
  const [parents, setParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [expandedMonths, setExpandedMonths] = useState({});
  const reportRef = useRef();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Toggle month details
  const toggleMonthDetails = (monthKey) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  // Fetch all parents
  const fetchParents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL.API_URL}/parents`);
      const data = await response.json();
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
        // Initialize all months as collapsed
        const initialExpandedState = {};
        data.data.monthlyReport.forEach(month => {
          initialExpandedState[`${month.month}-${month.year}`] = false;
        });
        setExpandedMonths(initialExpandedState);
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
    setReport(null);
    if (selectedOption) {
      fetchParentReport(selectedOption.value);
    }
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


  // Chart data
  const getChartData = () => {
    if (!report) return null;

    return {
      labels: report.monthlyReport.map(month => `${month.monthName} ${month.year}`),
      datasets: [
        {
          label: 'Generated Fees',
          data: report.monthlyReport.map(month => month.generatedAmount),
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: 'Payments Received',
          data: report.monthlyReport.map(month => month.receiptedAmount),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Financial Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          }
        }
      }
    }
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
            <Card className="shadow-sm border-0" innerRef={reportRef}>
              <CardHeader className="bg-primary text-white">
                <Row className="align-items-center">
                  <Col md={6}>
                    <h4 className="mb-0 text-white">
                      <FiDollarSign className="me-2" />
                      Parent Financial Report
                    </h4>
                  </Col>
                  <Col md={6}>
                    <FormGroup className="mb-0">
                      <Select
                        options={parents}
                        value={selectedParent}
                        onChange={handleParentChange}
                        placeholder="Search for a parent..."
                        isClearable
                        isLoading={isLoading}
                        classNamePrefix="select2"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            borderRadius: '4px',
                            border: '1px solid #dee2e6',
                            minHeight: '40px'
                          })
                        }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardHeader>

              {selectedParent ? (
                report ? (
                  <>
                    <CardBody className="bg-light">
                      <Row className="mb-4">
                        <Col md={4}>
                          <div className="d-flex align-items-center p-3 bg-white rounded shadow-sm">
                            <div className="bg-soft-primary rounded p-3 me-3">
                              <FiDollarSign className="text-primary font-size-20" />
                            </div>
                            <div>
                              <p className="text-muted mb-1">Final Balance</p>
                              <h5 className={`mb-0 ${report.finalBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                                {formatCurrency(report.finalBalance)}
                              </h5>
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="d-flex align-items-center p-3 bg-white rounded shadow-sm">
                            <div className="bg-soft-warning rounded p-3 me-3">
                              <BsCashStack className="text-warning font-size-20" />
                            </div>
                            <div>
                              <p className="text-muted mb-1">Total Generated</p>
                              <h5 className="text-warning mb-0">
                                {formatCurrency(report.monthlyReport.reduce((sum, month) => sum + month.generatedAmount, 0))}
                              </h5>
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="d-flex align-items-center p-3 bg-white rounded shadow-sm">
                            <div className="bg-soft-success rounded p-3 me-3">
                              <BsCreditCard className="text-success font-size-20" />
                            </div>
                            <div>
                              <p className="text-muted mb-1">Total Received</p>
                              <h5 className="text-success mb-0">
                                {formatCurrency(report.monthlyReport.reduce((sum, month) => sum + month.receiptedAmount, 0))}
                              </h5>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <Nav tabs className="nav-tabs-custom">
                        <NavItem>
                          <NavLink
                            className={activeTab === 'table' ? 'active' : ''}
                            onClick={() => setActiveTab('table')}
                          >
                            <i className="ri-table-2 me-1"></i> Table View
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={activeTab === 'text' ? 'active' : ''}
                            onClick={() => setActiveTab('text')}
                          >
                            <i className="ri-file-text-line me-1"></i> Text View
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={activeTab === 'chart' ? 'active' : ''}
                            onClick={() => setActiveTab('chart')}
                          >
                            <i className="ri-bar-chart-line me-1"></i> Chart View
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </CardBody>

                    <CardBody>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <Badge color="info" className="me-2 p-2">
                            <i className="ri-percent-line me-1"></i> Discount: {report.parent.discount}
                          </Badge>
                          <Badge color="primary" className="p-2">
                            <i className="ri-user-line me-1"></i> Active Students: {report.parent.activeStudents}
                          </Badge>
                        </div>
                        <div>
                          {/* <Button
                            color="danger"
                            className="me-2"
                            onClick={printReport}
                          >
                            <FaFilePdf className="me-1" /> Print
                          </Button> */}
                          <Button
                            color="secondary"
                            onClick={downloadTextReport}
                          >
                            <FaFileAlt className="me-1" /> Text
                          </Button>
                        </div>
                      </div>

                      {activeTab === 'table' ? (
                        <div className="table-responsive">
                          <Table hover className="mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>#</th>
                                <th>Month</th>
                                <th className="text-end">Generated Fees</th>
                                <th className="text-end">Payments Received</th>
                                <th className="text-end">Monthly Balance</th>
                                <th className="text-end">Running Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.monthlyReport.map((month, index) => {
                                const monthKey = `${month.month}-${month.year}`;
                                const isExpanded = expandedMonths[monthKey];

                                return (
                                  <>
                                    <tr key={`${month.year}-${month.month}`}>
                                      <td>{++index}</td>
                                      <td>
                                        <strong>{month.monthName} {month.year}</strong>
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
                                        <span className={month.generatedAmount - month.receiptedAmount >= 0 ? 'text-danger' : 'text-success'}>
                                          {formatCurrency(month.generatedAmount - month.receiptedAmount)}
                                        </span>
                                      </td>
                                      <td className="text-end fw-bold">
                                        <span className={month.balance >= 0 ? 'text-danger' : 'text-success'}>
                                          {formatCurrency(month.balance)}
                                        </span>
                                      </td>
                                      <td>
                                        <Button
                                          color="link"
                                          size="sm"
                                          className="p-0"
                                          onClick={() => toggleMonthDetails(monthKey)}
                                        >
                                          {isExpanded ? <BsChevronUp /> : <BsChevronDown />}
                                        </Button>
                                      </td>
                                    </tr>
                                    {isExpanded && (
                                      <tr>
                                        <td colSpan="7" className="p-0">
                                          <div className="p-3 bg-light">
                                            <Row>
                                              <Col md={6}>
                                                <h6 className="mb-3">
                                                  <i className="ri-money-dollar-circle-line me-2"></i>
                                                  Generated Fees
                                                </h6>
                                                {month.generatedFees?.length > 0 ? (
                                                  <Table size="sm" borderless>
                                                    <thead>
                                                      <tr>
                                                        <th>Fee Type</th>
                                                        <th>Status</th>
                                                        <th>Due Date</th>
                                                        <th className="text-end">Amount</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {month.generatedFees.map(fee => (
                                                        <tr key={fee._id}>
                                                          <td>{fee.feeType}</td>
                                                          <td>
                                                            <Badge color={fee.status === 'paid' ? 'success' : 'warning'}>
                                                              {fee.status}
                                                            </Badge>
                                                          </td>
                                                          <td>{moment(fee.dueDate).format('MMM D, YYYY')}</td>
                                                          <td className="text-end text-danger">
                                                            -{formatCurrency(fee.totalAmount)}
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </Table>
                                                ) : (
                                                  <div className="text-muted">No fees generated</div>
                                                )}
                                              </Col>
                                              <Col md={6}>
                                                <h6 className="mb-3">
                                                  <i className="ri-bill-line me-2"></i>
                                                  Receipts
                                                </h6>
                                                {month.receipts?.length > 0 ? (
                                                  <Table size="sm" borderless>
                                                    <thead>
                                                      <tr>
                                                        <th>Receipt #</th>
                                                        <th>Date</th>
                                                        <th>Reference Fee</th>
                                                        <th>Method</th>
                                                        <th className="text-end">Amount</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {month.receipts.map(receipt => (
                                                        <tr key={receipt._id}>
                                                          <td>
                                                            <Badge color="info">
                                                              {receipt.receiptNumber}
                                                            </Badge>
                                                          </td>
                                                          <td>{moment(receipt.paymentDate).format('MMM D, YYYY')}</td>
                                                          <td>
                                                            {receipt.paidFee && (
                                                              `${receipt.paidFee.feeType} - ` +
                                                              `${moment({ year: receipt.paidFee.feeYear, month: receipt.paidFee.feeMonth - 1 }).format('MMM YYYY')} - ` +
                                                              `$${receipt.paidFee.feeAmount.toFixed(2)}`
                                                            )}
                                                          </td>

                                                          <td>
                                                            <Badge color="warning" className="text-capitalize">
                                                              {receipt.paymentMethod}
                                                            </Badge>
                                                          </td>
                                                          <td className="text-end text-success">
                                                            +{formatCurrency(receipt.amountPaid)}
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </Table>
                                                ) : (
                                                  <div className="text-muted">No receipts</div>
                                                )}
                                              </Col>
                                            </Row>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </>
                                );
                              })}
                            </tbody>
                          </Table>
                        </div>
                      ) : activeTab === 'text' ? (
                        <div className="p-4 bg-white rounded shadow-sm">
                          <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                            {report.asText}
                          </pre>
                        </div>
                      ) : (
                        <div className="p-4 bg-white rounded shadow-sm">
                          <div style={{ height: '400px' }}>
                            <Bar data={getChartData()} options={chartOptions} />
                          </div>
                        </div>
                      )}
                    </CardBody>

                    <CardFooter className="bg-light">
                      <div className="text-muted small">
                        <i className="ri-information-line me-1"></i> Report generated on {moment().format('MMMM Do YYYY, h:mm:ss a')}
                      </div>
                    </CardFooter>
                  </>
                ) : (
                  <CardBody className="text-center py-5">
                    {isLoading ? (
                      <div className="d-flex flex-column align-items-center">
                        <Spinner color="primary" className="mb-2" />
                        <h5>Loading financial report...</h5>
                        <p className="text-muted">Please wait while we fetch the data</p>
                      </div>
                    ) : (
                      <div className="d-flex flex-column align-items-center">
                        <i className="ri-file-search-line text-muted mb-3" style={{ fontSize: '48px' }}></i>
                        <h5>No report data available</h5>
                        <p className="text-muted">We couldn't find any financial data for the selected parent</p>
                      </div>
                    )}
                  </CardBody>
                )
              ) : (
                <CardBody className="text-center py-5">
                  <div className="d-flex flex-column align-items-center">
                    <i className="ri-user-search-line text-muted mb-3" style={{ fontSize: '48px' }}></i>
                    <h5>Select a parent to view report</h5>
                    <p className="text-muted">Choose a parent from the dropdown above to generate their financial report</p>
                  </div>
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