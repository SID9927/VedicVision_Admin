import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE_URL ;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    loggedInUsers: 0,
    serverStatus: 'Unknown'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Check server health
      const healthResponse = await axios.get(API_BASE +'/health');
      
      // Get all users
      const usersResponse = await axios.get(API_BASE +'/auth/admin/users');
      
      const users = usersResponse.data.users || [];

       // Debug: Log the actual user data received
      // console.log('📊 Raw user data received:', users);
      // console.log('📊 Sample user object:', users[0]);
      
      // Calculate statistics with proper field names
      const totalUsers = users.length;
      
      const activeUsers = users.filter(user => {
        // console.log(`User ${user.first_name}: is_active = ${user.is_active}, type = ${typeof user.is_active}`);
        return user.is_active === true;
      }).length;
      
      const loggedInUsers = users.filter(user => {
        // Handle missing last_activity_type field gracefully
        const activityType = user.last_activity_type || (user.is_active ? 'Currently Logged In' : 'Unknown');
        // console.log(`User ${user.first_name}: last_activity_type = "${activityType}"`);
        return activityType === 'Currently Logged In';
      }).length;


      const calculatedStats = {
        totalUsers,
        activeUsers,
        loggedInUsers,
        serverStatus: healthResponse.data ? 'Online' : 'Offline'
      };

      // console.log('📊 Calculated Dashboard Stats:', calculatedStats);
      setStats(calculatedStats);
      setError('');

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError('Failed to load dashboard data: ' + (error.response?.data?.message || error.message));
      setStats(prev => ({ ...prev, serverStatus: 'Offline' }));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading dashboard...</div>;
  }

   return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>VedicVision Admin Dashboard</h1>
        <button 
          className="btn btn-outline-primary"
          onClick={fetchDashboardData}
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Row>
        <Col md={3}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Server Status</Card.Title>
              <h3 className={stats.serverStatus === 'Online' ? 'text-success' : 'text-danger'}>
                {stats.serverStatus}
              </h3>
              <Badge bg={stats.serverStatus === 'Online' ? 'success' : 'danger'}>
                {stats.serverStatus === 'Online' ? 'Running' : 'Down'}
              </Badge>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Total Users</Card.Title>
              <h3 className="text-primary">{stats.totalUsers}</h3>
              <small className="text-muted">All registered users</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Currently Logged In</Card.Title>
              <h3 className="text-success">{stats.loggedInUsers}</h3>
              <small className="text-muted">Users with active sessions</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Active Accounts</Card.Title>
              <h3 className="text-info">{stats.activeUsers}</h3>
              <small className="text-muted">Accounts that have been used</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Alert variant="info">
        <Alert.Heading>Welcome to VedicVision Admin Panel</Alert.Heading>
        <p>
          This admin panel allows you to test APIs, manage users, and view database records.
          Use the navigation menu to access different sections.
        </p>
        <hr />
        <div className="d-flex justify-content-between">
          <span>
            <strong>Currently Logged In:</strong> Users with active login sessions ({stats.loggedInUsers})
          </span>
          <span>
            <strong>Active Accounts:</strong> Users who have logged in at least once ({stats.activeUsers})
          </span>
        </div>
      </Alert>
    </div>
  );
};

export default Dashboard;
