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
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createSelector } from "reselect";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import DeleteModal from "../../../Components/Common/DeleteModal";
import Loader from "../../../Components/Common/Loader";

import {
  addNewUser as onAddNewUser,
  deleteUser as onDeleteUser,
  getRoles as onGetRoles,
  getUsers as onGetUsers,
  updateUser as onUpdateUser
} from "../../../slices/thunks";

const Users = () => {
  const dispatch = useDispatch();

  const selectUserState = state => state.Settings;
  const userSelector = createSelector(selectUserState, settings => ({
    users: settings.users,
    roles: settings.roles,
    error: settings.error,
    isSuccess: settings.isUserSuccess
  }));

  const { users, roles, error, isSuccess } = useSelector(userSelector);

  const [isEdit, setIsEdit] = useState(false);
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [user, setUser] = useState(null);
  const [filterText, setFilterText] = useState("");
const [userName, setUserName] = useState("Admin");
const [madrassaId, setMadrassaId] = useState();


  const toggle = useCallback(() => setModal(!modal), [modal]);
  // console.log("selected Users is:",users);
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: user?.username || "",
      email: user?.email || "",
      password: user?.password || "",
      role: user?.role?._id || "0"
    },
    onSubmit: (values) => {
       if (!values.username.trim()) {
        toast.warn("Username is required");
        return;
      }
        if (!values.email.trim()) {
        toast.warn("Email is required");
        return;
      }

      if (!values.password.trim()) {
        toast.warn("Password is required");
        return;
      }

      if (values.role === "0") {
        toast.warn("Please select a valid role");
        return;
      }
      
      const userData = {
        username: values.username,
        email: values.email,
        roleId: values.role,
        password: values.password,
        madrassaId:madrassaId,
        
      };
      // console.log("Role id is: ",userData.roleId);
      if (isEdit) {
        userData._id = user._id;
        userData.ModifiedBy = userName;
        userData.ModifiedDate = new Date().toISOString();
        dispatch(onUpdateUser(userData));
      } else {
        userData.CreatedBy= userName;
        dispatch(onAddNewUser(userData));
      }
      validation.resetForm();
      toggle();
    }
  });

  const handleAddClick = () => {
    setIsEdit(false);
    setUser(null);
    toggle();
  };

  const handleEditClick = (userData) => {
    setIsEdit(true);
    // console.log("updated data is: ", userData)
    setUser(userData);
    toggle();
  };

  const handleDeleteClick = (userData) => {
    setUser(userData);
    setDeleteModal(true);
  };

  const handleDeleteUser = () => {
    if (user) {
      dispatch(onDeleteUser(user._id));
      setDeleteModal(false);
    }
  };

  useEffect(() => {
     if (sessionStorage.getItem("authUser")) {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const username = obj?.data?.user?.username || "Admin";
     const madrassaId = obj?.data?.user?.madrassaId;
    setMadrassaId(madrassaId);
    setUserName(username);
  }
    dispatch(onGetUsers());
    dispatch(onGetRoles());
  }, [dispatch]);

  const filteredUsers = (users || []).filter(
    u => u?.username?.toLowerCase().includes(filterText.toLowerCase()) ||
         u?.email?.toLowerCase().includes(filterText.toLowerCase()) ||
         u?.role?.type?.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      name: <span data-key="serial">#</span>,
      cell: (row, index) => index + 1,
      width: "60px"
    },
    {
      name: <span data-key="username">Username</span>,
      selector: row => row.username
    },
    {
      name: <span data-key="email">Email</span>,
      selector: row => row.email
    },
    {
      name: <span data-key="role">Role</span>,
      selector: row => row.role?.type || ""
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
        <i
          className="ri-search-line search-icon"
          style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#999" }}
        ></i>
      </div>
    </div>
  );

  const roleOptions = [
  { label: "Select Role", value: "0" },
  ...roles.map(r => ({ label: r.type, value: r._id }))
];


  return (
    <div className="page-content">
      <DeleteModal show={deleteModal} onDeleteClick={handleDeleteUser} onCloseClick={() => setDeleteModal(false)} />
      <Container fluid>
        <BreadCrumb title="Users" pageTitle="Settings" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0" data-key="user-list-title">User List</h5>
                <button className="btn btn-success" onClick={handleAddClick}>
                  <i className="ri-add-line me-1"></i> <span data-key="add-user">Add User</span>
                </button>
              </CardHeader>
              <div className="card-body pt-0">
                {isSuccess ? (
                  <DataTable
                    columns={columns}
                    data={filteredUsers || []}
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
        <ModalHeader toggle={toggle}>{isEdit ? "Edit User" : "Add User"}</ModalHeader>
        <Form onSubmit={validation.handleSubmit}>
          <ModalBody>
            <Row>
              <Col md={6}>
            <div className="mb-3">
              <Label htmlFor="username" data-key="username">Username <span className="text-danger">*</span></Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={validation.values.username}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={validation.touched.username && !!validation.errors.username}
              />
              <FormFeedback>{validation.errors.username}</FormFeedback>
            </div>
</Col>
<Col md={6}>
            <div className="mb-3">
              <Label htmlFor="email" data-key="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={validation.values.email}
                onChange={validation.handleChange}
              />
            </div>
            </Col>
            </Row>
            <Row>
              <Col md={6}>
            {/* {!isEdit && ( */}
              <div className="mb-3">
                <Label htmlFor="password" data-key="password">Password <span className="text-danger">*</span></Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={validation.values.password}
                  onChange={validation.handleChange}
                  invalid={validation.touched.password && !!validation.errors.password}
                />
                <FormFeedback>{validation.errors.password}</FormFeedback>
              </div>
            {/* )} */}
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <Label htmlFor="role" data-key="role">Role <span className="text-danger">*</span></Label>
              <Select
                id="role"
                name="role"
                classNamePrefix="select"
                value={
                  roleOptions.find(opt => opt.value === validation.values.role) || roleOptions[0]
                }
                onChange={selected => validation.setFieldValue("role", selected ? selected.value : "0")}
                // onBlur={() => validation.setFieldTouched("role", true)}
                options={roleOptions}
                placeholder="Select Role"
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

export default Users;
