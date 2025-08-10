import React, { useState } from "react";
import { Container, Navbar, Nav, Button, Dropdown } from "react-bootstrap";
import { AdminProvider, useAdmin } from "./context/AdminContext";
import AdminLogin from "./components/AdminLogin";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import DatabaseViewer from "./pages/DatabaseViewer";
import PlanManagement from "./pages/PlanManagement";
import FormManager from './pages/FormManager';
import FormSubmissionViewer from './pages/FormSubmissionViewer'; 

const AdminPanel = () => {
  const { adminUser, loading, loginAdmin, logoutAdmin, isAuthenticated } =
    useAdmin();
  const [currentPage, setCurrentPage] = useState("dashboard");

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={loginAdmin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      // case "api-tester":
      //   return <ApiTester />;
      case "users":
        return <UserManagement />;
      // case "database":
      //   return <DatabaseViewer />;
      case "plans":
        return <PlanManagement />;
      case "forms":
        return <FormManager />;
      case "form-submissions":
        return <FormSubmissionViewer />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      {/* Admin Navigation */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>VedicVision Admin Panel</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Button
                variant={
                  currentPage === "dashboard" ? "primary" : "outline-light"
                }
                className="me-2"
                onClick={() => setCurrentPage("dashboard")}
              >
                Dashboard
              </Button>
              {/* <Button
                variant={
                  currentPage === "api-tester" ? "primary" : "outline-light"
                }
                className="me-2"
                onClick={() => setCurrentPage("api-tester")}
              >
                API Tester
              </Button> */}
              <Button
                variant={currentPage === "users" ? "primary" : "outline-light"}
                className="me-2"
                onClick={() => setCurrentPage("users")}
              >
                User Management
              </Button>
              <Button
                variant={currentPage === "plans" ? "primary" : "outline-light"}
                className="me-2"
                onClick={() => setCurrentPage("plans")}
              >
                Plan Management
              </Button>
              {/* <Button 
                variant={currentPage === 'forms' ? 'primary' : 'outline-light'}
                className="me-2"
                onClick={() => setCurrentPage('forms')}
              >
                Form Management
              </Button> */}
              {/* <Button
                variant={
                  currentPage === "database" ? "primary" : "outline-light"
                }
                className="me-2"
                onClick={() => setCurrentPage("database")}
              >
                Database Viewer
              </Button> */}
              <Button
                variant={
                  currentPage === "form-submissions" ? "primary" : "outline-light"
                }
                className="me-2"
                onClick={() => setCurrentPage("form-submissions")}
              >
                Form Submissions
              </Button>
            </Nav>

            {/* Admin User Info */}
            <Nav>
              <Dropdown>
                <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                  👤 {adminUser.first_name} (Admin)
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={logoutAdmin}>🚪 Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container fluid className="mt-4">
        {renderPage()}
      </Container>
    </div>
  );
};

function App() {
  return (
    <AdminProvider>
      <AdminPanel />
    </AdminProvider>
  );
}

export default App;
