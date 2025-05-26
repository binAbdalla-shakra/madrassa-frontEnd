import { useCallback, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
    Card, CardHeader,
    Col, Container,
    Form, Input, Label,
    Modal, ModalBody, ModalFooter, ModalHeader,
    Row
} from "reactstrap";

import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import DeleteModal from "../../../Components/Common/DeleteModal";
import Loader from "../../../Components/Common/Loader";

import {
    addNewMadrassa as onAddNewMadrassa,
    deleteMadrassa as onDeleteMadrassa,
    getMadrassas as onGetMadrassas,
    updateMadrassa as onUpdateMadrassa
} from "../../../slices/thunks";

const Madrassas = () => {
  const dispatch = useDispatch();

  const { madrassas, error, isMadrassaSuccess } = useSelector(state => state.Settings);

  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedMadrassa, setSelectedMadrassa] = useState(null);
  const [formData, setFormData] = useState({ name: "", address: "", contactNumber: "", email: "" });
const [filterText, setFilterText] = useState("");
  const toggle = useCallback(() => setModal(!modal), [modal]);

  const handleAddClick = () => {
    setIsEdit(false);
    setFormData({ name: "", address: "", contactNumber: "", email: "" });
    toggle();
  };

  const handleEditClick = (madrassa) => {
    setIsEdit(true);
    setSelectedMadrassa(madrassa);
    setFormData({
      name: madrassa.name,
      address: madrassa.address,
      contactNumber: madrassa.contactNumber,
      email: madrassa.Email
    });
    toggle();
  };

  const handleDeleteClick = (madrassa) => {
    setSelectedMadrassa(madrassa);
    setDeleteModal(true);
  };

  const handleDeleteMadrassa = () => {
    if (selectedMadrassa) {
      dispatch(onDeleteMadrassa(selectedMadrassa._id));
      setDeleteModal(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
      ...(isEdit
        ? {
            _id: selectedMadrassa._id,
            ModifiedBy: username,
            ModifiedDate: new Date().toISOString()
          }
        : {
            CreatedBy: username
          })
    };

    if (isEdit) {
      dispatch(onUpdateMadrassa(madrassaData));
    } else {
      dispatch(onAddNewMadrassa(madrassaData));
    }

    toggle();
  };

  useEffect(() => {
    dispatch(onGetMadrassas());
  }, [dispatch]);

    const filteredMadrassa = (madrassas || []).filter(
    m => m.name?.toLowerCase().includes(filterText.toLowerCase()) ||
         m.address?.toLowerCase().includes(filterText.toLowerCase())||
         m.contactNumber?.toLowerCase().includes(filterText.toLowerCase())||
         m.Email?.toLowerCase().includes(filterText.toLowerCase())


  );

  const columns = [
    {
      name: <span data-key="serial">#</span>,
      cell: (row, index) => index + 1,
      width: "60px"
    },
    {
      name: <span data-key="name">Name</span>,
      selector: row => row.name
    },
    {
      name: <span data-key="address">Address</span>,
      selector: row => row.address
    },
    {
      name: <span data-key="contact-number">Contact Number</span>,
      selector: row => row.contactNumber
    },
    {
      name: <span data-key="email">Email</span>,
      selector: row => row.Email
    },
    {
      name: <span data-key="actions">Actions</span>,
      cell: row => (
        <div className="hstack gap-2">
          <button className="btn btn-sm btn-soft-primary" onClick={() => handleEditClick(row)}>
            <i className="ri-pencil-fill"></i>
          </button>
          <button className="btn btn-sm btn-soft-danger" onClick={() => handleDeleteClick(row)}>
            <i className="ri-delete-bin-5-fill"></i>
          </button>
        </div>
      ),
      width: "120px"
    }
  ];

  const subHeaderComponent = (
    <div className="d-flex justify-content-start mt-2 w-100">
      <div className="search-box position-relative">
        <Input
          type="text"
          className="form-control"
          placeholder="Search..."
          onChange={e => setFilterText(e.target.value)}
          style={{ maxWidth: '500px', width:'250px', paddingLeft: '30px' }}
          data-key="search-input"
        />
        <i className="ri-search-line search-icon" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#999" }}></i>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <DeleteModal show={deleteModal} onDeleteClick={handleDeleteMadrassa} onCloseClick={() => setDeleteModal(false)} />
      <Container fluid>
        <BreadCrumb title="Madrassas" pageTitle="Settings" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0" data-key="madrassa-list-title">Madrassa List</h5>
                <button className="btn btn-success" onClick={handleAddClick}>
                  <i className="ri-add-line me-1"></i> <span data-key="add-madrassa">Add Madrassa</span>
                </button>
              </CardHeader>
              <div className="card-body pt-0">
                {isMadrassaSuccess ? (
                  <DataTable
                    columns={columns}
                    data={filteredMadrassa || []}
                    pagination
                    responsive
                    persistTableHead
                     subHeader
                    subHeaderAlign="left"
                    subHeaderComponent={subHeaderComponent}
                  />
                ) : (
                  <Loader error={error} />
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={modal} toggle={toggle} centered>
        <ModalHeader toggle={toggle}>{isEdit ? "Edit Madrassa" : "Add Madrassa"}</ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Row>
                <Col md={6}>
            <div className="mb-3">
              <Label htmlFor="name" data-key="name">Name <span className="text-danger">*</span></Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
</Col>
<Col md={6}>
            <div className="mb-3">
              <Label htmlFor="address" data-key="address">Address <span className="text-danger">*</span></Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            </Col>
</Row>
<Row>
    <Col md={6}>
            <div className="mb-3">
              <Label htmlFor="contactNumber" data-key="contact-number">Contact Number <span className="text-danger">*</span></Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </div>
</Col>
<Col md={6}>
            <div className="mb-3">
              <Label htmlFor="email" data-key="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-light" onClick={toggle} data-key="cancel">Cancel</button>
            <button type="submit" className="btn btn-primary" data-key="submit">{isEdit ? "Save Changes" : "Save"}</button>
          </ModalFooter>
        </Form>
      </Modal>
      <ToastContainer limit={1} closeButton={false} />
    </div>
  );
};

export default Madrassas;
