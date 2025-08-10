import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Modal, Form, Alert, Badge, 
  Row, Col, InputGroup, Tabs, Tab 
} from 'react-bootstrap';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';

const API_BASE = import.meta.env.VITE_API_BASE_URL ;

const PlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlanForDiscount, setSelectedPlanForDiscount] = useState(null);

  // Form states
  const [planForm, setPlanForm] = useState({
    name: '',
    price: '',
    features: ['']
  });

  const [discountForm, setDiscountForm] = useState({
    discount_percentage: '',
    end_date: ''
  });

  useEffect(() => {
    fetchPlans();
    fetchDiscounts();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(API_BASE +'/plans/admin/all', {
        withCredentials: true
      });
      setPlans(response.data.plans || []);
    } catch (err) {
      setError('Failed to fetch plans: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await axios.get(API_BASE + '/plans/admin/discounts', {
        withCredentials: true
      });
      setDiscounts(response.data.discounts || []);
    } catch (err) {
      setError('Failed to fetch discounts: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const planData = {
        ...planForm,
        features: planForm.features.filter(f => f.trim() !== ''),
        price: parseFloat(planForm.price)
      };

      if (editingPlan) {
        await axios.put(API_BASE + `/plans/${editingPlan.id}`, planData, {
          withCredentials: true
        });
        setSuccess('Plan updated successfully!');
      } else {
        await axios.post(API_BASE + '/plans', planData, {
          withCredentials: true
        });
        setSuccess('Plan created successfully!');
      }

      setShowPlanModal(false);
      resetPlanForm();
      fetchPlans();
    } catch (err) {
      setError('Failed to save plan: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDiscountSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(API_BASE + `/plans/${selectedPlanForDiscount}/discount`, {
        discount_percentage: parseFloat(discountForm.discount_percentage),
        end_date: discountForm.end_date || null
      }, {
        withCredentials: true
      });

      setSuccess('Discount added successfully!');
      setShowDiscountModal(false);
      resetDiscountForm();
      fetchPlans();
      fetchDiscounts();
    } catch (err) {
      setError('Failed to add discount: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await axios.delete(API_BASE + `/plans/${planId}`, {
          withCredentials: true
        });
        setSuccess('Plan deleted successfully!');
        fetchPlans();
      } catch (err) {
        setError('Failed to delete plan: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleRemoveDiscount = async (planId) => {
    if (window.confirm('Are you sure you want to remove this discount?')) {
      try {
        await axios.delete(API_BASE + `/plans/${planId}/discount`, {
          withCredentials: true
        });
        setSuccess('Discount removed successfully!');
        fetchPlans();
        fetchDiscounts();
      } catch (err) {
        setError('Failed to remove discount: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const resetPlanForm = () => {
    setPlanForm({
      name: '',
      price: '',
      features: ['']
    });
    setEditingPlan(null);
  };

  const resetDiscountForm = () => {
    setDiscountForm({
      discount_percentage: '',
      end_date: ''
    });
    setSelectedPlanForDiscount(null);
  };

  const openEditPlan = (plan) => {
    setPlanForm({
      name: plan.name,
      price: plan.price.toString(),
      features: Array.isArray(plan.features) ? plan.features : [plan.features || '']
    });
    setEditingPlan(plan);
    setShowPlanModal(true);
  };

  const openAddDiscount = (planId) => {
    setSelectedPlanForDiscount(planId);
    setShowDiscountModal(true);
  };

  const addFeatureField = () => {
    setPlanForm({
      ...planForm,
      features: [...planForm.features, '']
    });
  };

  const removeFeatureField = (index) => {
    const newFeatures = planForm.features.filter((_, i) => i !== index);
    setPlanForm({
      ...planForm,
      features: newFeatures.length > 0 ? newFeatures : ['']
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...planForm.features];
    newFeatures[index] = value;
    setPlanForm({
      ...planForm,
      features: newFeatures
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDiscountedPrice = (price, discount) => {
    if (!discount) return price;
    return (price - (price * discount / 100)).toFixed(2);
  };

  if (loading) {
    return <div className="text-center">Loading plan management...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Plan Management</h1>
        {/* <Button variant="primary" onClick={() => setShowPlanModal(true)}>
          Add New Plan
        </Button> */}
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

      <Tabs defaultActiveKey="plans" className="mb-4">
        <Tab eventKey="plans" title="Plans">
          <Card>
            <Card.Header>
              <h5>All Plans ({plans.length})</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Discounted Price</th>
                    <th>Discount</th>
                    <th>Features</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td>{plan.id}</td>
                      <td><strong>{plan.name}</strong></td>
                      <td>₹{plan.price}</td>
                      <td>
                        {plan.discount ? (
                          <span className="text-success">
                            ₹{calculateDiscountedPrice(plan.price, plan.discount)}
                          </span>
                        ) : (
                          <span className="text-muted">No discount</span>
                        )}
                      </td>
                      <td>
                        {plan.discount ? (
                          <Badge bg="success">{plan.discount}% OFF</Badge>
                        ) : (
                          <Badge bg="secondary">No discount</Badge>
                        )}
                      </td>
                      <td>
                        <small>
                          {Array.isArray(plan.features) 
                            ? plan.features.join(', ') 
                            : plan.features || 'No features'
                          }
                        </small>
                      </td>
                      <td>
                        <Badge bg={plan.is_active ? 'success' : 'danger'}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openEditPlan(plan)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => openAddDiscount(plan.id)}
                            disabled={!!plan.discount}
                          >
                            {plan.discount ? 'Has Discount' : 'Add Discount'}
                          </Button>
                          {plan.discount && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleRemoveDiscount(plan.id)}
                            >
                              Remove Discount
                            </Button>
                          )}
                          {/* <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            Delete
                          </Button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="discounts" title="Discounts">
          <Card>
            <Card.Header>
              <h5>All Discounts ({discounts.length})</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Plan Name</th>
                    <th>Discount %</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((discount) => (
                    <tr key={discount.id}>
                      <td>{discount.id}</td>
                      <td><strong>{discount.plan_name}</strong></td>
                      <td>
                        <Badge bg="success">{discount.discount_percentage}%</Badge>
                      </td>
                      <td>{formatDate(discount.start_date)}</td>
                      <td>{formatDate(discount.end_date)}</td>
                      <td>
                        <Badge bg={discount.is_active ? 'success' : 'danger'}>
                          {discount.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveDiscount(discount.plan_id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Plan Modal */}
      <Modal show={showPlanModal} onHide={() => setShowPlanModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingPlan ? 'Edit Plan' : 'Add New Plan'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePlanSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Plan Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({...planForm, price: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Features *</Form.Label>
              {planForm.features.map((feature, index) => (
                <InputGroup key={index} className="mb-2">
                  <Form.Control
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    required
                  />
                  <Button
                    variant="outline-danger"
                    onClick={() => removeFeatureField(index)}
                    disabled={planForm.features.length === 1}
                  >
                    Remove
                  </Button>
                </InputGroup>
              ))}
              <Button variant="outline-primary" onClick={addFeatureField}>
                Add Feature
              </Button>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPlanModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Discount Modal */}
      <Modal show={showDiscountModal} onHide={() => setShowDiscountModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Discount</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleDiscountSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Discount Percentage (%) *</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="100"
                value={discountForm.discount_percentage}
                onChange={(e) => setDiscountForm({...discountForm, discount_percentage: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date (Optional)</Form.Label>
              <Form.Control
                type="datetime-local"
                value={discountForm.end_date}
                onChange={(e) => setDiscountForm({...discountForm, end_date: e.target.value})}
              />
              <Form.Text className="text-muted">
                Leave empty for no expiry date
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDiscountModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              Add Discount
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default (props) => (
  <ProtectedRoute>
    <PlanManagement {...props} />
  </ProtectedRoute>
);
