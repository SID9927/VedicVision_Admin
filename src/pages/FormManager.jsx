import React, { useEffect, useState } from "react";
import { 
  Card, Table, Button, Modal, Form, Alert, Badge, 
  Row, Col, InputGroup, Tabs, Tab, Accordion 
} from 'react-bootstrap';
import { adminFormsAPI } from "../api/forms";

export default function FormManager() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewingForm, setViewingForm] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    service_name: '',
    display_name: '',
    description: '',
    form_fields: [],
    is_active: true
  });

  // Field types for dropdown
  const fieldTypes = [
    'text', 'email', 'tel', 'number', 'date', 'time', 
    'select', 'textarea', 'checkbox', 'radio'
  ];

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await adminFormsAPI.getAll();
      setForms(res.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch forms: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (form) => {
    setEditing(form);
    setFormData({
      service_name: form.service_name || '',
      display_name: form.display_name || '',
      description: form.description || '',
      form_fields: Array.isArray(form.form_fields) ? form.form_fields : [],
      is_active: form.is_active !== undefined ? form.is_active : true
    });
    setShowModal(true);
  };

  const handleView = (form) => {
    setViewingForm(form);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this form?")) {
      try {
        await adminFormsAPI.delete(id);
        setSuccess('Form deleted successfully!');
        fetchForms();
      } catch (err) {
        setError('Failed to delete form: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form fields
      const validFields = formData.form_fields.filter(field => 
        field.name && field.label && field.type
      );

      const submitData = {
        ...formData,
        form_fields: validFields
      };

      if (editing && editing.id) {
        await adminFormsAPI.update(editing.id, submitData);
        setSuccess('Form updated successfully!');
      } else {
        await adminFormsAPI.create(submitData);
        setSuccess('Form created successfully!');
      }
      
      setShowModal(false);
      resetForm();
      fetchForms();
    } catch (err) {
      setError('Failed to save form: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setFormData({
      service_name: '',
      display_name: '',
      description: '',
      form_fields: [],
      is_active: true
    });
    setEditing(null);
  };

  const addFormField = () => {
    setFormData({
      ...formData,
      form_fields: [
        ...formData.form_fields,
        {
          name: '',
          label: '',
          type: 'text',
          required: false,
          placeholder: '',
          options: []
        }
      ]
    });
  };

  const removeFormField = (index) => {
    const newFields = formData.form_fields.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      form_fields: newFields
    });
  };

  const updateFormField = (index, field, value) => {
    const newFields = [...formData.form_fields];
    newFields[index] = {
      ...newFields[index],
      [field]: value
    };
    setFormData({
      ...formData,
      form_fields: newFields
    });
  };

  const addFieldOption = (fieldIndex) => {
    const newFields = [...formData.form_fields];
    if (!newFields[fieldIndex].options) {
      newFields[fieldIndex].options = [];
    }
    newFields[fieldIndex].options.push('');
    setFormData({
      ...formData,
      form_fields: newFields
    });
  };

  const updateFieldOption = (fieldIndex, optionIndex, value) => {
    const newFields = [...formData.form_fields];
    newFields[fieldIndex].options[optionIndex] = value;
    setFormData({
      ...formData,
      form_fields: newFields
    });
  };

  const removeFieldOption = (fieldIndex, optionIndex) => {
    const newFields = [...formData.form_fields];
    newFields[fieldIndex].options = newFields[fieldIndex].options.filter((_, i) => i !== optionIndex);
    setFormData({
      ...formData,
      form_fields: newFields
    });
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

  if (loading) {
    return <div className="text-center">Loading form management...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Form Management</h1>
        <Button 
          variant="primary" 
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add New Form
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <h5>Dynamic Service Forms ({forms.length})</h5>
        </Card.Header>
        <Card.Body>
          {forms.length === 0 ? (
            <div className="text-center text-muted">No forms found</div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Service Name</th>
                  <th>Display Name</th>
                  <th>Description</th>
                  <th>Fields Count</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id}>
                    <td>{form.id}</td>
                    <td>
                      <code className="bg-light px-2 py-1 rounded">
                        {form.service_name}
                      </code>
                    </td>
                    <td><strong>{form.display_name}</strong></td>
                    <td>
                      <small className="text-muted">
                        {form.description ? 
                          (form.description.length > 50 ? 
                            form.description.substring(0, 50) + '...' : 
                            form.description
                          ) : 'No description'
                        }
                      </small>
                    </td>
                    <td>
                      <Badge bg="info">
                        {Array.isArray(form.form_fields) ? form.form_fields.length : 0} fields
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={form.is_active ? 'success' : 'danger'}>
                        {form.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <small>{formatDate(form.created_at)}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleView(form)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(form)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(form.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Edit/Add Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? 'Edit Form' : 'Add New Form'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Tabs defaultActiveKey="basic" className="mb-3">
              <Tab eventKey="basic" title="Basic Information">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Service Name (Key) *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.service_name}
                        onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                        placeholder="e.g., basic_kundli, vastu_consultation"
                        required
                      />
                      <Form.Text className="text-muted">
                        Unique identifier for the service (use lowercase with underscores)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Display Name *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.display_name}
                        onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                        placeholder="e.g., Basic Kundli Analysis"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe what this service offers..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                </Form.Group>
              </Tab>

              <Tab eventKey="fields" title={`Form Fields (${formData.form_fields.length})`}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Form Fields Configuration</h6>
                  <Button variant="success" onClick={addFormField}>
                    Add Field
                  </Button>
                </div>

                {formData.form_fields.length === 0 ? (
                  <div className="text-center text-muted p-4">
                    No fields added yet. Click "Add Field" to start building your form.
                  </div>
                ) : (
                  <Accordion>
                    {formData.form_fields.map((field, index) => (
                      <Accordion.Item key={index} eventKey={index.toString()}>
                        <Accordion.Header>
                          <div className="d-flex justify-content-between align-items-center w-100 me-3">
                            <span>
                              <strong>{field.label || `Field ${index + 1}`}</strong>
                              <Badge bg="secondary" className="ms-2">{field.type}</Badge>
                              {field.required && <Badge bg="danger" className="ms-1">Required</Badge>}
                            </span>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Field Name (Key) *</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={field.name || ''}
                                  onChange={(e) => updateFormField(index, 'name', e.target.value)}
                                  placeholder="e.g., full_name, date_of_birth"
                                  required
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Field Label *</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={field.label || ''}
                                  onChange={(e) => updateFormField(index, 'label', e.target.value)}
                                  placeholder="e.g., Full Name, Date of Birth"
                                  required
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Field Type *</Form.Label>
                                <Form.Select
                                  value={field.type || 'text'}
                                  onChange={(e) => updateFormField(index, 'type', e.target.value)}
                                >
                                  {fieldTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                                                      ))}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Placeholder Text</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={field.placeholder || ''}
                                  onChange={(e) => updateFormField(index, 'placeholder', e.target.value)}
                                  placeholder="Placeholder text for the field"
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              label="Required Field"
                              checked={field.required || false}
                              onChange={(e) => updateFormField(index, 'required', e.target.checked)}
                            />
                          </Form.Group>

                          {/* Options for select, checkbox, radio fields */}
                          {(['select', 'checkbox', 'radio'].includes(field.type)) && (
                            <Form.Group className="mb-3">
                              <Form.Label>Options</Form.Label>
                              {(field.options || []).map((option, optionIndex) => (
                                <InputGroup key={optionIndex} className="mb-2">
                                  <Form.Control
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateFieldOption(index, optionIndex, e.target.value)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  <Button
                                    variant="outline-danger"
                                    onClick={() => removeFieldOption(index, optionIndex)}
                                  >
                                    Remove
                                  </Button>
                                </InputGroup>
                              ))}
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => addFieldOption(index)}
                              >
                                Add Option
                              </Button>
                            </Form.Group>
                          )}

                          <div className="d-flex justify-content-end">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeFormField(index)}
                            >
                              Remove Field
                            </Button>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                )}
              </Tab>

              <Tab eventKey="preview" title="Preview">
                <div className="border rounded p-3 bg-light">
                                    <h5 className="text-center mb-3">{formData.display_name || 'Form Preview'}</h5>
                  {formData.description && (
                    <p className="text-center text-muted mb-4">{formData.description}</p>
                  )}
                  
                  {formData.form_fields.length === 0 ? (
                    <div className="text-center text-muted">
                      No fields to preview. Add some fields first.
                    </div>
                  ) : (
                    <div className="row">
                      {formData.form_fields.map((field, index) => (
                        <div key={index} className={`mb-3 ${field.type === 'textarea' ? 'col-12' : 'col-md-6'}`}>
                          <label className="form-label">
                            {field.label} {field.required && <span className="text-danger">*</span>}
                          </label>
                          {field.type === 'text' && (
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder={field.placeholder}
                              disabled 
                            />
                          )}
                          {field.type === 'email' && (
                            <input 
                              type="email" 
                              className="form-control" 
                              placeholder={field.placeholder}
                              disabled 
                            />
                          )}
                          {field.type === 'tel' && (
                            <input 
                              type="tel" 
                              className="form-control" 
                              placeholder={field.placeholder}
                              disabled 
                            />
                          )}
                          {field.type === 'number' && (
                            <input 
                              type="number" 
                              className="form-control" 
                              placeholder={field.placeholder}
                              disabled 
                            />
                          )}
                          {field.type === 'date' && (
                            <input 
                              type="date" 
                              className="form-control" 
                              disabled 
                            />
                          )}
                          {field.type === 'time' && (
                            <input 
                              type="time" 
                              className="form-control" 
                              disabled 
                            />
                          )}
                          {field.type === 'select' && (
                            <select className="form-select" disabled>
                              <option>{field.placeholder || `Select ${field.label}`}</option>
                              {(field.options || []).map((option, idx) => (
                                <option key={idx} value={option}>{option}</option>
                              ))}
                            </select>
                          )}
                          {field.type === 'textarea' && (
                            <textarea 
                              className="form-control" 
                              rows="3" 
                              placeholder={field.placeholder}
                              disabled
                            ></textarea>
                          )}
                          {field.type === 'checkbox' && (
                            <div>
                              {(field.options || []).map((option, idx) => (
                                <div key={idx} className="form-check">
                                  <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    disabled 
                                  />
                                  <label className="form-check-label">{option}</label>
                                </div>
                              ))}
                            </div>
                          )}
                          {field.type === 'radio' && (
                            <div>
                              {(field.options || []).map((option, idx) => (
                                <div key={idx} className="form-check">
                                  <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name={`preview_${field.name}`}
                                    disabled 
                                  />
                                  <label className="form-check-label">{option}</label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editing ? 'Update Form' : 'Create Form'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Form Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>View Form Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewingForm && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Basic Information</h6>
                  <p><strong>ID:</strong> {viewingForm.id}</p>
                  <p><strong>Service Name:</strong> <code>{viewingForm.service_name}</code></p>
                  <p><strong>Display Name:</strong> {viewingForm.display_name}</p>
                  <p><strong>Status:</strong> 
                    <Badge bg={viewingForm.is_active ? 'success' : 'danger'} className="ms-2">
                      {viewingForm.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                </Col>
                <Col md={6}>
                  <h6>Metadata</h6>
                  <p><strong>Created:</strong> {formatDate(viewingForm.created_at)}</p>
                  <p><strong>Updated:</strong> {formatDate(viewingForm.updated_at)}</p>
                  <p><strong>Fields Count:</strong> 
                    <Badge bg="info" className="ms-2">
                      {Array.isArray(viewingForm.form_fields) ? viewingForm.form_fields.length : 0}
                    </Badge>
                  </p>
                </Col>
              </Row>

              {viewingForm.description && (
                <div className="mb-4">
                  <h6>Description</h6>
                  <p className="text-muted">{viewingForm.description}</p>
                </div>
              )}

              <div className="mb-4">
                <h6>Form Fields</h6>
                {Array.isArray(viewingForm.form_fields) && viewingForm.form_fields.length > 0 ? (
                  <Table responsive size="sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Label</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th>Options</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingForm.form_fields.map((field, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td><code>{field.name}</code></td>
                          <td>{field.label}</td>
                          <td>
                            <Badge bg="secondary">{field.type}</Badge>
                          </td>
                          <td>
                            {field.required ? (
                              <Badge bg="danger">Required</Badge>
                            ) : (
                              <Badge bg="light" text="dark">Optional</Badge>
                            )}
                          </td>
                          <td>
                            {field.options && field.options.length > 0 ? (
                              <small>{field.options.join(', ')}</small>
                            ) : (
                              <small className="text-muted">No options</small>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center text-muted">No fields configured</div>
                )}
              </div>

              {/* JSON View for developers */}
              <div className="mb-4">
                <h6>Raw JSON Data</h6>
                <pre className="bg-light p-3 rounded" style={{fontSize: '12px', maxHeight: '200px', overflow: 'auto'}}>
                  {JSON.stringify(viewingForm.form_fields, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          {viewingForm && (
            <Button variant="primary" onClick={() => {
              setShowViewModal(false);
              handleEdit(viewingForm);
            }}>
              Edit This Form
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
