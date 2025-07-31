import { useCallback, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  Card, CardHeader,
  Col,
  Container,
  Form,
  FormFeedback,
  Input,
  Label,
  Modal, ModalBody, ModalFooter,
  ModalHeader,
  Row
} from "reactstrap";

import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createSelector } from "reselect";
import * as Yup from "yup";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import DeleteModal from "../../../Components/Common/DeleteModal";
import Loader from "../../../Components/Common/Loader";

import {
  addNewRole as onAddNewRole,
  deleteRole as onDeleteRole,
  getRoles as onGetRoles,
  updateRole as onUpdateRole
} from "../../../slices/thunks";

import 'react-toastify/dist/ReactToastify.css';

const Roles = () => {
  const dispatch = useDispatch();

  const selectRoleState = state => state.Settings;
  const roleSelector = createSelector(selectRoleState, roles => ({
    roles: roles.roles,
    error: roles.error,
    isSuccess: roles.isRoleSuccess
  }));

  const { roles, error, isSuccess } = useSelector(roleSelector);

  const [isEdit, setIsEdit] = useState(false);
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);
  const [role, setRole] = useState(null);
  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [madrassaId, setMadrassaId] = useState();


  const [filterText, setFilterText] = useState("");

  const toggle = useCallback(() => {
    setModal(!modal);
  }, [modal]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      type: role?.type || "",
      description: role?.description || ""
    },

    validationSchema: Yup.object({
      type: Yup.string().required("Please enter role name"),
      description: Yup.string()
    }),

    onSubmit: (values) => {
      const roleData = {
        type: values.type,
        description: values.description,
        CreatedBy: userName,
        madrassaId: madrassaId,
      };

      if (isEdit) {
        roleData._id = role._id;
        roleData.ModifiedBy = userName; // Replace with logged-in user if available
        roleData.ModifiedDate = new Date().toISOString();
        dispatch(onUpdateRole(roleData));
      } else {
        dispatch(onAddNewRole(roleData));
      }

      validation.resetForm();
      toggle();
    }
  });

  const handleAddClick = () => {
    setIsEdit(false);
    setRole(null);
    toggle();
  };

  const handleEditClick = (roleData) => {
    setIsEdit(true);
    setRole(roleData);
    toggle();
  };
  //  console.log("selected role is: ",role);
  const handleDeleteClick = (roleData) => {
    setRole(roleData);
    setDeleteModal(true);
  };

  const handleDeleteRole = () => {
    if (role) {
      dispatch(onDeleteRole(role._id));
      setDeleteModal(false);
    }
  };

  const checkedAll = useCallback(() => {
    const checkAll = document.getElementById("checkBoxAll");
    const checkboxes = document.querySelectorAll(".roleCheckBox");
    checkboxes.forEach(checkbox => {
      checkbox.checked = checkAll.checked;
    });
    updateDeleteCheckbox();
  }, []);

  const updateDeleteCheckbox = () => {
    const checked = document.querySelectorAll(".roleCheckBox:checked");
    setSelectedCheckBoxDelete(checked);
    setIsMultiDeleteButton(checked.length > 0);
  };

  const deleteMultipleRoles = () => {
    selectedCheckBoxDelete.forEach(item => {
      dispatch(onDeleteRole(item.value));
    });
    setDeleteModalMulti(false);
    document.getElementById("checkBoxAll").checked = false;
    setIsMultiDeleteButton(false);
  };

  useEffect(() => {
    if (sessionStorage.getItem("authUser")) {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const username = obj?.data?.user?.username || "Admin";
      const madrassaId = obj?.data?.user?.madrassaId;
      setMadrassaId(madrassaId);
      setUserName(username);
    }
    dispatch(onGetRoles());
  }, [dispatch]);
  // console.log("sucess:", isSuccess);

  const filteredRoles = (roles || []).filter(
    role =>
      role &&
      typeof role === "object" &&
      (role.type?.toLowerCase().includes(filterText.toLowerCase()) ||
        role.description?.toLowerCase().includes(filterText.toLowerCase()))
  );

  const columns = [
    {
      name: <span data-key="serial">#</span>,
      cell: (row, index) => index + 1,
      width: "60px"
    },
    {
      name: "Role Name",
      selector: row => row.type,
      sortable: false,
    },
    {
      name: "Description",
      selector: row => row.description,
      sortable: false,
    },
    // {
    //   name: "Created By",
    //   selector: row => row.CreatedBy,
    //   sortable: false,
    // },
    // {
    //   name: "Created At",
    //   selector: row => new Date(row.createdAt).toLocaleString(),
    //   sortable: false,
    // },
    {
      name: "Actions",
      cell: row => (
        <div className="hstack gap-2">
          <button
            className="btn btn-sm btn-soft-primary"
            onClick={() => handleEditClick(row)}
          >
            <i className="ri-pencil-fill"></i>
          </button>
          <button
            className="btn btn-sm btn-soft-danger"
            onClick={() => handleDeleteClick(row)}
          >
            <i className="ri-delete-bin-5-fill"></i>
          </button>
        </div>
      ),
      ignoreRowClick: true,
      // button: true,
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
          // value={search}
          onChange={e => setFilterText(e.target.value)}
          style={{ maxWidth: '500px', width: '250px', paddingLeft: '30px' }}
          data-key="search-input"
        />
        <i
          className="ri-search-line search-icon"
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#999"
          }}
        ></i>
      </div>
    </div>
  );
  return (
    <div className="page-content">

      <DeleteModal show={deleteModal} onDeleteClick={handleDeleteRole} onCloseClick={() => setDeleteModal(false)} />
      <DeleteModal show={deleteModalMulti} onDeleteClick={deleteMultipleRoles} onCloseClick={() => setDeleteModalMulti(false)} />

      <Container fluid>
        <BreadCrumb title="Roles" pageTitle="Settings" />
        <Row>
          <Col lg={12}>
            <Card id="roleList">
              <CardHeader>
                <Row className="align-items-center g-4">
                  <Col>
                    <h5 className="card-title mb-0">Role List</h5>
                  </Col>
                  <Col className="text-end">
                    {isMultiDeleteButton && (
                      <button className="btn btn-soft-danger me-1" onClick={() => setDeleteModalMulti(true)}>
                        <i className="ri-delete-bin-2-line"></i>
                      </button>
                    )}
                    <button className="btn btn-primary me-1" onClick={handleAddClick}>
                      <i className="ri-add-line me-1"></i> Add Role
                    </button>
                    {/* <button className="btn btn-info" onClick={() => setIsExportCSV(true)}>
                      <i className="ri-file-download-line me-1"></i> Export
                    </button> */}
                  </Col>
                </Row>
              </CardHeader>
              <div className="card-body pt-0">
                {isSuccess ? (
                  <DataTable
                    // title="Roles"
                    columns={columns}
                    data={filteredRoles || []}
                    pagination
                    // highlightOnHover
                    responsive
                    // striped
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

      <Modal isOpen={modal} toggle={toggle} >
        <ModalHeader toggle={toggle}>{isEdit ? "Edit Role" : "Add Role"}</ModalHeader>
        <Form onSubmit={validation.handleSubmit}>
          <ModalBody>
            <div className="mb-3">
              <Label htmlFor="type">
                Role Name <span className="text-danger">*</span>
              </Label>

              <Input
                id="type"
                name="type"
                type="text"
                value={validation.values.type}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={validation.touched.type && !!validation.errors.type}
              />
              <FormFeedback>{validation.errors.type}</FormFeedback>
            </div>

            <div className="mb-3">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                type="text"
                value={validation.values.description}
                onChange={validation.handleChange}
              // onBlur={validation.handleBlur}
              // invalid={validation.touched.description && !!validation.errors.description}
              />
              {/* <FormFeedback>{validation.errors.description}</FormFeedback> */}
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" className="btn btn-light" onClick={toggle}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEdit ? "save Changes" : "Save"}</button>
          </ModalFooter>
        </Form>
      </Modal>

      <ToastContainer limit={1} closeButton={false} />
    </div>
  );
};

export default Roles;
