import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Alert,
  Button,
  Row,
  Col,
  Badge,
  Modal,
  Form,
} from "react-bootstrap";
import { formSubmissionsAPI } from "../api/forms";

const FormSubmissionViewer = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingStatus, setEditingStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusEditId, setStatusEditId] = useState(null); // Track which row’s status is being edited

  useEffect(() => {
    fetchFormSubmissions();
  }, []);

  const fetchFormSubmissions = async () => {
    try {
      setLoading(true);
      const response = await formSubmissionsAPI.getAll();
      const submissionsData = response.data.data?.submissions || [];
      setSubmissions(submissionsData);
      setError("");
    } catch (err) {
      setError(
        "Failed to fetch form submissions: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortData = (data, field = sortField) => {
    return [...data].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "NULL";
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      case "processing":
        return <Badge bg="info">Processing</Badge>;
      case "completed":
        return <Badge bg="success">Completed</Badge>;
      case "cancelled":
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const parseJsonField = (jsonString) => {
    // If it's already an object, return it as is
    if (typeof jsonString === "object" && jsonString !== null) {
      return jsonString;
    }

    // If it's a string, try to parse it
    if (typeof jsonString === "string") {
      try {
        return JSON.parse(jsonString);
      } catch {
        return null;
      }
    }

    return null;
  };

  const showSubmissionDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);
  };

  const openEditModal = (submission) => {
    setSelectedSubmission(submission);
    setEditingNotes(submission.admin_notes || "");
    setEditingStatus(submission.status || "pending");
    setShowEditModal(true);
  };

  const handleUpdateSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      setUpdating(true);

      // Update notes if changed
      if (editingNotes !== selectedSubmission.admin_notes) {
        await formSubmissionsAPI.updateNotes(
          selectedSubmission.id,
          editingNotes
        );
      }

      // Update status if changed
      if (editingStatus !== selectedSubmission.status) {
        await formSubmissionsAPI.updateStatus(
          selectedSubmission.id,
          editingStatus
        );
      }

      // Update the submission in the list
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === selectedSubmission.id
            ? {
                ...sub,
                admin_notes: editingNotes,
                status: editingStatus,
                updated_at: new Date().toISOString(),
              }
            : sub
        )
      );

      setShowEditModal(false);
      setError("");
      setSuccessMessage("Submission updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(
        "Failed to update submission: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickStatusUpdate = async (submissionId, newStatus) => {
    try {
      await formSubmissionsAPI.updateStatus(submissionId, newStatus);

      // Update the submission in the list
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === submissionId
            ? {
                ...sub,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : sub
        )
      );

      setError("");
      setSuccessMessage(`Status updated to ${newStatus} successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(
        "Failed to update status: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const SortableHeader = ({ field, children }) => (
    <th
      onClick={() => handleSort(field)}
      style={{ cursor: "pointer", userSelect: "none" }}
      className={sortField === field ? "table-active" : ""}
    >
      {children}
      {sortField === field && (
        <span className="ms-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
      )}
    </th>
  );

  if (loading) {
    return <div className="text-center">Loading form submissions...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Form Submission Viewer</h1>
        <Button variant="outline-primary" onClick={fetchFormSubmissions}>
          Refresh Data
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      {/* Statistics Card */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Submission Statistics</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={2}>
              <div className="text-center">
                <h4 className="text-primary">{submissions.length}</h4>
                <small className="text-muted">Total Submissions</small>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-center">
                <h4 className="text-warning">
                  {submissions.filter((s) => s.status === "pending").length}
                </h4>
                <small className="text-muted">Pending</small>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-center">
                <h4 className="text-info">
                  {submissions.filter((s) => s.status === "processing").length}
                </h4>
                <small className="text-muted">Processing</small>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-center">
                <h4 className="text-success">
                  {submissions.filter((s) => s.status === "completed").length}
                </h4>
                <small className="text-muted">Completed</small>
              </div>
            </Col>

            <Col md={2}>
              <div className="text-center">
                <h4 className="text-danger">
                  {submissions.filter((s) => s.status === "cancelled").length}
                </h4>
                <small className="text-muted">Cancelled</small>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-center">
                <h4 className="text-info">
                  {
                    submissions.filter((s) => s.updated_at !== s.created_at)
                      .length
                  }
                </h4>
                <small className="text-muted">Updated</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Form Submissions Table */}
      <Card>
        <Card.Header>
          <h5>Form Submissions</h5>
          <small className="text-muted">
            Click column headers to sort - Click on any row to view detailed
            information
          </small>
        </Card.Header>
        <Card.Body>
          {submissions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No form submissions found.</p>
              <Button variant="outline-primary" onClick={fetchFormSubmissions}>
                Refresh Data
              </Button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <SortableHeader field="id">ID</SortableHeader>
                    <SortableHeader field="service_name">
                      Service
                    </SortableHeader>
                    <SortableHeader field="user_id">User ID</SortableHeader>
                    <th>Customer Name</th>
                    <th>Contact Info</th>
                    <SortableHeader field="status">Status</SortableHeader>
                    <SortableHeader field="submitted_at">
                      Submitted
                    </SortableHeader>
                    <SortableHeader field="created_at">Created</SortableHeader>
                    <SortableHeader field="updated_at">
                      Last Updated
                    </SortableHeader>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortData(submissions).map((submission) => {
                    const formData = parseJsonField(submission.form_data);
                    const contactInfo = parseJsonField(submission.contact_info);

                    return (
                      <tr
                        key={submission.id}
                        onClick={() => showSubmissionDetails(submission)}
                        style={{ cursor: "pointer" }}
                        className="table-hover"
                      >
                        <td>{submission.id}</td>
                        <td>
                          <Badge bg="primary">{submission.service_name}</Badge>
                        </td>
                        <td>{submission.user_id}</td>
                        <td>
                          {formData?.full_name || "N/A"}
                          <br />
                          <small className="text-muted">
                            {formData?.gender} • {formData?.marital_status}
                          </small>
                        </td>
                        <td>
                          <div>
                            <small>📧 {contactInfo?.email || "N/A"}</small>
                            <br />
                            <small>📱 {contactInfo?.mobile || "N/A"}</small>
                          </div>
                        </td>
                        <td
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatusEditId(
                              statusEditId === submission.id
                                ? null
                                : submission.id
                            );
                          }}
                        >
                          {statusEditId === submission.id ? (
                            <Form.Select
                              size="sm"
                              value={submission.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleQuickStatusUpdate(
                                  submission.id,
                                  e.target.value
                                );
                              }}
                              autoFocus
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </Form.Select>
                          ) : (
                            getStatusBadge(submission.status)
                          )}
                        </td>
                        <td>
                          <small>{formatDate(submission.submitted_at)}</small>
                        </td>
                        <td>
                          <small>{formatDate(submission.created_at)}</small>
                        </td>
                        <td>
                          <small>{formatDate(submission.updated_at)}</small>
                        </td>
                        <td>
                            <div className="d-flex gap-1">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showSubmissionDetails(submission);
                                }}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(submission);
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Submission Details - ID: {selectedSubmission?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSubmission && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Basic Information</h6>
                  <Table size="sm" borderless>
                    <tbody>
                      <tr>
                        <td>
                          <strong>Service:</strong>
                        </td>
                        <td>{selectedSubmission.service_name}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>User ID:</strong>
                        </td>
                        <td>{selectedSubmission.user_id}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Status:</strong>
                        </td>
                        <td>{getStatusBadge(selectedSubmission.status)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h6>Timestamps</h6>
                  <Table size="sm" borderless>
                    <tbody>
                      <tr>
                        <td>
                          <strong>Submitted:</strong>
                        </td>
                        <td>{formatDate(selectedSubmission.submitted_at)}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Created:</strong>
                        </td>
                        <td>{formatDate(selectedSubmission.created_at)}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Updated:</strong>
                        </td>
                        <td>{formatDate(selectedSubmission.updated_at)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>

              <hr />

              <h6>Form Data</h6>
              <Card className="mb-3">
                <Card.Body>
                  <pre className="mb-0" style={{ fontSize: "0.875rem" }}>
                    {JSON.stringify(
                      parseJsonField(selectedSubmission.form_data),
                      null,
                      2
                    )}
                  </pre>
                </Card.Body>
              </Card>

              <h6>Contact Information</h6>
              <Card className="mb-3">
                <Card.Body>
                  <pre className="mb-0" style={{ fontSize: "0.875rem" }}>
                    {JSON.stringify(
                      parseJsonField(selectedSubmission.contact_info),
                      null,
                      2
                    )}
                  </pre>
                </Card.Body>
              </Card>

              {selectedSubmission.admin_notes && (
                <>
                  <h6>Admin Notes</h6>
                  <Card className="mb-3">
                    <Card.Body>
                      <pre className="mb-0" style={{ fontSize: "0.875rem" }}>
                        {selectedSubmission.admin_notes}
                      </pre>
                    </Card.Body>
                  </Card>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Submission - ID: {selectedSubmission?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSubmission && (
            <div>
              <h6>Status</h6>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>

              <h6>Admin Notes</h6>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Add admin notes here..."
                />
              </Form.Group>

              <div className="mt-3">
                <h6>Current Submission Info</h6>
                <Table size="sm" borderless>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Service:</strong>
                      </td>
                      <td>{selectedSubmission.service_name}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Customer:</strong>
                      </td>
                      <td>
                        {parseJsonField(selectedSubmission.form_data)
                          ?.full_name || "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Status:</strong>
                      </td>
                      <td>{getStatusBadge(selectedSubmission.status)}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateSubmission}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Submission"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FormSubmissionViewer;
