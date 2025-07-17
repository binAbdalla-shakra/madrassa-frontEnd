import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Badge,
  Button,
  Card, CardHeader, CardBody,
  Col, Container,
  Form, FormGroup, Input, Label,
  Modal, ModalBody, ModalFooter, ModalHeader,
  Row, Table
} from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import DeleteModal from "../../../Components/Common/DeleteModal";
import { api } from "../../../config";

const Groups = () => {
  // State management
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [unGroupedStudents, setUnGroupedStudents] = useState([]);
  const [groupStudents, setGroupStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [removeStudentModal, setRemoveStudentModal] = useState(false);
  const [addStudentModal, setAddStudentModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);

  // Selected items
  const [isEdit, setIsEdit] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);
const [transferSourceGroupId, setTransferSourceGroupId] = useState(null);
const [transferTargetGroupId, setTransferTargetGroupId] = useState(null);
const [transferStudentIds, setTransferStudentIds] = useState([]);
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    teacherId: "",
    description: ""
  });

  const [studentForm, setStudentForm] = useState({
    studentIds: [],
    comment: ""
  });

  const [filterText, setFilterText] = useState("");

  // Get auth user info
  const authUser = JSON.parse(sessionStorage.getItem("authUser"));
  const username = authUser?.data?.user?.username || "Admin";
  const madrassaId = authUser?.data?.user?.madrassaId;

  // Options for selects
  const teacherOptions = [
    { value: "", label: "Select Teacher" },
    ...teachers.map(teacher => ({
      value: teacher._id,
      label: teacher.name
    }))
  ];

  const studentOptions = [
    { value: "", label: "Select Students" },
    ...unGroupedStudents.map(student => ({
      value: student._id,
      label: student.name
    }))
  ];

  // Update the transfer modal opening handler
