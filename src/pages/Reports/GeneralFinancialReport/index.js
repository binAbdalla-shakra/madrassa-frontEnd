import { useState, useEffect } from "react";
import {
  Card, CardHeader, CardBody, CardFooter,
  Col, Container, Row,
  Table, Spinner, Badge, Button,
  Nav, NavItem, NavLink, TabContent, TabPane,
  FormGroup, Label, Input
} from "reactstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api as API_URL } from "../../../config";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import moment from "moment";

const FinanceDashboard = () => {
  const [activeMainTab, setActiveMainTab] = useState('summary');
  const [activeDetailTab, setActiveDetailTab] = useState('fees');
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().endOf('month').format('YYYY-MM-DD')
  });
  const [summaryData, setSummaryData] = useState(null);
  const [detailData, setDetailData] = useState(null);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Fetch finance summary
  const fetchFinanceSummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL.API_URL}/finance/summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      const data = await response.json();
      if (data.success) {
        setSummaryData(data.data);
      } else {
        toast.error(data.message || "Failed to load summary data");
      }
    } catch (error) {
      toast.error("Error loading finance summary: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch finance details
  const fetchFinanceDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL.API_URL}/finance/details?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      const data = await response.json();
      if (data.success) {
        setDetailData(data.data);
      } else {
        toast.error(data.message || "Failed to load detailed data");
      }
    } catch (error) {
      toast.error("Error loading finance details: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    if (activeMainTab === 'summary') {
      fetchFinanceSummary();
    } else {
      fetchFinanceDetails();
    }
  };

  // Initial data load
  useEffect(() => {
    fetchFinanceSummary();
  }, []);

  // Main tab change handler
  const toggleMainTab = (tab) => {
    if (tab !== activeMainTab) {
      setActiveMainTab(tab);
      if (tab === 'summary' && !summaryData) {
        fetchFinanceSummary();
      } else if (tab === 'details' && !detailData) {
        fetchFinanceDetails();
      }
    }
  };

  // Detail tab change handler
  const toggleDetailTab = (tab) => {
    setActiveDetailTab(tab);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb 
          title="Finance Dashboard" 
          pageTitle="Finance" 
        />
                      <Col lg={12}>
                <Card className="default-card-wrapper">
                     <CardHeader>
                    <h5 className="mb-0">Filtering</h5>
                  </CardHeader>
                      <CardBody>
        <Row className="mb-3">
          <Col md={3}>
            <FormGroup>
              <Label>Start Date</Label>
              <Input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </FormGroup>
          </Col>
          <Col md={3}>
            <FormGroup>
              <Label>End Date</Label>
              <Input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
            </FormGroup>
          </Col>
          <Col md={2} className="d-flex align-items-end mb-3">
            <Button 
              color="primary" 
              onClick={handleApplyFilters}
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" /> : 'Apply'}
            </Button>
          </Col>
        </Row>

        <Nav tabs className="mb-3">
          <NavItem>
            <NavLink
              className={activeMainTab === 'summary' ? 'active' : ''}
              onClick={() => toggleMainTab('summary')}
            >
              <i className="ri-bar-chart-line me-1"></i> Summary
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeMainTab === 'details' ? 'active' : ''}
              onClick={() => toggleMainTab('details')}
            >
              <i className="ri-list-check-2 me-1"></i> Detailed Report
            </NavLink>
          </NavItem>
        </Nav></CardBody>
        </Card>
