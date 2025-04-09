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
            {/* Home is visible for all users */}
            <Nav.Link as={Link} to="/">Home</Nav.Link>

            {/* USER specific links */}
            {user?.role === 'USER' && (
              <>
                <Nav.Link as={Link} to="/cityselection">Book now</Nav.Link>
                <Nav.Link as={Link} to="/my-bookings">My Booking</Nav.Link>
                {/* <Nav.Link as={Link} to="/user-dashboard" className="user-dashboard-link">
                  <FaChartLine className="icon me-1" /> My Dashboard
                </Nav.Link> */}
              </>
            )}

            {/* ADMIN specific link */}
            {/* {user?.role === 'ADMIN' && (
              <Nav.Link as={Link} to="/dashboard" className="admin-dashboard-link">
                <FaChartLine className="icon me-1" /> Admin Dashboard
              </Nav.Link>
            )} */}

            {/* BUS_OPERATOR specific link */}
            {user?.role === 'BUS_OPERATOR' && (
              <Nav.Link as={Link} to="/operator-dashboard" className="operator-dashboard-link">
                <FaChartLine className="icon me-1" /> Operator Dashboard
              </Nav.Link>
            )}
          </Nav>

          {/* User section: shows name and logout or login/register */}
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
