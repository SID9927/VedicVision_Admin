import React, { useState } from 'react';
import { Card, Form, Button, Alert, Badge, Tabs, Tab, Row, Col, Table } from 'react-bootstrap';
import axios from 'axios';

const ApiTester = () => {
  const [activeTab, setActiveTab] = useState('auth');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auth API states
  const [authEndpoint, setAuthEndpoint] = useState('/api/auth/admin/users');
  const [authMethod, setAuthMethod] = useState('GET');
  const [authBody, setAuthBody] = useState('');

  // Plan API states
  const [planEndpoint, setPlanEndpoint] = useState('/api/plans');
  const [planMethod, setPlanMethod] = useState('GET');
  const [planBody, setPlanBody] = useState('');

  // Discount API states
  const [discountEndpoint, setDiscountEndpoint] = useState('/api/plans/admin/discounts');
  const [discountMethod, setDiscountMethod] = useState('GET');
  const [discountBody, setDiscountBody] = useState('');

  const baseURL = import.meta.env.VITE_API_BASE_URL ;

  // Predefined API endpoints
  const authEndpoints = [
    { value: '/health', label: 'Health Check', method: 'GET', description: 'Check server status' },
    { value: '/auth/admin/users', label: 'Get All Users', method: 'GET', description: 'Retrieve all users (Admin)' },
    { value: '/auth/admin/users/1', label: 'Get User by ID', method: 'GET', description: 'Get specific user details' },
    { value: '/auth/login', label: 'Login User', method: 'POST', description: 'Authenticate user login' },
    { value: '/auth/register', label: 'Register User', method: 'POST', description: 'Create new user account' },
    { value: '/auth/logout', label: 'Logout User', method: 'POST', description: 'End user session' },
    { value: '/auth/profile', label: 'Get Profile', method: 'GET', description: 'Get current user profile' },
    { value: '/auth/check-auth', label: 'Check Auth Status', method: 'GET', description: 'Verify authentication' },
    { value: '/auth/forgot-password', label: 'Forgot Password', method: 'POST', description: 'Send password reset email' },
    { value: '/auth/refresh-token', label: 'Refresh Token', method: 'POST', description: 'Refresh access token' }
  ];

  const planEndpoints = [
    { value: '/plans', label: 'Get All Plans (Public)', method: 'GET', description: 'Get active plans with discounts' },
    { value: '/plans/1', label: 'Get Plan by ID', method: 'GET', description: 'Get specific plan details' },
    { value: '/plans/admin/all', label: 'Get All Plans (Admin)', method: 'GET', description: 'Get all plans including inactive' },
    { value: '/plans', label: 'Create New Plan', method: 'POST', description: 'Create a new service plan' },
    { value: '/plans/1', label: 'Update Plan', method: 'PUT', description: 'Update existing plan' },
    { value: '/plans/1', label: 'Delete Plan', method: 'DELETE', description: 'Soft delete plan' },
    { value: '/plans/bulk', label: 'Bulk Insert Plans', method: 'POST', description: 'Insert multiple plans at once' }
  ];

  const discountEndpoints = [
    { value: '/plans/admin/discounts', label: 'Get All Discounts', method: 'GET', description: 'Retrieve all discount records' },
    { value: '/plans/1/discount', label: 'Add Discount to Plan', method: 'POST', description: 'Apply discount to specific plan' },
    { value: '/plans/1/discount', label: 'Remove Discount from Plan', method: 'DELETE', description: 'Remove active discount from plan' }
  ];

  // Sample request bodies
  const sampleBodies = {
    auth: {
      login: JSON.stringify({
        email: "sid@gmail.com",
        password: "your-password"
      }, null, 2),
      register: JSON.stringify({
        firstName: "Test",
        lastName: "User",
        gender: "Male",
        maritalStatus: "Single",
        dateOfBirth: "1990-01-01",
        mobile: "1234567890",
        email: "test@example.com",
        interestedServices: ["Kundli", "Vastu"],
        password: "password123"
      }, null, 2),
      forgotPassword: JSON.stringify({
        email: "test@example.com"
      }, null, 2)
    },
    plans: {
      createPlan: JSON.stringify({
        name: "Premium Kundli Analysis",
        price: 2999.00,
        features: [
          "Detailed Kundli Analysis with 50+ pages report",
          "Yearly Predictions and Remedies",
          "Gemstone and Rudraksha Recommendations",
          "Personal Consultation (30 minutes)",
          "WhatsApp Support for 6 months",
          "Video call session with astrologer",
          "Home visit option available"
        ]
      }, null, 2),
      updatePlan: JSON.stringify({
        name: "Updated Premium Plan",
        price: 2499.00,
        features: [
          "Updated Feature 1",
          "Updated Feature 2",
          "New Additional Feature"
        ],
        is_active: true
      }, null, 2),
      bulkInsert: JSON.stringify({
        plans: [
          {
            name: "Basic Kundli",
            price: 1499.00,
            features: [
              "Personalized Kundli PDF",
              "Basic planetary analysis",
              "Lucky numbers & colors",
              "Consult with astrologer via WhatsApp",
              "Get guidance by email"
            ]
          },
          {
            name: "Kundli Matching",
            price: 1499.00,
            features: [
              "Detailed compatibility check",
              "Guna Milan score",
              "Remedy suggestions",
              "Discuss results on WhatsApp",
              "Get report by email"
            ]
          },
          {
            name: "Vastu Consultation",
            price: 11000.00,
            features: [
              "Home/office Vastu analysis",
              "Personalized Vastu report",
              "Remedy recommendations",
              "Consult on WhatsApp or phone",
              "Live video call for Vastu tour"
            ]
          }
        ]
      }, null, 2)
    },
    discounts: {
      addDiscount: JSON.stringify({
        discount_percentage: 25,
        end_date: "2024-12-31T23:59:59.000Z"
      }, null, 2)
    }
  };

  const makeRequest = async (endpoint, method, body, tab) => {
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const config = {
        method: method,
        url: `${baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Important for cookies
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        try {
          config.data = JSON.parse(body);
        } catch (parseError) {
          throw new Error('Invalid JSON in request body: ' + parseError.message);
        }
      }

      console.log(`🚀 Making ${method} request to ${config.url}`);
      if (config.data) {
        console.log('📤 Request body:', config.data);
      }

      const result = await axios(config);
      
      console.log('✅ Response received:', result.status, result.statusText);
      
      setResponse({
        status: result.status,
        statusText: result.statusText,
        headers: result.headers,
        data: result.data,
        timestamp: new Date().toISOString(),
        requestUrl: config.url,
        requestMethod: method
      });
    } catch (err) {
      console.error('❌ Request failed:', err);
      
      setError({
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        timestamp: new Date().toISOString(),
        requestUrl: `${baseURL}${endpoint}`,
        requestMethod: method
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEndpointChange = (value, tab) => {
    const endpoints = tab === 'auth' ? authEndpoints : 
                    tab === 'plans' ? planEndpoints : discountEndpoints;
    const selected = endpoints.find(ep => ep.value === value);
    
    if (tab === 'auth') {
      setAuthEndpoint(value);
      setAuthMethod(selected?.method || 'GET');
      // Set sample body based on endpoint
      if (value.includes('login')) setAuthBody(sampleBodies.auth.login);
      else if (value.includes('register')) setAuthBody(sampleBodies.auth.register);
      else if (value.includes('forgot-password')) setAuthBody(sampleBodies.auth.forgotPassword);
      else setAuthBody('');
    } else if (tab === 'plans') {
      setPlanEndpoint(value);
      setPlanMethod(selected?.method || 'GET');
      // Set sample body based on endpoint
      if (value === '/api/plans' && selected?.method === 'POST') setPlanBody(sampleBodies.plans.createPlan);
      else if (selected?.method === 'PUT') setPlanBody(sampleBodies.plans.updatePlan);
      else if (value.includes('bulk')) setPlanBody(sampleBodies.plans.bulkInsert);
      else setPlanBody('');
    } else {
      setDiscountEndpoint(value);
      setDiscountMethod(selected?.method || 'GET');
      // Set sample body based on endpoint
      if (selected?.method === 'POST') setDiscountBody(sampleBodies.discounts.addDiscount);
      else setDiscountBody('');
    }
  };

  const getMethodBadgeColor = (method) => {
    switch(method) {
      case 'GET': return 'primary';
      case 'POST': return 'success';
      case 'PUT': return 'warning';
      case 'DELETE': return 'danger';
      default: return 'secondary';
    }
  };

  const renderEndpointTable = (endpoints, tab) => (
    <Card className="mb-3">
      <Card.Header>
        <h6 className="mb-0">Available {tab === 'auth' ? 'Authentication' : tab === 'plans' ? 'Plan' : 'Discount'} Endpoints</h6>
      </Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <Table size="sm" hover>
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep, index) => (
                <tr key={index}>
                  <td>
                    <Badge bg={getMethodBadgeColor(ep.method)}>
                      {ep.method}
                    </Badge>
                  </td>
                  <td>
                    <code style={{ fontSize: '12px' }}>{ep.value}</code>
                  </td>
                  <td>
                    <small className="text-muted">{ep.description}</small>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleEndpointChange(ep.value, tab)}
                    >
                      Select
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );

  const renderApiSection = (tab, endpoint, method, body, setEndpoint, setMethod, setBody, endpoints) => (
    <div>
      {renderEndpointTable(endpoints, tab)}
      
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            {tab === 'auth' ? 'Authentication' : tab === 'plans' ? 'Plans' : 'Discounts'} API Request
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Endpoint</Form.Label>
                <Form.Select
                  value={endpoint}
                  onChange={(e) => handleEndpointChange(e.target.value, tab)}
                >
                  {endpoints.map((ep, index) => (
                    <option key={index} value={ep.value}>
                      {ep.label} ({ep.method})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
                        <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Method</Form.Label>
                <Form.Select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <div>
                  <Badge bg={getMethodBadgeColor(method)} className="fs-6">
                    {method}
                  </Badge>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Full URL</Form.Label>
            <Form.Control
              type="text"
              value={`${baseURL}${endpoint}`}
              readOnly
              className="bg-light"
              style={{ fontFamily: 'monospace', fontSize: '14px' }}
            />
          </Form.Group>

          {(method === 'POST' || method === 'PUT') && (
            <Form.Group className="mb-3">
              <Form.Label>
                Request Body (JSON)
                <Badge bg="info" className="ms-2">Required</Badge>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter JSON request body..."
                style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}
              />
              <Form.Text className="text-muted">
                💡 Tip: Sample JSON is auto-filled when you select an endpoint
              </Form.Text>
            </Form.Group>
          )}

          <div className="d-flex gap-2 flex-wrap">
            <Button
              variant="primary"
              onClick={() => makeRequest(endpoint, method, body, tab)}
              disabled={loading}
              className="d-flex align-items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Sending...
                </>
              ) : (
                <>
                  🚀 Send {method} Request
                </>
              )}
            </Button>
            
            <Button
              variant="outline-secondary"
              onClick={() => {
                setResponse(null);
                setError('');
              }}
            >
              🗑️ Clear Response
            </Button>

            {(method === 'POST' || method === 'PUT') && (
              <Button
                variant="outline-info"
                onClick={() => {
                  try {
                    const formatted = JSON.stringify(JSON.parse(body), null, 2);
                    setBody(formatted);
                  } catch (e) {
                    alert('Invalid JSON format');
                  }
                }}
              >
                ✨ Format JSON
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  const renderResponse = () => {
    if (!response && !error) return null;

    return (
      <Card className="mt-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {response ? '✅ Response' : '❌ Error Response'}
          </h5>
          <div className="d-flex gap-2 align-items-center">
            {response && (
              <Badge bg={response.status < 300 ? 'success' : response.status < 400 ? 'warning' : 'danger'}>
                {response.status} {response.statusText}
              </Badge>
            )}
            {error && (
              <Badge bg="danger">
                {error.status || 'Network Error'}
              </Badge>
            )}
            <small className="text-muted">
              {(response || error)?.timestamp && new Date((response || error).timestamp).toLocaleTimeString()}
            </small>
          </div>
        </Card.Header>
        <Card.Body>
          {response && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Request:</strong> 
                  <Badge bg={getMethodBadgeColor(response.requestMethod)} className="ms-2">
                    {response.requestMethod}
                  </Badge>
                  <br />
                  <code style={{ fontSize: '12px' }}>{response.requestUrl}</code>
                </Col>
                <Col md={6}>
                  <strong>Response Time:</strong> {response.timestamp}<br />
                  <strong>Content-Type:</strong> {response.headers['content-type'] || 'N/A'}
                </Col>
              </Row>
              
              <div className="mb-3">
                <strong>Response Data:</strong>
                <div className="bg-light p-3 rounded mt-2" style={{ maxHeight: '400px', overflow: 'auto' }}>
                  <pre style={{ margin: 0, fontSize: '13px', lineHeight: '1.4' }}>
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>

              {response.data && typeof response.data === 'object' && (
                <div className="mt-3">
                  <strong>Quick Stats:</strong>
                  <ul className="list-unstyled mt-2">
                    {response.data.total && (
                      <li>📊 Total Records: <Badge bg="info">{response.data.total}</Badge></li>
                    )}
                    {response.data.users && Array.isArray(response.data.users) && (
                      <li>👥 Users Count: <Badge bg="primary">{response.data.users.length}</Badge></li>
                    )}
                    {response.data.plans && Array.isArray(response.data.plans) && (
                      <li>📋 Plans Count: <Badge bg="success">{response.data.plans.length}</Badge></li>
                    )}
                    {response.data.discounts && Array.isArray(response.data.discounts) && (
                      <li>🏷️ Discounts Count: <Badge bg="warning">{response.data.discounts.length}</Badge></li>
                    )}
                    {response.data.message && (
                      <li>💬 Message: <em>{response.data.message}</em></li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Failed Request:</strong> 
                  <Badge bg={getMethodBadgeColor(error.requestMethod)} className="ms-2">
                    {error.requestMethod}
                  </Badge>
                  <br />
                  <code style={{ fontSize: '12px' }}>{error.requestUrl}</code>
                </Col>
                <Col md={6}>
                  <strong>Error Time:</strong> {error.timestamp}<br />
                  <strong>Error Type:</strong> {error.status ? 'HTTP Error' : 'Network Error'}
                </Col>
              </Row>

              <Alert variant="danger">
                <Alert.Heading>Error Details</Alert.Heading>
                <p><strong>Message:</strong> {error.message}</p>
                {error.status && <p><strong>Status:</strong> {error.status} {error.statusText}</p>}
              </Alert>

              {error.data && (
                <div className="mb-3">
                  <strong>Error Response:</strong>
                  <div className="bg-danger-subtle p-3 rounded mt-2" style={{ maxHeight: '300px', overflow: 'auto' }}>
                    <pre style={{ margin: 0, fontSize: '13px', lineHeight: '1.4' }}>
                      {JSON.stringify(error.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>🧪 API Tester</h1>
          <p className="text-muted mb-0">Test VedicVision Backend APIs - Authentication, Plans & Discounts</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Badge bg="info">Server: {baseURL}</Badge>
          <Badge bg={loading ? 'warning' : 'success'}>
            {loading ? '⏳ Testing...' : '✅ Ready'}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="text-center">
            <Col md={3}>
              <h4 className="text-primary">{authEndpoints.length}</h4>
              <small className="text-muted">Auth APIs</small>
            </Col>
            <Col md={3}>
              <h4 className="text-success">{planEndpoints.length}</h4>
              <small className="text-muted">Plan APIs</small>
            </Col>
            <Col md={3}>
              <h4 className="text-warning">{discountEndpoints.length}</h4>
              <small className="text-muted">Discount APIs</small>
            </Col>
            <Col md={3}>
              <h4 className="text-info">{authEndpoints.length + planEndpoints.length + discountEndpoints.length}</h4>
              <small className="text-muted">Total APIs</small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab 
          eventKey="auth" 
          title={
            <span>
              🔐 Authentication APIs 
              <Badge bg="primary" className="ms-2">{authEndpoints.length}</Badge>
            </span>
          }
        >
          {renderApiSection('auth', authEndpoint, authMethod, authBody, setAuthEndpoint, setAuthMethod, setAuthBody, authEndpoints)}
        </Tab>
        
        <Tab 
          eventKey="plans" 
          title={
            <span>
              📋 Plans APIs 
              <Badge bg="success" className="ms-2">{planEndpoints.length}</Badge>
            </span>
          }
        >
          {renderApiSection('plans', planEndpoint, planMethod, planBody, setPlanEndpoint, setPlanMethod, setPlanBody, planEndpoints)}
        </Tab>
        
        <Tab 
          eventKey="discounts" 
          title={
            <span>
              🏷️ Discounts APIs 
              <Badge bg="warning" className="ms-2">{discountEndpoints.length}</Badge>
            </span>
          }
        >
          {renderApiSection('discounts', discountEndpoint, discountMethod, discountBody, setDiscountEndpoint, setDiscountMethod, setDiscountBody, discountEndpoints)}
        </Tab>
      </Tabs>

      {/* Response Section */}
      {renderResponse()}

      {/* Help Section */}
      <Card className="mt-4">
        <Card.Header>
          <h6 className="mb-0">💡 API Testing Tips</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>🔐 Authentication APIs</h6>
              <ul className="small">
                <li>Use <code>POST /api/auth/login</code> first to get authentication cookies</li>
                <li>Admin endpoints require valid authentication</li>
                <li>Check <code>/api/auth/check-auth</code> to verify login status</li>
              </ul>
            </Col>
            <Col md={6}>
              <h6>📋 Plans & Discounts APIs</h6>
              <ul className="small">
                <li>Public plan endpoints don't require authentication</li>
                <li>Admin plan endpoints require authentication</li>
                <li>Use plan ID in URL for specific operations (e.g., <code>/api/plans/1</code>)</li>
              </ul>
            </Col>
          </Row>
          <hr />
          <div className="d-flex gap-3 flex-wrap">
            <Badge bg="primary">GET</Badge> <small>Retrieve data</small>
            <Badge bg="success">POST</Badge> <small>Create new records</small>
            <Badge bg="warning">PUT</Badge> <small>Update existing records</small>
            <Badge bg="danger">DELETE</Badge> <small>Remove records</small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ApiTester;

