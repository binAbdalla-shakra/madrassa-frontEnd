// Branches.js

import { useCallback, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Card, CardHeader, Col, Container, Form, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row
} from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import DeleteModal from "../../../Components/Common/DeleteModal";
import Loader from "../../../Components/Common/Loader";
import {
  addNewBranch as onAddNewBranch,
  deleteBranch as onDeleteBranch,
  getBranches as onGetBranches,
  getMadrassas as onGetMadrassas,
  updateBranch as onUpdateBranch
} from "../../../slices/thunks";

const Branches = () => {
  const dispatch = useDispatch();

  const { branches, madrassas, error, isBranchSuccess } = useSelector(state => state.Settings);

  const [isEdit, setIsEdit] = useState(false);
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [branch, setBranch] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [form, setForm] = useState({ name: "", madrassaId: "0", address: "", contactNumber: "" });

  const userObj = JSON.parse(sessionStorage.getItem("authUser"));
  const userName = userObj?.data?.user?.username || "Unknown";

  const toggle = useCallback(() => setModal(!modal), [modal]);

  const handleAddClick = () => {
    setIsEdit(false);
    setBranch(null);
    setForm({ name: "", madrassaId: "0", address: "", contactNumber: "" });
    toggle();
  };

  const handleEditClick = (data) => {
    setIsEdit(true);
    setBranch(data);
    setForm({
      name: data.name || "",
      madrassaId: data.madrassaId?._id || "0",
      address: data.address || "",
      contactNumber: data.contactNumber || ""
    });
    toggle();
  };

  const handleDeleteClick = (data) => {
    setBranch(data);
    setDeleteModal(true);
  };

  const handleDeleteBranch = () => {
    if (branch) {
      dispatch(onDeleteBranch(branch._id));
      setDeleteModal(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || form.madrassaId === "0" || !form.address || !form.contactNumber) {
      toast.warn("All fields are required and Madrassa must be selected.");
      return;
    }

    const payload = {
      name: form.name,
      madrassaId: form.madrassaId,
      address: form.address,
      contactNumber: form.contactNumber,
      ...(isEdit ? {
        _id: branch._id,
        ModifiedBy: userName,
        ModifiedDate: new Date().toISOString()
      } : {
        CreatedBy: userName
      })
    };

    if (isEdit) {
      dispatch(onUpdateBranch(payload));
    } else {
      dispatch(onAddNewBranch(payload));
    }

    toggle();
  };

  useEffect(() => {
    dispatch(onGetBranches());
    dispatch(onGetMadrassas());
  }, [dispatch]);

  const filteredBranches = (branches || []).filter(
    b => b.name?.toLowerCase().includes(filterText.toLowerCase()) ||
         b.madrassaId?.name?.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    { name: "#", cell: (row, index) => index + 1, width: "60px" },
    { name: <span data-key="name">Name</span>, selector: row => row.name },
    { name: <span data-key="madrassa">Madrassa</span>, selector: row => row.madrassaId?.name || "" },
    { name: <span data-key="address">Address</span>, selector: row => row.address },
    { name: <span data-key="contact">Contact Number</span>, selector: row => row.contactNumber },
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

  const madrassaOptions = [
    { label: "Select Madrassa", value: "0" },
    ...madrassas.map(m => ({ label: m.name, value: m._id }))
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
      <DeleteModal show={deleteModal} onDeleteClick={handleDeleteBranch} onCloseClick={() => setDeleteModal(false)} />
      <Container fluid>
        <BreadCrumb title="Branches" pageTitle="Settings" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0" data-key="branch-list-title">Branch List</h5>
                <button className="btn btn-success" onClick={handleAddClick}>
                  <i className="ri-add-line me-1"></i> <span data-key="add-branch">Add Branch</span>
                </button>
              </CardHeader>
              <div className="card-body pt-0">
                {isBranchSuccess ? (
                  <DataTable
                    columns={columns}
                    data={filteredBranches}
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

      <Modal isOpen={modal} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>{isEdit ? "Edit Branch" : "Add Branch"}</ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Row>
            <Col md={6}>

            <div className="mb-3">
              <Label htmlFor="name" data-key="name">Name <span className="text-danger">*</span></Label>
              <Input id="name" name="name" placeholder="name" value={form.name} onChange={handleChange} />
            </div>
            </Col>
              <Col md={6}>

            <div className="mb-3">
              <Label htmlFor="madrassaId" data-key="madrassa">Madrassa <span className="text-danger">*</span></Label>
              <Select
                id="madrassaId"
                name="madrassaId"
                classNamePrefix="select"
                options={madrassaOptions}
                value={madrassaOptions.find(opt => opt.value === form.madrassaId)}
                onChange={selected => setForm({ ...form, madrassaId: selected ? selected.value : "0" })}
              />
            </div>
             </Col>
            </Row>
            <Row>
             <Col md={6}>
            <div className="mb-3">
              <Label htmlFor="address" data-key="address">Address <span className="text-danger">*</span></Label>
              <Input id="address" name="address" placeholder="address" value={form.address} onChange={handleChange} />
            </div>
            </Col>
             <Col md={6}>
            <div className="mb-3">
              <Label htmlFor="contactNumber" data-key="contact">Contact Number <span className="text-danger">*</span></Label>
              <Input id="contactNumber" name="contactNumber" placeholder="number" value={form.contactNumber} onChange={handleChange} />
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

export default Branches;
