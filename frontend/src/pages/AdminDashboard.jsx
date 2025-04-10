// src/pages/admin/Dashboard.jsx
import { useState } from 'react'
import { Button, Card, ListGroup, Alert } from 'react-bootstrap'
import { FaKey, FaCopy, FaTrash } from 'react-icons/fa'


const AdminDashboard = () => {
  const [keys, setKeys] = useState([])
  const [newKey, setNewKey] = useState(null)
  const [error, setError] = useState(null)
  const token = localStorage.getItem('token') // or from context


  const apiUrl = `${import.meta.env.VITE_API_URL}/api/admin/generate-key`
  const generateKey = async () => {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // 👈 attach token
            }
          })
          

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to generate key')
      }

      const data = await response.json()
      setNewKey(data.key)
      setKeys([...keys, { key: data.key, createdAt: data.createdAt }])
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="admin-dashboard">
      <Card>
        <Card.Header>
          <h3>Operator Key Management</h3>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Button variant="primary" onClick={generateKey}>
            <FaKey className="me-2" /> Generate New Operator Key
          </Button>

          {newKey && (
            <Alert variant="success" className="mt-3">
              <div className="d-flex justify-content-between align-items-center">
                <strong>New Key: {newKey}</strong>
                <Button 
                  variant="outline-success" 
                  size="sm"
                  onClick={() => copyToClipboard(newKey)}
                >
                  <FaCopy /> Copy
                </Button>
              </div>
              <small className="text-muted">This key will be shown only once</small>
            </Alert>
          )}

          <h4 className="mt-4">Active Keys</h4>
          <ListGroup>
            {keys.map((key) => (
              <ListGroup.Item key={key.key} className="d-flex justify-content-between align-items-center">
                <div>
                  <code>{key.key}</code>
                  <div className="text-muted small">
                    Created: {new Date(key.createdAt).toLocaleString()}
                  </div>
                </div>
                <Button variant="outline-danger" size="sm">
                  <FaTrash />
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </div>
  )
}

export default AdminDashboard
