import { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody,
  Col, Container, Row,
  Form, Input, Label, Button
} from "reactstrap";

import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Loader from "../../../Components/Common/Loader";

import {
  addNewMadrassa as onAddNewMadrassa,
  getMadrassas as onGetMadrassas,
  updateMadrassa as onUpdateMadrassa
} from "../../../slices/thunks";

const Madrassas = () => {
  const dispatch = useDispatch();
  const { madrassas, error, isMadrassaSuccess } = useSelector(state => state.Settings);

  const [selectedMadrassa, setSelectedMadrassa] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    email: "",
    studentIdPrefix: "",
    currencyDigits: 2,
    logo: "",
    header: ""
  });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    dispatch(onGetMadrassas());
  }, [dispatch]);

  useEffect(() => {
    if (madrassas && madrassas.length > 0) {
      const madrassa = madrassas[0];
      setSelectedMadrassa(madrassa);
      setFormData({
        name: madrassa.name || "",
        address: madrassa.address || "",
        contactNumber: madrassa.contactNumber || "",
        email: madrassa.Email || "",
        studentIdPrefix: madrassa.studentIdPrefix || "",
        currencyDigits: madrassa.currencyDigits ?? 2,
        logo: madrassa.logo || "",
        header: madrassa.header || ""
      });
      setIsEdit(true);
    }
  }, [madrassas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.address || !formData.contactNumber) {
      toast.warning("Please fill in all required fields (name, address, contact number)");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const username = obj?.data?.user?.username || "Admin";

    const madrassaData = {
      name: formData.name,
      address: formData.address,
      contactNumber: formData.contactNumber,
      Email: formData.email,
      studentIdPrefix: formData.studentIdPrefix,
      currencyDigits: Number(formData.currencyDigits),
      logo: formData.logo,
      header: formData.header,
      ...(isEdit && selectedMadrassa
        ? {
            _id: selectedMadrassa._id,
            ModifiedBy: username,
            ModifiedDate: new Date().toISOString()
          }
        : {
            CreatedBy: username
          })
    };

    if (isEdit && selectedMadrassa) {
      dispatch(onUpdateMadrassa(madrassaData));
    } else {
      dispatch(onAddNewMadrassa(madrassaData));
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Madrassa Profile" pageTitle="Settings" />
        <Row className="justify-content-center">
          <Col lg={12}>
            <Card className="default-card-wrapper">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{isEdit ? "Edit Madrassa Profile" : "Add Madrassa Profile"}</h5>
              </CardHeader>
              <CardBody>
                {isMadrassaSuccess ? (
                  <Form onSubmit={handleSubmit}>
                    <Row className="gy-4">
                      <Col md={6}>
                        <Label htmlFor="name">Name <span className="text-danger">*</span></Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Enter madrassa name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </Col>
                      <Col md={6}>
                        <Label htmlFor="address">Address <span className="text-danger">*</span></Label>
                        <Input
                          id="address"
                          name="address"
                          placeholder="Enter address"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </Col>
                      <Col md={6}>
                        <Label htmlFor="contactNumber">Contact Number <span className="text-danger">*</span></Label>
                        <Input
                          id="contactNumber"
                          name="contactNumber"
                          placeholder="Enter contact number"
                          value={formData.contactNumber}
                          onChange={handleChange}
                        />
                      </Col>
                      <Col md={6}>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter email (optional)"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </Col>
                      <Col md={6}>
                        <Label htmlFor="studentIdPrefix">Student ID Prefix</Label>
                        <Input
                          id="studentIdPrefix"
                          name="studentIdPrefix"
                          placeholder="e.g. STD-"
                          value={formData.studentIdPrefix}
                          onChange={handleChange}
                        />
                      </Col>

                      {/* Currency Decimal Digits - Radio Buttons */}
                      <Col md={6}>
                        <Label className="fw-bold">Currency Decimal Digits (0-3)</Label>
                        <div className="d-flex gap-3 mt-2">
                          {[0, 1, 2, 3].map((value) => (
                            <div className="form-check" key={value}>
                              <Input
                                className="form-check-input"
                                type="radio"
                                name="currencyDigits"
                                id={`currencyDigits${value}`}
                                value={value}
                                checked={Number(formData.currencyDigits) === value}
                                onChange={handleChange}
                              />
                              <Label className="form-check-label" htmlFor={`currencyDigits${value}`}>
                                {value} {value === 1 ? "Digit" : "Digits"}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </Col>

<Row className="gy-4" style={{display:"none"}}>
  {/* Upload Logo */}
  <Col xs={12} md={6}>
    <div className="border rounded bg-light p-3 h-100 d-flex flex-column justify-content-between align-items-center">
      <Label className="fw-bold mb-2">Logo Image</Label>
      
      <div
        className="w-100 d-flex justify-content-center align-items-center mb-3"
        // style={{
        //   height: '220px',
        //   overflow: 'hidden',
        //   position: 'relative',
        //   flexShrink: 0
        // }}
      >
        {formData.logo ? (
          <img
            src={formData.logo}
            alt="Logo Preview"
            className="img-fluid"
            style={{
              maxHeight: "200px",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 0 5px rgba(0,0,0,0.2)",
              backgroundColor: '#f8f9fa'
            }}
          />
        ) : (
          <div className="text-muted text-center">
            <i className="ri-image-line" style={{ fontSize: '48px', color: '#ccc' }}></i>
            <div className="small mt-2">No logo uploaded</div>
          </div>
        )}
      </div>

      <Label className="btn btn-primary rounded-pill w-100 mb-2">
        <i className="ri-upload-2-line me-1"></i> Choose Logo Image
        <Input
          id="logo"
          name="logo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </Label>
    </div>
  </Col>

  {/* Upload Header */}
  <Col xs={12} md={6} >
    <div className="border rounded bg-light p-3 h-100 d-flex flex-column justify-content-between align-items-center">
      <Label className="fw-bold mb-2">Header Image</Label>
      
      <div
        className="w-100   d-flex justify-content-center align-items-center mb-3"
        // style={{
        //   height: '220px',
        //   overflow: 'hidden',
        //   position: 'relative',
        //   flexShrink: 0
        // }}
      >
        {formData.header ? (
          <img
            src={formData.header}
            alt="Header Preview"
            className="img-fluid"
            style={{
              maxHeight: "200px",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 0 5px rgba(0,0,0,0.2)",
              backgroundColor: '#f8f9fa'
            }}
          />
        ) : (
          <div className="text-muted text-center">
            <i className="ri-image-line" style={{ fontSize: '48px', color: '#ccc' }}></i>
            <div className="small mt-2">No header uploaded</div>
          </div>
        )}
      </div>

      <Label className="btn btn-primary rounded-pill w-100 mb-2">
        <i className="ri-upload-2-line me-1"></i> Choose Header Image
        <Input
          id="header"
          name="header"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </Label>
    </div>
  </Col>
</Row>


                      <Col md={12} className="text-center mt-4">
                        <Button color="primary" size="lg" type="submit" className="rounded-pill px-5">
                          Save Changes
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                ) : (
                  <Loader error={error} />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <ToastContainer limit={1} closeButton={false} />
    </div>
  );
};

export default Madrassas;
