import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Badge, Alert, Form, InputGroup, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get( API_BASE + '/auth/admin/users');
      setUsers(response.data.users || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (userId) => {
    try {
      const response = await axios.get(API_BASE + `/auth/admin/users/${userId}`);
      setSelectedUser(response.data.user);
      setShowModal(true);
    } catch (err) {
      setError('Failed to fetch user details: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatGender = (gender) => {
    switch(gender) {
      case 'M': return 'Male';
      case 'F': return 'Female';
      case 'O': return 'Other';
      default: return 'N/A';
    }
  };

  const getActivityBadge = (activityType) => {
    switch(activityType) {
      case 'Currently Logged In':
        return <Badge bg="success">🟢 Online</Badge>;
      case 'Profile Updated':
        return <Badge bg="info">📝 Updated</Badge>;
      case 'Account Created':
        return <Badge bg="secondary">👤 New</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active) ||
                         (filterStatus === 'online' && user.last_activity_type === 'Currently Logged In');
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="text-center">Loading users...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>User Management</h1>
        <Button variant="outline-primary" onClick={fetchUsers}>
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="online">Currently Online</option>
                <option value="active">Active Accounts</option>
                <option value="inactive">Inactive Accounts</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h5>Users ({filteredUsers.length})</h5>
        </Card.Header>
        <Card.Body>
          {filteredUsers.length === 0 ? (
            <div className="text-center text-muted">No users found</div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Activity</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      {user.first_name} {user.last_name}
                      {user.is_admin && <Badge bg="danger" className="ms-2">Admin</Badge>}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.mobile || 'N/A'}</td>
                    <td>
                      <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                        {user.role || 'user'}
                      </Badge>
                    </td>
                    <td>{getActivityBadge(user.last_activity_type)}</td>
                    <td>
                      <small>{formatDate(user.updated_at)}</small>
                    </td>
                    <td>
                      <small>{formatDate(user.created_at)}</small>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleUserClick(user.id)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* User Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Personal Information</h6>
                  <p><strong>ID:</strong> {selectedUser.id}</p>
                  <p><strong>Name:</strong> {selectedUser.first_name} {selectedUser.last_name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Mobile:</strong> {selectedUser.mobile || 'N/A'}</p>
                  <p><strong>Gender:</strong> {formatGender(selectedUser.gender)}</p>
                  <p><strong>Marital Status:</strong> {selectedUser.marital_status || 'N/A'}</p>
                  <p><strong>Date of Birth:</strong> {formatDate(selectedUser.date_of_birth)}</p>
                  <p><strong>Interested Services:</strong> {selectedUser.interested_services || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <h6>Account Information</h6>
                  <p><strong>Role:</strong> 
                    <Badge bg={selectedUser.role === 'admin' ? 'danger' : 'primary'} className="ms-2">
                      {selectedUser.role || 'user'}
                    </Badge>
                  </p>
                  <p><strong>Admin Status:</strong> 
                    <Badge bg={selectedUser.is_admin ? 'danger' : 'secondary'} className="ms-2">
                      {selectedUser.is_admin ? 'Admin' : 'Regular User'}
                    </Badge>
                  </p>
                  <p><strong>Current Status:</strong> {getActivityBadge(selectedUser.last_activity_type)}</p>
                  <p><strong>Account Created:</strong> {formatDate(selectedUser.created_at)}</p>
                  <p><strong>Last Activity:</strong> {formatDate(selectedUser.updated_at)}</p>
                  
                  {/* Activity Timeline */}
                  <h6 className="mt-3">Activity Summary</h6>
                  <div className="border rounded p-2 bg-light">
                    <small>
                      {selectedUser.last_activity_type === 'Currently Logged In' && (
                        <span className="text-success">🟢 User is currently logged in</span>
                      )}
                      {selectedUser.last_activity_type === 'Profile Updated' && (
                        <span className="text-info">📝 User has updated their profile</span>
                      )}
                      {selectedUser.last_activity_type === 'Account Created' && (
                        <span className="text-secondary">👤 User has not logged in since registration</span>
                      )}
                    </small>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
