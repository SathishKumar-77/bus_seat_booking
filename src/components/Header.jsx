import { Navbar, Container, Nav, Button } from 'react-bootstrap'
import { FaBus, FaChartLine, FaUser } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Header.css'

const Header = () => {
  const { user, logout } = useAuth()

  return (
    <Navbar expand="lg" className="main-header">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <FaBus className="logo-icon" />
          <span className="ms-2">BusExpress</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/cityselection">Book now</Nav.Link>
            <Nav.Link as={Link} to="/about">My Booking</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            {user?.role === 'ADMIN' && (
  <Nav.Link as={Link} to="/dashboard" className="admin-dashboard-link">
    <FaChartLine className="icon me-1" /> Admin Dashboard
  </Nav.Link>
)}

{user?.role === 'BUS_OPERATOR' && (
  <Nav.Link as={Link} to="/operator-dashboard" className="operator-dashboard-link">
    <FaChartLine className="icon me-1" /> Operator Dashboard
  </Nav.Link>



)}

{user?.role === 'USER' && (
  <Nav.Link as={Link} to="/user-dashboard" className="user-dashboard-link">
    <FaChartLine className="icon me-1" /> My Dashboard
  </Nav.Link>
)}

          </Nav>
          <Nav>
            {user ? (
              <div className="d-flex align-items-center">
                <span className="d-flex align-items-center me-3">
                  <FaUser className="user-icon me-1" />
                  {user.name}
                </span>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={logout}
                  className="logout-btn"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="login-link">
                  Login
                </Nav.Link>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="primary" 
                  size="sm" 
                  className="ms-2 register-btn"
                >
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header