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
import { api as API_URL } from "../../../config";

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
  const [teachers, setTeachers] = useState([]);

  const [isEdit, setIsEdit] = useState(false);
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [user, setUser] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [userName, setUserName] = useState("Admin");
  const [madrassaId, setMadrassaId] = useState();

  const toggle = useCallback(() => setModal(!modal), [modal]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: user?.username || "",
      password: user?.password || "",
      Teacher: user?.Teacher || "",
      roles: user?.roles ? user.roles.map(r => r._id) : []
    },
    onSubmit: (values) => {
      if (!values.username.trim()) {
        toast.warn("Username is required");
        return;
      }

      if (!isEdit && !values.password.trim()) {
        toast.warn("Password is required");
        return;
      }

      if (!values.Teacher) {
        toast.warn("Teacher is required");
        return;
      }

      if (values.roles.length === 0) {
        toast.warn("Please select at least one role");
        return;
      }

      const userData = {
        username: values.username,
        roles: values.roles,
        password: values.password,
        Teacher: values.Teacher,
        madrassaId: madrassaId,
      };

      if (isEdit) {
        userData._id = user._id;
        userData.ModifiedBy = userName;
        userData.ModifiedDate = new Date().toISOString();
        dispatch(onUpdateUser(userData));
      } else {
        userData.CreatedBy = userName;
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

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_URL.API_URL}/teachers`);
      const data = await response.json();
      if (data.success) {
        setTeachers(data.data.map(teacher => ({
          value: teacher._id,
          label: teacher.name
        })));
      }
    } catch (error) {
      toast.error("Error loading teachers: " + error.message);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredUsers = (users || []).filter(
    u => u?.username?.toLowerCase().includes(filterText.toLowerCase()) ||
      (u?.roles && u.roles.some(r => r.type.toLowerCase().includes(filterText.toLowerCase())))
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
      name: <span data-key="roles">Roles</span>,
      selector: row => row.roles?.map(r => r.type).join(", ") || ""
    },
    {
      name: <span data-key="teacher">Teacher</span>,
      selector: row => {
        const teacher = teachers.find(t => t.value === row.Teacher);
        return teacher ? teacher.label : "N/A";
      }
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
          style={{ maxWidth: '500px', width: '250px', paddingLeft: '30px' }}
          data-key="search-input"
        />
        <i
          className="ri-search-line search-icon"
          style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#999" }}
        ></i>
      </div>
    </div>
  );

  const roleOptions = roles.map(r => ({
    label: r.type,
    value: r._id
  }));

  const selectedRoles = roleOptions.filter(option =>
    validation.values.roles.includes(option.value)
  );

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
                <button className="btn btn-primary" onClick={handleAddClick}>
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
                  <Label htmlFor="Teacher" data-key="teacher">Teacher <span className="text-danger">*</span></Label>
                  <Select
                    id="Teacher"
                    name="Teacher"
                    options={teachers}
                    value={teachers.find(t => t.value === validation.values.Teacher) || null}
                    onChange={(selected) => {
                      validation.setFieldValue("Teacher", selected?.value || "");
                    }}
                    placeholder="Select Teacher"
                    isClearable
                  />
                </div>
              </Col>
            </Row>
            <Row>
              {/* {!isEdit && ( */}
              <Col md={6}>
                <div className="mb-3">
                  <Label htmlFor="password" data-key="password">Password <span className="text-danger">*</span></Label>
                  <Input
                    id="password"
                    name="password"
                    type="text"
                    value={validation.values.password}
                    onChange={validation.handleChange}
                    invalid={validation.touched.password && !!validation.errors.password}
                  />
                  <FormFeedback>{validation.errors.password}</FormFeedback>
                </div>
              </Col>
              {/* )} */}
              <Col md={6}>
                <div className="mb-3">
                  <Label htmlFor="roles" data-key="roles">Roles <span className="text-danger">*</span></Label>
                  <Select
                    id="roles"
                    name="roles"
                    isMulti
                    classNamePrefix="select"
                    value={selectedRoles}
                    onChange={(selected) => {
                      const selectedValues = selected ? selected.map(option => option.value) : [];
                      validation.setFieldValue("roles", selectedValues);
                    }}
                    options={roleOptions}
                    placeholder="Select Roles"
                    closeMenuOnSelect={false}
                    styles={{
                      option: (provided, state) => ({
                        ...provided,
                        color: 'white',
                        backgroundColor: state.isFocused ? '#4a6fa5' : '#2f4b73',
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: '#2f4b73',
                        color: 'white',
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: 'white',
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: 'white',
                        ':hover': {
                          backgroundColor: '#1c2b45',
                          color: 'white',
                        },
                      }),
                    }}
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