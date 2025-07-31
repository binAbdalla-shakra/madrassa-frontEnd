import { useState, useEffect } from "react";
import {
    Card, CardHeader, CardBody,
    Col, Container, Row,
    Label, Button, Spinner,
    Input, Badge, Alert,
    Form, InputGroup
} from "reactstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api as API_URL } from "../../../config";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Select from 'react-select';
import { FiCheck, FiSave, FiSearch } from 'react-icons/fi';
import Switch from "react-switch";

const RoleMenuPermissions = () => {
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [menus, setMenus] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all roles
    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL.API_URL}/roles`);
            const data = await response.json();
            if (data.success) {
                setRoles(data.data);
            }
        } catch (error) {
            toast.error("Error loading roles: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch menus for selected role
    const fetchMenusForRole = async (roleId) => {
        if (!roleId) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL.API_URL}/role-menus/${roleId}/menus`);
            const data = await response.json();
            if (data) {
                setMenus(data);
            }
        } catch (error) {
            toast.error("Error loading menus: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle menu access
    const toggleMenuAccess = (menuId) => {
        setMenus(prevMenus =>
            prevMenus.map(menu => {
                if (menu._id === menuId) {
                    const selectedSubMenus = menu.hasAccess ? [] : (menu.subMenus?.map(sub => sub._id) || []);
                    return {
                        ...menu,
                        hasAccess: !menu.hasAccess,
                        selectedSubMenus
                    };
                }
                return menu;
            })
        );
    };

    // Toggle submenu selection
    const toggleSubMenu = (menuId, subMenuId) => {
        setMenus(prevMenus =>
            prevMenus.map(menu => {
                if (menu._id === menuId) {
                    const selectedSubMenus = menu.selectedSubMenus || [];
                    const isSelected = selectedSubMenus.includes(subMenuId);
                    const newSelectedSubMenus = isSelected
                        ? selectedSubMenus.filter(id => id !== subMenuId)
                        : [...selectedSubMenus, subMenuId];

                    const hasAccess = newSelectedSubMenus.length > 0 || menu.hasAccess;

                    return {
                        ...menu,
                        hasAccess,
                        selectedSubMenus: newSelectedSubMenus
                    };
                }
                return menu;
            })
        );
    };

    // Save permissions
    const savePermissions = async () => {
        if (!selectedRole) return;

        setIsSaving(true);
        try {
            const permissions = menus.map(menu => ({
                menuId: menu._id,
                hasAccess: menu.hasAccess,
                selectedSubMenus: menu.selectedSubMenus || []
            }));

            const response = await fetch(`${API_URL.API_URL}/role-menus/${selectedRole._id}/permissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ menuPermissions: permissions })
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Permissions saved successfully");
            } else {
                toast.error(data.message || "Failed to save permissions");
            }
        } catch (error) {
            toast.error("Error saving permissions: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Filter menus based on search term
    const filteredMenus = menus.filter(menu =>
        menu.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (menu.subMenus && menu.subMenus.some(sub =>
            sub.label.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    );

    // Render menu item with parent and submenus
    const renderMenuItem = (menu) => {
        const hasSubMenus = menu.subMenus && menu.subMenus.length > 0;
        const selectedSubCount = menu.selectedSubMenus?.length || 0;
        const allSubSelected = hasSubMenus && selectedSubCount === menu.subMenus.length;

        return (
            <div key={menu._id} className="mb-4">
                {/* Parent Menu Row */}
                <div className="d-flex align-items-center mb-2">
                    <Form check inline className="me-3">
                        <Input
                            type="checkbox"
                            id={`menu-${menu._id}`}
                            checked={menu.hasAccess}
                            onChange={() => toggleMenuAccess(menu._id)}
                            className="form-check-input"
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <Label
                            check
                            for={`menu-${menu._id}`}
                            className="form-check-label fw-semibold"
                            style={{ cursor: 'pointer', fontSize: "16px", paddingLeft: "5px" }}
                        >
                            {/* {menu.icon && <i className={`${menu.icon} me-2`}></i>} */}
                            {menu.label}
                        </Label>
                    </Form>

                    {hasSubMenus && (
                        <Badge color={allSubSelected ? 'success' : 'primary'} pill className="ms-2">
                            {selectedSubCount}/{menu.subMenus.length}
                        </Badge>
                    )}
                </div>

                {/* Submenus Row */}
                {hasSubMenus && (
                    <div className="ps-4">
                        <div className="d-flex flex-wrap gap-3">
                            {menu.subMenus.map(subMenu => (
                                <div key={subMenu._id} className="d-flex align-items-center">
                                    <Switch
                                        checked={menu.selectedSubMenus?.includes(subMenu._id) || false}
                                        onChange={() => toggleSubMenu(menu._id, subMenu._id)}
                                        onColor="#405189"
                                        offColor="#e9ecef"
                                        uncheckedIcon={false}
                                        checkedIcon={false}
                                        height={20}
                                        width={40}
                                        handleDiameter={18}
                                        className="react-switch me-2"
                                    />
                                    <Label
                                        style={{ cursor: 'pointer', minWidth: '120px' }}
                                        onClick={() => toggleSubMenu(menu._id, subMenu._id)}
                                    >
                                        {subMenu.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    return (
        <div className="page-content">
            <Container fluid>
                <BreadCrumb title="Role Permissions" pageTitle="Access Control" />

                <Row>
                    <Col lg={12}>
                        <Card className="shadow-sm border-0">
                            <CardHeader className="bg-white border-bottom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Menu Permissions</h5>
                                    <div className="d-flex align-items-center gap-2">
                                        {selectedRole && (
                                            <Badge color="primary" pill className="fs-6">
                                                {selectedRole.type}
                                            </Badge>
                                        )}
                                        <Button
                                            color="primary"
                                            onClick={savePermissions}
                                            disabled={isSaving || !selectedRole}
                                            className="d-flex align-items-center gap-2"
                                        >
                                            {isSaving ? (
                                                <Spinner size="sm" />
                                            ) : (
                                                <FiSave />
                                            )}
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardBody>
                                <Row className="mb-4 g-3">
                                    <Col md={6}>
                                        <Label className="fw-medium mb-1">Select Role</Label>
                                        <Select
                                            options={roles.map(role => ({
                                                value: role._id,
                                                label: role.type
                                            }))}
                                            onChange={(selected) => {
                                                setSelectedRole(roles.find(r => r._id === selected.value));
                                                fetchMenusForRole(selected.value);
                                            }}
                                            placeholder="Select a role..."
                                            isDisabled={isLoading}
                                            isClearable
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Label className="fw-medium mb-1">Search Menus</Label>
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                placeholder="Search menus or submenus..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                disabled={!selectedRole}
                                            />
                                            {/* <Button disabled={!selectedRole} className="bg-primary">
                                                <FiSearch className="bg-primary" />
                                            </Button> */}
                                        </InputGroup>
                                    </Col>
                                </Row>

                                {!selectedRole ? (
                                    <Alert color="info" className="text-center">
                                        Please select a role to manage permissions
                                    </Alert>
                                ) : isLoading ? (
                                    <div className="text-center py-4">
                                        <Spinner color="primary" />
                                        <div className="mt-2">Loading menu structure...</div>
                                    </div>
                                ) : filteredMenus.length === 0 ? (
                                    <Alert color="warning" className="text-center">
                                        {searchTerm ? 'No matching menus found' : 'No menus available'}
                                    </Alert>
                                ) : (
                                    <div className="menu-permissions-container">
                                        <div className="d-flex justify-content-between mb-3">
                                            <small className="text-muted">
                                                Showing {filteredMenus.length} menu items
                                            </small>
                                            <Button
                                                color="link"
                                                size="sm"
                                                className="text-primary p-0"
                                                onClick={() => {
                                                    setMenus(prev => prev.map(menu => ({
                                                        ...menu,
                                                        hasAccess: true,
                                                        selectedSubMenus: menu.subMenus?.map(sub => sub._id) || []
                                                    })));
                                                }}
                                            >
                                                Select All
                                            </Button>
                                        </div>

                                        {
                                            filteredMenus
                                                .sort((a, b) => {
                                                    const aCount = a.subMenus?.length || 0;
                                                    const bCount = b.subMenus?.length || 0;
                                                    return aCount - bCount;
                                                })
                                                .map(menu => renderMenuItem(menu))
                                        }
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar
                newestOnTop
                closeButton={false}
            />
        </div>
    );
};

export default RoleMenuPermissions;