const handleOpenTransferModal = (group) => {
  setTransferSourceGroupId(group._id);
  setTransferStudentIds([]); // Reset selected students
  setTransferModal(true);
};

    const customStyles = {
        multiValue: (styles, { data }) => {
            return {
              ...styles,
              backgroundColor: "#3762ea",
            };
          },
          multiValueLabel: (styles, { data }) => ({
            ...styles,
            backgroundColor : "#405189" ,
            color: "white",
          }),
          multiValueRemove: (styles, { data }) => ({
            ...styles,
            color: "white",
            backgroundColor : "#405189" ,
            ':hover': {
              backgroundColor: "#405189" ,
              color: 'white',
            },
          }),
    }

  // Fetch all groups with student counts
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${api.API_URL}/groups`);
      const data = await response.json();
      if (data.success) {
        setGroups(data.data);
      }
    } catch (error) {
      toast.error(`Error loading groups: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${api.API_URL}/teachers`);
      const data = await response.json();
      if (data.success) {
        setTeachers(data.data);
      }
    } catch (error) {
      toast.error(`Error loading teachers: ${error.message}`);
    }
  };

  // Fetch ungrouped students
  const fetchUngroupedStudents = async () => {
    try {
      const response = await fetch(`${api.API_URL}/groups/ungrouped-students`);
      const data = await response.json();
      if (data.success) {
        setUnGroupedStudents(data.data);
      }
    } catch (error) {
      toast.error(`Error loading ungrouped students: ${error.message}`);
    }
  };

  // Fetch students in a group
  const fetchGroupStudents = async (groupId) => {
    setLoading(true);
    try {
      const response = await fetch(`${api.API_URL}/groups/students?groupId=${groupId}&madrassaId=${madrassaId}`);
      const data = await response.json();
      if (data.success) {
        setGroupStudents(data.data);
      }
    } catch (error) {
      toast.error(`Error loading group students: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student group history
  const fetchStudentHistory = async (studentId) => {
    setLoading(true);
    try {
      const response = await fetch(`${api.API_URL}/groups/student-group-history/${studentId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedStudentHistory(data.data);
      }
    } catch (error) {
      toast.error(`Error loading student history: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create or update group
  const handleSubmitGroup = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.teacherId) {
      toast.warning("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        madrassaId,
        ...(isEdit
          ? { 
              _id: selectedGroup._id, 
              modifiedBy: username, 
              modifiedDate: new Date().toISOString() 
            }
          : { createdBy: username })
      };

      const url = isEdit 
        ? `${api.API_URL}/groups/${selectedGroup._id}`
        : `${api.API_URL}/groups`;
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to save group');

      toast.success(`Group ${isEdit ? 'updated' : 'created'} successfully`);
      setModal(false);
      fetchGroups();
    } catch (error) {
      toast.error(`Error saving group: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete group
  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    setLoading(true);
    try {
      const response = await fetch(`${api.API_URL}/groups/${selectedGroup._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to delete group');

      toast.success("Group deleted successfully");
      setDeleteModal(false);
      fetchGroups();
    } catch (error) {
      toast.error(`Error deleting group: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add students to group
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.studentIds.length || !selectedGroup?._id) {
      toast.warning("Please select students to add");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${api.API_URL}/groups/add-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: selectedGroup._id,
          studentIds: studentForm.studentIds,
          madrassaId,
          CreatedBy: username
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to add students');

      toast.success("Students added to group successfully");
      setAddStudentModal(false);
      setStudentForm({ studentIds: [], comment: "" });
      fetchGroupStudents(selectedGroup._id);
      fetchUngroupedStudents();
    } catch (error) {
      toast.error(`Error adding students: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Remove student from group
  const handleRemoveStudent = async () => {
    if (!selectedStudent || !selectedGroup?._id) return;

    setLoading(true);
    try {
      const response = await fetch(`${api.API_URL}/groups/remove-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: selectedGroup._id,
          studentId: selectedStudent._id,
          madrassaId,
          DeletedBy: username
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to remove student');

      toast.success("Student removed from group successfully");
      setRemoveStudentModal(false);
      fetchGroupStudents(selectedGroup._id);
      fetchUngroupedStudents();
    } catch (error) {
      toast.error(`Error removing student: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Transfer students between groups
const handleTransferStudents = async ({ sourceGroupId, targetGroupId, studentIds }) => {
  if (!sourceGroupId || !targetGroupId || !studentIds.length) {
    toast.warning("Please select students and target group");
    return;
  }

  setLoading(true);
  try {
    const response = await fetch(`${api.API_URL}/groups/transfer-students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceGroupId,
        targetGroupId,
        studentIds,
        madrassaId,
        PerformedBy: username
      })
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(data.message || 'Failed to transfer students');

    toast.success("Students transferred successfully");
    setTransferModal(false);
    setTransferStudentIds([]);
    setTransferTargetGroupId(null);
    fetchGroupStudents(sourceGroupId);
  } catch (error) {
    toast.error(`Error transferring students: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
  // View group students
  const handleViewStudents = (group) => {
    setSelectedGroup(group);
    setSelectedGroupName(group.name);
    fetchGroupStudents(group._id);
    setViewModal(true);
  };

  // View student history
  const handleViewHistory = (studentId) => {
    setSelectedStudentHistory(null);
    fetchStudentHistory(studentId);
    setHistoryModal(true);
  };

  // Initial data load
  useEffect(() => {
    fetchGroups();
    fetchTeachers();
    fetchUngroupedStudents();
  }, []);

  // Table columns
  const columns = [
    { name: "#", cell: (row, index) => index + 1, width: "60px" },
    { name: "Group Name", selector: row => row.name, sortable: true },
    { name: "Assigned Teacher", selector: row => row.teacherName, sortable: true },
    { name: "Description", selector: row => row.description },
    { name: "Total Students", selector: row => row.totalStudents, sortable: true },
    {
      name: "Actions",
      cell: row => (
        <div className="d-flex gap-2">
          <Button color="soft-info" size="sm" onClick={() => handleViewStudents(row)}>
            <i className="ri-eye-line" />
          </Button>
          <Button color="soft-primary" size="sm" onClick={() => {
            setIsEdit(true);
            setSelectedGroup(row);
            setFormData({
              name: row.name,
              teacherId: row.teacherId,
              description: row.description || ""
            });
            setModal(true);
          }}>
            <i className="ri-pencil-fill" />
          </Button>
          <Button color="soft-danger" size="sm" onClick={() => {
            setSelectedGroup(row);
            setDeleteModal(true);
          }}>
            <i className="ri-delete-bin-5-fill" />
          </Button>
        </div>
      ),
      width: "150px"
    }
  ];

  const groupStudentColumns = [
    { name: "#", cell: (row, index) => index + 1, width: "60px" },
    { name: "Student Name", selector: row => row.name, width: "320px" },
    { 
      name: "Join Date", 
      selector: row => new Date(row.joinDate).toLocaleDateString(),
      width: "120px" 
    },
    {
      name: 'Status',
      cell: row => (
        <Badge color={row.status === 'Active' ? 'success' : 'danger'}>
          {row.status}
        </Badge>
      ),
      width: "100px"
    },
    {
      name: "Actions",
      cell: row => (
        <div className="d-flex gap-2">
          <Button 
            color="soft-info" 
            size="sm" 
            onClick={() => handleViewHistory(row._id)}
          >
            <i className="ri-history-line" />
          </Button>
          <Button 
            color="soft-danger" 
            size="sm" 
            onClick={() => {
              setSelectedStudent(row);
              setRemoveStudentModal(true);
            }}
          >
            <i className="ri-delete-bin-line" />
          </Button>
        </div>
      ),
      width: "150px"
    }
  ];

  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(filterText.toLowerCase()) ||
    group.description?.toLowerCase().includes(filterText.toLowerCase()) ||
    group.teacherName?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="page-content">
      <DeleteModal 
        show={deleteModal} 
        onDeleteClick={handleDeleteGroup} 
        onCloseClick={() => setDeleteModal(false)} 
      />
      <DeleteModal 
        show={removeStudentModal} 
        onDeleteClick={handleRemoveStudent} 
        onCloseClick={() => setRemoveStudentModal(false)} 
      />
      
      <Container fluid>
        <BreadCrumb title="Groups" pageTitle="Academics" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Group List</h5>
                <Button color="primary" onClick={() => {
                  setIsEdit(false);
                  setFormData({ name: "", teacherId: "", description: "" });
                  setModal(true);
                }}>
                  <i className="ri-add-line me-1" /> Add Group
                </Button>
              </CardHeader>
              <CardBody>
                <DataTable
                  columns={columns}
                  data={filteredGroups}
                  pagination
                  responsive
                  subHeader
                  subHeaderComponent={
                    <div className="d-flex justify-content-start mt-2 w-100">
                      <div className="search-box position-relative">
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Search..."
                          onChange={e => setFilterText(e.target.value)}
                          style={{ maxWidth: '500px', width: '250px', paddingLeft: '30px' }}
                        />
                        <i className="ri-search-line search-icon" style={{
                          position: "absolute", left: "10px", top: "50%", 
                          transform: "translateY(-50%)", color: "#999"
                        }} />
                      </div>
                    </div>
                  }
                  progressPending={loading}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Group Add/Edit Modal */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg">
        <ModalHeader toggle={() => setModal(false)}>
          {isEdit ? "Edit Group" : "Add Group"}
        </ModalHeader>
        <Form onSubmit={handleSubmitGroup}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Name <span className="text-danger">*</span></Label>
                  <Input 
                    name="name" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    // required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Teacher <span className="text-danger">*</span></Label>
                  <Select
                    options={teacherOptions}
                    value={teacherOptions.find(t => t.value === formData.teacherId)}
                    onChange={selected => setFormData({ ...formData, teacherId: selected?.value || "" })}
                    placeholder="Select Teacher"
                    classNamePrefix="react-select"
                    // required
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={12}>
                <FormGroup>
                  <Label>Description</Label>
                  <Input 
                    type="textarea" 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setModal(false)}>Cancel</Button>
            <Button color="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Save'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* View Group Students Modal */}
      <Modal isOpen={viewModal} toggle={() => setViewModal(false)} size="lg">
        <ModalHeader toggle={() => setViewModal(false)}>
          Group <span className="text-primary">{selectedGroupName}</span> Students
        </ModalHeader>
        <ModalBody>
          <div className="d-flex justify-content-end gap-2 mb-3">
<Button color="primary" onClick={() => handleOpenTransferModal(selectedGroup)}>
  <i className="ri-exchange-line me-1" /> Transfer Students
</Button>
            <Button color="success" onClick={() => setAddStudentModal(true)}>
              <i className="ri-user-add-line me-1" /> Add Student
            </Button>
          </div>
          <DataTable 
            columns={groupStudentColumns} 
            data={groupStudents} 
            pagination 
            responsive 
            progressPending={loading}
          />
        </ModalBody>
      </Modal>

      {/* Add Student Modal */}
      <Modal isOpen={addStudentModal} toggle={() => setAddStudentModal(false)} size="lg">
        <ModalHeader toggle={() => setAddStudentModal(false)}>
          Add Student to Group
        </ModalHeader>
        <Form onSubmit={handleAddStudent}>
          <ModalBody>
            <FormGroup>
              <Label>Students</Label>
              <Select
                options={studentOptions}
                isMulti
                value={studentOptions.filter(opt => studentForm.studentIds.includes(opt.value))}
                onChange={selected => setStudentForm({
                  ...studentForm,
                  studentIds: selected.map(opt => opt.value)
                })}
                placeholder="Select Students"
                classNamePrefix="react-select"
              />
            </FormGroup>
            <FormGroup>
              <Label className="mt-3">Comment</Label>
              <Input 
                type="textarea" 
                value={studentForm.comment} 
                onChange={e => setStudentForm({ ...studentForm, comment: e.target.value })} 
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setAddStudentModal(false)}>Cancel</Button>
            <Button color="primary" type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Students'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Transfer Students Modal */}
<Modal isOpen={transferModal} toggle={() => setTransferModal(false)} size="lg">
  <ModalHeader toggle={() => setTransferModal(false)}>
    Transfer Students
  </ModalHeader>
  <ModalBody>
    <FormGroup>
      <Label>Source Group</Label>
      <Input
        type="text"
        value={selectedGroupName}
        disabled
      />
    </FormGroup>
    
<FormGroup className="mt-3">
  <Label>Target Group</Label>
  <Select
    options={groups
      .filter(group => group._id !== transferSourceGroupId)
      .map(group => ({
        value: group._id,
        label: group.name
      }))
    }
    value={teacherOptions.find(opt => opt.value === transferTargetGroupId)} // Changed this line
    onChange={selected => setTransferTargetGroupId(selected?.value || null)}
    placeholder="Select Target Group"
    
    
styles={customStyles}  
    // classNamePrefix="react-select"
  />
</FormGroup>

    <FormGroup className="mt-3">
      <Label>Students to Transfer</Label>
      <Table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Join Date</th>
          </tr>
        </thead>
        <tbody>
          {groupStudents.map(student => (
            <tr key={student._id}>
              <td>
                <Input
                  type="checkbox"
                  checked={transferStudentIds.includes(student._id)}
                  onChange={e => {
                    if (e.target.checked) {
                      setTransferStudentIds(prev => [...prev, student._id]);
                    } else {
                      setTransferStudentIds(prev => prev.filter(id => id !== student._id));
                    }
                  }}
                />
              </td>
              <td>{student.name}</td>
              <td>{new Date(student.joinDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </FormGroup>
  </ModalBody>
  <ModalFooter>
    <Button color="light" onClick={() => setTransferModal(false)}>Cancel</Button>
    <Button 
      color="primary" 
      onClick={() => {
        handleTransferStudents({
          sourceGroupId: transferSourceGroupId,
          targetGroupId: transferTargetGroupId,
          studentIds: transferStudentIds
        });
      }}
      disabled={loading || !transferStudentIds.length || !transferTargetGroupId}
    >
      {loading ? 'Transferring...' : 'Transfer Students'}
    </Button>
  </ModalFooter>
</Modal>

      {/* Student History Modal */}
      <Modal isOpen={historyModal} toggle={() => setHistoryModal(false)} size="lg">
        <ModalHeader toggle={() => setHistoryModal(false)}>
          Student Group History
        </ModalHeader>
        <ModalBody>
          {selectedStudentHistory ? (
            <Table striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Group</th>
                  <th>Join Date</th>
                  <th>Leave Date</th>
                  <th>Transferred To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudentHistory.map((record, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{record.groupName}</td>
                    <td>{new Date(record.joinDate).toLocaleDateString()}</td>
                    <td>{record.leaveDate ? new Date(record.leaveDate).toLocaleDateString() : '-'}</td>
                    <td>{record.transferredTo ? record.transferredTo : '-'}</td>
                    <td>
                      <Badge color={!record.leaveDate ? 'success' : 'secondary'}>
                        {!record.leaveDate ? 'Current' : 'Past'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div>Loading history...</div>
          )}
        </ModalBody>
      </Modal>

      <ToastContainer limit={1} closeButton={false} />
    </div>
  );
};

export default Groups;