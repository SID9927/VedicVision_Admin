import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Button, Form, Row, Col, Badge, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ;

const DatabaseViewer = () => {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showAuditMode, setShowAuditMode] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch users with audit data instead of sensitive data
      const usersResponse = await axios.get(API_BASE + '/auth/admin/users-sensitive');
      setUsers(usersResponse.data.users || []);

      // Fetch plans
      const plansResponse = await axios.get(API_BASE + '/plans/admin/all', {
        withCredentials: true
      });
      setPlans(plansResponse.data.plans || []);

      // Fetch discounts
      const discountsResponse = await axios.get(API_BASE + '/plans/admin/discounts', {
        withCredentials: true
      });
      setDiscounts(discountsResponse.data.discounts || []);

      setError('');
    } catch (err) {
      setError('Failed to fetch database data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field, data) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortData = (data, field = sortField) => {
    return [...data].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'NULL';
    return new Date(dateString).toLocaleString();
  };

    const formatGender = (gender) => {
    switch(gender) {
      case 'M': return 'Male';
      case 'F': return 'Female';
      case 'O': return 'Other';
      default: return 'NULL';
    }
  };

  const getAuditStatusBadge = (status) => {
    switch(status) {
      case 'LOGIN_SESSION_ACTIVE':
        return <Badge bg="success">🟢 Active Session</Badge>;
      case 'PROFILE_MODIFIED':
        return <Badge bg="info">📝 Modified</Badge>;
      case 'ACCOUNT_CREATED':
        return <Badge bg="secondary">👤 Created</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const SortableHeader = ({ field, children, onClick }) => (
    <th 
      onClick={() => onClick ? onClick(field) : handleSort(field)}
      style={{ cursor: 'pointer', userSelect: 'none' }}
      className={sortField === field ? 'table-active' : ''}
    >
      {children}
      {sortField === field && (
        <span className="ms-1">
          {sortDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </th>
  );

  if (loading) {
    return <div className="text-center">Loading database data...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Database Viewer</h1>
        <div className="d-flex gap-2">
          {/* <Form.Check
            type="switch"
            id="show-audit"
            label="Audit Mode"
            checked={showAuditMode}
            onChange={(e) => setShowAuditMode(e.target.checked)}
          /> */}
          <Button variant="outline-primary" onClick={fetchAllData}>
            Refresh All
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Database Statistics */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Database Statistics</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={2}>
              <div className="text-center">
                <h4 className="text-primary">{users.length}</h4>
                <small className="text-muted">Total Users</small>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-center">
                <h4 className="text-success">{users.filter(u => u.is_active).length}</h4>
                <small className="text-muted">Active Users</small>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-center">
                <h4 className="text-warning">{users.filter(u => u.audit_status === 'LOGIN_SESSION_ACTIVE').length}</h4>
                <small className="text-muted">Logged In</small>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-center">
                <h4 className="text-info">{plans.length}</h4>
                <small className="text-muted">Total Plans</small>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-center">
                <h4 className="text-warning">{plans.filter(p => p.is_active).length}</h4>
                <small className="text-muted">Active Plans</small>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-center">
                <h4 className="text-danger">{discounts.filter(d => d.is_active).length}</h4>
                <small className="text-muted">Active Discounts</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Database Tables */}
      <Tabs defaultActiveKey="users" className="mb-4">
        <Tab eventKey="users" title={`Users (${users.length})`}>
          <Card>
            {/* <Card.Header>
              <h5>Users Table {showAuditMode ? '(Audit Mode)' : '(Standard View)'}</h5>
              <small className="text-muted">
                {showAuditMode 
                  ? 'Showing audit trail and activity tracking - No sensitive data displayed'
                  : 'Click column headers to sort - Sensitive data hidden for security'
                }
              </small>
            </Card.Header> */}
            <Card.Header>
              <h5>Plans Table (Raw Database View)</h5>
              <small className="text-muted">Click column headers to sort - Sensitive data hidden for security</small>
            </Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <SortableHeader field="id">ID</SortableHeader>
                      <SortableHeader field="first_name">First Name</SortableHeader>
                      <SortableHeader field="last_name">Last Name</SortableHeader>
                      <SortableHeader field="email">Email</SortableHeader>
                      <SortableHeader field="mobile">Mobile</SortableHeader>
                      <SortableHeader field="gender">Gender</SortableHeader>
                      <SortableHeader field="role">Role</SortableHeader>
                      {/* <SortableHeader field="is_admin">Admin</SortableHeader> */}
                      {/* <SortableHeader field="is_active">Active</SortableHeader> */}
                      {showAuditMode ? (
                        <>
                          <SortableHeader field="audit_status">Audit Status</SortableHeader>
                          <SortableHeader field="password_status">Password</SortableHeader>
                          <SortableHeader field="session_status">Session</SortableHeader>
                          <SortableHeader field="hours_since_creation">Hours Active</SortableHeader>
                        </>
                      ) : (
                        <>
                          <SortableHeader field="interested_services">Services</SortableHeader>
                          <SortableHeader field="marital_status">Marital Status</SortableHeader>
                        </>
                      )}
                      <SortableHeader field="created_at">Created</SortableHeader>
                      <SortableHeader field="updated_at">Updated</SortableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {sortData(users).map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.first_name || 'NULL'}</td>
                        <td>{user.last_name || 'NULL'}</td>
                        <td>{user.email || 'NULL'}</td>
                        <td>{user.mobile || 'NULL'}</td>
                        <td>{formatGender(user.gender)}</td>
                        <td>
                          <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                            {user.role || 'user'}
                          </Badge>
                        </td>
                        {/* <td>
                          <Badge bg={user.is_admin ? 'danger' : 'secondary'}>
                            {user.is_admin ? 'TRUE' : 'FALSE'}
                          </Badge>
                        </td> */}
                        {/* <td>
                          <Badge bg={user.is_active ? 'success' : 'danger'}>
                            {user.is_active ? 'TRUE' : 'FALSE'}
                          </Badge>
                        </td> */}
                        {showAuditMode ? (
                          <>
                            <td>{getAuditStatusBadge(user.audit_status)}</td>
                            <td>
                              <Badge bg={user.password_status === 'PASSWORD_SET' ? 'success' : 'danger'}>
                                {user.password_status}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg={user.session_status === 'HAS_ACTIVE_SESSION' ? 'success' : 'secondary'}>
                                {user.session_status}
                              </Badge>
                            </td>
                            <td>
                              <small>
                                {user.hours_since_creation ? 
                                  `${Math.round(user.hours_since_creation)}h` : 
                                  '0h'
                                }
                              </small>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              <small>{user.interested_services || 'NULL'}</small>
                            </td>
                            <td>{user.marital_status || 'NULL'}</td>
                          </>
                        )}
                        <td>
                          <small>{formatDate(user.created_at)}</small>
                        </td>
                        <td>
                          <small>{formatDate(user.updated_at)}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="plans" title={`Plans (${plans.length})`}>
          <Card>
            <Card.Header>
              <h5>Plans Table (Raw Database View)</h5>
              <small className="text-muted">Click column headers to sort</small>
            </Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <SortableHeader field="id">ID</SortableHeader>
                      <SortableHeader field="name">Name</SortableHeader>
                      <SortableHeader field="price">Price</SortableHeader>
                      <th>Features</th>
                      <SortableHeader field="discount">Discount %</SortableHeader>
                      <th>Discount Period</th>
                      <SortableHeader field="is_active">Active</SortableHeader>
                      <SortableHeader field="created_at">Created</SortableHeader>
                      <SortableHeader field="updated_at">Updated</SortableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {sortData(plans).map((plan) => (
                      <tr key={plan.id}>
                        <td>{plan.id}</td>
                        <td><strong>{plan.name}</strong></td>
                        <td>₹{plan.price}</td>
                        <td>
                          <small>
                            {Array.isArray(plan.features) 
                              ? `${plan.features.length} features` 
                              : 'No features'
                            }
                          </small>
                        </td>
                        <td>
                          {plan.discount ? (
                            <Badge bg="success">{plan.discount}%</Badge>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td>
                          <small>
                            {plan.discount_start_date && plan.discount_end_date ? (
                              `${formatDate(plan.discount_start_date)} - ${formatDate(plan.discount_end_date)}`
                            ) : plan.discount_start_date ? (
                              `Since ${formatDate(plan.discount_start_date)}`
                            ) : (
                              'No discount period'
                            )}
                          </small>
                        </td>
                        <td>
                          <Badge bg={plan.is_active ? 'success' : 'danger'}>
                            {plan.is_active ? 'TRUE' : 'FALSE'}
                          </Badge>
                        </td>
                        <td>
                          <small>{formatDate(plan.created_at)}</small>
                        </td>
                        <td>
                          <small>{formatDate(plan.updated_at)}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="discounts" title={`Discounts (${discounts.length})`}>
          <Card>
            <Card.Header>
              <h5>Discounts Table (Raw Database View)</h5>
              <small className="text-muted">Click column headers to sort</small>
            </Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <SortableHeader field="id">ID</SortableHeader>
                      <SortableHeader field="plan_id">Plan ID</SortableHeader>
                      <SortableHeader field="plan_name">Plan Name</SortableHeader>
                      <SortableHeader field="discount_percentage">Discount %</SortableHeader>
                      <SortableHeader field="start_date">Start Date</SortableHeader>
                      <SortableHeader field="end_date">End Date</SortableHeader>
                      <SortableHeader field="is_active">Active</SortableHeader>
                      <SortableHeader field="created_at">Created</SortableHeader>
                      <SortableHeader field="updated_at">Updated</SortableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {sortData(discounts).map((discount) => (
                      <tr key={discount.id}>
                        <td>{discount.id}</td>
                        <td>{discount.plan_id}</td>
                        <td><strong>{discount.plan_name}</strong></td>
                        <td>
                          <Badge bg="success">{discount.discount_percentage}%</Badge>
                        </td>
                        <td>
                          <small>{formatDate(discount.start_date)}</small>
                        </td>
                        <td>
                          <small>{discount.end_date ? formatDate(discount.end_date) : 'No end date'}</small>
                        </td>
                        <td>
                          <Badge bg={discount.is_active ? 'success' : 'danger'}>
                            {discount.is_active ? 'TRUE' : 'FALSE'}
                          </Badge>
                        </td>
                        <td>
                          <small>{formatDate(discount.created_at)}</small>
                        </td>
                        <td>
                          <small>{formatDate(discount.updated_at)}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default DatabaseViewer;
