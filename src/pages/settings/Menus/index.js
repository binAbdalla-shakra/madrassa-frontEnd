import { useState, useEffect } from "react";
import {
    Card, CardHeader, CardBody,
    Col, Container, Row,
    Form, Input, Label, Button, Table, Spinner, Badge, Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { api as API_URL } from "../../../config";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

const MenuPage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [parentMenuOptions, setParentMenuOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({
        isOpen: false,
        mode: 'create', // 'create' or 'edit'
        data: null
    });
    const [formData, setFormData] = useState({
        label: '',
        icon: '',
        link: '',
        parentId: null,
        order: 0,
        isActive: true
    });
    const [validationErrors, setValidationErrors] = useState({});

    // Fetch menu items
    const fetchMenuItems = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL.API_URL}/menus/flat`);
            const data = await response.json();
            if (data.success) {
                setMenuItems(data.data);

                // Prepare parent menu options for select dropdown
                const options = data.data
                    .filter(item => !item.parentId) // Only top-level items can be parents
                    .map(item => ({
                        value: item._id,
                        label: item.label
                    }));
                setParentMenuOptions(options);
            }
        } catch (error) {
            toast.error("Error loading menu items: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear validation error when field changes
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle select change for parent menu
    const handleParentChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            parentId: selectedOption ? selectedOption.value : null,
            // Clear icon if this is a child item
            icon: selectedOption ? '' : prev.icon
        }));
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        if (!formData.label.trim()) errors.label = 'Label is required';
        if (!formData.link.trim()) errors.link = 'Link is required';
        if (!formData.parentId && !formData.icon.trim()) {
            errors.icon = 'Icon is required for parent items';
        }
        if (formData.label.length > 50) errors.label = 'Label must be less than 50 characters';
        if (formData.link.length > 100) errors.link = 'Link must be less than 100 characters';
        if (formData.icon && formData.icon.length > 50) errors.icon = 'Icon must be less than 50 characters';

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const url = modal.mode === 'create'
                ? `${API_URL.API_URL}/menus`
                : `${API_URL.API_URL}/menus/${modal.data._id}`;

            const method = modal.mode === 'create' ? 'POST' : 'PUT';

            const payload = {
                ...formData,
                // Ensure icon is only sent for parent items
                icon: formData.parentId ? null : formData.icon
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Menu item ${modal.mode === 'create' ? 'created' : 'updated'} successfully`);
                setModal({ isOpen: false, mode: 'create', data: null });
                fetchMenuItems();
            } else {
                toast.error(data.message || `Failed to ${modal.mode === 'create' ? 'create' : 'update'} menu item`);
            }
        } catch (error) {
            toast.error(`Error ${modal.mode === 'create' ? 'creating' : 'updating'} menu item: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Open modal for creating new menu item
    const openCreateModal = () => {
        setFormData({
            label: '',
            icon: '',
            link: '',
            parentId: null,
            order: 0,
            isActive: true
        });
        setModal({
            isOpen: true,
            mode: 'create',
            data: null
        });
    };

    // Open modal for editing menu item
    const openEditModal = (menuItem) => {
        setFormData({
            label: menuItem.label,
            icon: menuItem.icon || '',
            link: menuItem.link,
            parentId: menuItem.parentId?._id || null,
            order: menuItem.order,
            isActive: menuItem.isActive
        });
        setModal({
            isOpen: true,
            mode: 'edit',
            data: menuItem
        });
    };

    // Delete menu item
    const handleDelete = async (menuItem) => {
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            setIsLoading(true);
            try {
                // First check if this item has children
                const childrenResponse = await fetch(`${API_URL.API_URL}/menus?parentId=${menuItem._id}`);
                const childrenData = await childrenResponse.json();

                if (childrenData.success && childrenData.data.length > 0) {
                    toast.error('Cannot delete menu item with children. Delete children first.');
                    return;
                }

                const response = await fetch(`${API_URL.API_URL}/menus/${menuItem._id}`, {
                    method: 'DELETE'
                });

                const data = await response.json();

                if (data.success) {
                    toast.success('Menu item deleted successfully');
                    fetchMenuItems();
                } else {
                    toast.error(data.message || 'Failed to delete menu item');
                }
            } catch (error) {
                toast.error('Error deleting menu item: ' + error.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Initial data load
    useEffect(() => {
        fetchMenuItems();
    }, []);

    return (
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title="Menu Management" pageTitle="System" />

                <Row className="justify-content-center">
                    <Col lg={12}>
                        <Card className="default-card-wrapper">
                            <CardHeader className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Menu Items</h5>
                                <Button
                                    color="primary"
                                    className="rounded-pill px-4"
                                    onClick={openCreateModal}
                                >
                                    <i className="ri-add-line me-1"></i> Add New
                                </Button>
                            </CardHeader>

                            <CardBody>
                                <div className="table-responsive">
                                    <Table hover className="mb-0">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Label</th>
                                                <th>Link</th>
                                                <th>Parent</th>
                                                <th>Order</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {menuItems.length > 0 ? (
                                                menuItems.map((item, index) => (
                                                    <tr key={item._id}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            {item.label}
                                                            {item.icon && (
                                                                <i className={`${item.icon} ms-2`}></i>
                                                            )}
                                                        </td>
                                                        <td>{item.link}</td>
                                                        <td>{item.parentId?.label || '-'}</td>
                                                        <td>{item.order}</td>
                                                        <td>
                                                            <Badge color={item.isActive ? "success" : "danger"}>
                                                                {item.isActive ? "Active" : "Inactive"}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <div className="hstack gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-soft-primary"
                                                                    onClick={() => openEditModal(item)}
                                                                >
                                                                    <i className="ri-pencil-fill"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-soft-danger"
                                                                    onClick={() => handleDelete(item)}
                                                                >
                                                                    <i className="ri-delete-bin-5-fill"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-4">
                                                        {isLoading ? (
                                                            <Spinner color="primary" />
                                                        ) : (
                                                            "No menu items found"
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Create/Edit Modal */}
            <Modal isOpen={modal.isOpen} toggle={() => setModal(prev => ({ ...prev, isOpen: false }))} size="lg">
                <ModalHeader toggle={() => setModal(prev => ({ ...prev, isOpen: false }))}>
                    {modal.mode === 'create' ? 'Create New' : 'Edit'} Menu Item
                </ModalHeader>
                <Form onSubmit={handleSubmit}>
                    <ModalBody>
                        <Row>
                            <Col md={6}>
                                <div className="mb-3">
                                    <Label>Label *</Label>
                                    <Input
                                        type="text"
                                        name="label"
                                        value={formData.label}
                                        onChange={handleInputChange}
                                        invalid={!!validationErrors.label}
                                        placeholder="Enter menu label"
                                    />
                                    {validationErrors.label && (
                                        <div className="text-danger small mt-1">{validationErrors.label}</div>
                                    )}
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="mb-3">
                                    <Label>Parent Menu</Label>
                                    <Select
                                        options={parentMenuOptions}
                                        value={parentMenuOptions.find(option => option.value === formData.parentId)}
                                        onChange={handleParentChange}
                                        isClearable
                                        placeholder="Select parent menu"
                                    />
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <div className="mb-3">
                                    <Label>Link *</Label>
                                    <Input
                                        type="text"
                                        name="link"
                                        value={formData.link}
                                        onChange={handleInputChange}
                                        invalid={!!validationErrors.link}
                                        placeholder="Enter menu link (e.g., /dashboard)"
                                    />
                                    {validationErrors.link && (
                                        <div className="text-danger small mt-1">{validationErrors.link}</div>
                                    )}
                                </div>
                            </Col>
                            <Col md={6}>
                                {!formData.parentId && (
                                    <div className="mb-3">
                                        <Label>Icon *</Label>
                                        <Input
                                            type="text"
                                            name="icon"
                                            value={formData.icon}
                                            onChange={handleInputChange}
                                            invalid={!!validationErrors.icon}
                                            placeholder="Enter icon class (e.g., ri-dashboard-line)"
                                        />
                                        {validationErrors.icon && (
                                            <div className="text-danger small mt-1">{validationErrors.icon}</div>
                                        )}
                                        <small className="text-muted">
                                            Use Remix Icon classes (e.g., ri-home-line)
                                        </small>
                                    </div>
                                )}
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <div className="mb-3">
                                    <Label>Order</Label>
                                    <Input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        placeholder="Display order"
                                    />
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="mb-3">
                                    <div className="form-check mt-4 pt-2">
                                        <Input
                                            type="checkbox"
                                            id="isActive"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            className="form-check-input"
                                        />
                                        <Label for="isActive" className="form-check-label">Active</Label>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>
                            Cancel
                        </Button>
                        <Button color="primary" type="submit" disabled={isLoading}>
                            {isLoading ? <Spinner size="sm" /> : modal.mode === 'create' ? 'Create' : 'Update'}
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>

            <ToastContainer limit={1} closeButton={false} />
        </div>
    );
};

export default MenuPage;