</Col>
        <TabContent activeTab={activeMainTab}>
          <TabPane tabId="summary">
            <Row>
              <Col lg={12}>
                <Card className="default-card-wrapper">
                  <CardHeader>
                    <h5 className="mb-0">Financial Summary</h5>
                  </CardHeader>
                  {summaryData ? (
                    <CardBody>
                      {/* Summary content remains the same */}
                      <Row className="mb-4">
  <Col md={4}>
    <Card className="h-100"> {/* Added h-100 class */}
      <CardHeader className="bg-primary text-white">
        <h6 className="mb-0 text-white">Fees</h6>
      </CardHeader>
      <CardBody className="d-flex flex-column"> {/* Added flex column */}
        <div className="d-flex justify-content-between mb-2">
          <span>Generated:</span>
          <strong>{formatCurrency(summaryData.fees.totalGenerated)}</strong>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Paid:</span>
          <strong className="text-success">
            {formatCurrency(summaryData.fees.totalPaid)}
          </strong>
        </div>
        <div className="d-flex justify-content-between">
          <span>Pending:</span>
          <strong className="text-danger">
            {formatCurrency(summaryData.fees.totalPending)}
          </strong>
        </div>
      </CardBody>
    </Card>
  </Col>
  <Col md={4}>
    <Card className="h-100"> {/* Added h-100 class */}
      <CardHeader className="bg-success text-white">
        <h6 className="mb-0 text-white">Receipts</h6>
      </CardHeader>
      <CardBody className="d-flex flex-column"> {/* Added flex column */}
        <div className="d-flex justify-content-between mb-2">
          <span>Total Received:</span>
          <strong>{formatCurrency(summaryData.receipts.totalReceipts)}</strong>
        </div>
        <div className="d-flex justify-content-between">
          <span>Transaction Count:</span>
          <strong>{summaryData.receipts.count}</strong>
        </div>
        {/* Added empty div to balance height */}
        <div className="mt-auto" style={{ visibility: 'hidden' }}>
          <div className="d-flex justify-content-between mb-2">
            <span>&nbsp;</span>
            <strong>&nbsp;</strong>
          </div>
        </div>
      </CardBody>
    </Card>
  </Col>
  <Col md={4}>
    <Card className="h-100"> {/* Added h-100 class */}
      <CardHeader className="bg-warning text-white">
        <h6 className="mb-0 text-white">Expenses</h6>
      </CardHeader>
      <CardBody className="d-flex flex-column"> {/* Added flex column */}
        <div className="d-flex justify-content-between mb-2">
          <span>Total Expenses:</span>
          <strong>{formatCurrency(summaryData.expenses.totalExpenses)}</strong>
        </div>
        <div className="d-flex justify-content-between">
          <span>Transaction Count:</span>
          <strong>{summaryData.expenses.count}</strong>
        </div>
        {/* Added empty div to balance height */}
        <div className="mt-auto" style={{ visibility: 'hidden' }}>
          <div className="d-flex justify-content-between mb-2">
            <span>&nbsp;</span>
            <strong>&nbsp;</strong>
          </div>
        </div>
      </CardBody>
    </Card>
  </Col>
</Row>
                      <Row>
                        <Col lg={12}>
                          <Card>
                            <CardHeader className="bg-info text-white">
                              <h6 className="mb-0 text-white">Net Balance</h6>
                            </CardHeader>
                            <CardBody className="text-center">
                              <h2 className={summaryData.netBalance >= 0 ? "text-success" : "text-danger"}>
                                {formatCurrency(summaryData.netBalance)}
                              </h2>
                              <div className="text-muted">
                                (Receipts - Expenses)
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    </CardBody>
                  ) : (
                    <CardBody className="text-center py-5">
                      {isLoading ? (
                        <>
                          <Spinner color="primary" />
                          <div className="mt-2">Loading summary data...</div>
                        </>
                      ) : (
                        "No summary data available"
                      )}
                    </CardBody>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tabId="details">
            <Row>
              <Col lg={12}>
                <Card className="default-card-wrapper">
                  <CardHeader>
                    <h5 className="mb-0">Detailed Financial Report</h5>
                  </CardHeader>
                  {detailData ? (
                    <CardBody>
                      <Row className="mb-4">
                        <Col md={4}>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Total Fees:</span>
                            <strong>{formatCurrency(detailData.summary.totalFees)}</strong>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Total Paid:</span>
                            <strong className="text-success">
                              {formatCurrency(detailData.summary.totalPaid)}
                            </strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Total Pending:</span>
                            <strong className="text-danger">
                              {formatCurrency(detailData.summary.totalPending)}
                            </strong>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Total Receipts:</span>
                            <strong>{formatCurrency(detailData.summary.totalReceipts)}</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Total Expenses:</span>
                            <strong>{formatCurrency(detailData.summary.totalExpenses)}</strong>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="d-flex justify-content-between">
                            <span>Net Balance:</span>
                            <strong className={detailData.summary.netBalance >= 0 ? "text-success" : "text-danger"}>
                              {formatCurrency(detailData.summary.netBalance)}
                            </strong>
                          </div>
                        </Col>
                      </Row>

                      <Nav tabs className="mb-3">
                        <NavItem>
                          <NavLink
                            className={activeDetailTab === 'fees' ? 'active' : ''}
                            onClick={() => toggleDetailTab('fees')}
                          >
                            Fees ({detailData.fees.length})
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={activeDetailTab === 'receipts' ? 'active' : ''}
                            onClick={() => toggleDetailTab('receipts')}
                          >
                            Receipts ({detailData.receipts.length})
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={activeDetailTab === 'expenses' ? 'active' : ''}
                            onClick={() => toggleDetailTab('expenses')}
                          >
                            Expenses ({detailData.expenses.length})
                          </NavLink>
                        </NavItem>
                      </Nav>

                      <TabContent activeTab={activeDetailTab}>
                        <TabPane tabId="fees">
                          <div className="table-responsive">
                            <Table hover className="mb-0">
                              <thead>
                                <tr>
                                  <th>Parent</th>
                                  <th>Month</th>
                                  <th className="text-end">Total Amount</th>
                                  <th className="text-end">Paid Amount</th>
                                  <th className="text-end">Pending</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detailData.fees.map((fee) => (
                                  <tr key={fee._id}>
                                    <td>
                                      {fee.parent?.name || 'N/A'}
                                      <div className="text-muted small">{fee.parent?.contact || ''}</div>
                                    </td>
                                    <td>
                                      {new Date(0, fee.month - 1).toLocaleString('default', { month: 'long' })} {fee.year}
                                    </td>
                                    <td className="text-end">{formatCurrency(fee.totalAmount)}</td>
                                    <td className="text-end text-success">{formatCurrency(fee.paidAmount)}</td>
                                    <td className="text-end text-danger">
                                      {formatCurrency(fee.totalAmount - fee.paidAmount)}
                                    </td>
                                    <td>
                                      <Badge color={fee.status === 'paid' ? 'success' : 'warning'}>
                                        {fee.status}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </TabPane>

                        <TabPane tabId="receipts">
                          <div className="table-responsive">
                            <Table hover className="mb-0">
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Parent</th>
                                  <th className="text-end">Amount</th>
                                  <th>Payment Method</th>
                                  <th>Received By</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detailData.receipts.map((receipt) => (
                                  <tr key={receipt._id}>
                                    <td>{moment(receipt.paymentDate).format('MMM D, YYYY')}</td>
                                    <td>
                                      {receipt.parent?.name || 'N/A'}
                                      <div className="text-muted small">{receipt.parent?.contact || ''}</div>
                                    </td>
                                    <td className="text-end text-success">
                                      {formatCurrency(receipt.amountPaid)}
                                    </td>
                                    <td>
                                      <Badge color="info" className="text-capitalize">
                                        {receipt.paymentMethod.replace('_', ' ')}
                                      </Badge>
                                    </td>
                                    <td>{receipt.receivedBy || 'N/A'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </TabPane>

                        <TabPane tabId="expenses">
                          <div className="table-responsive">
                            <Table hover className="mb-0">
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Expense Type</th>
                                  <th className="text-end">Amount</th>
                                  <th>Description</th>
                                  <th>Approved By</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detailData.expenses.map((expense) => (
                                  <tr key={expense._id}>
                                    <td>{moment(expense.date).format('MMM D, YYYY')}</td>
                                    <td>{expense.expenseType?.name || 'N/A'}</td>
                                    <td className="text-end text-danger">
                                      {formatCurrency(expense.amount)}
                                    </td>
                                    <td>{expense.description || '-'}</td>
                                    <td>{expense.approvedBy?.name || 'N/A'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </TabPane>
                      </TabContent>
                    </CardBody>
                  ) : (
                    <CardBody className="text-center py-5">
                      {isLoading ? (
                        <>
                          <Spinner color="primary" />
                          <div className="mt-2">Loading detailed data...</div>
                        </>
                      ) : (
                        "No detailed data available"
                      )}
                    </CardBody>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </Container>
      <ToastContainer limit={1} closeButton={false} />
    </div>
  );
};

export default FinanceDashboard;