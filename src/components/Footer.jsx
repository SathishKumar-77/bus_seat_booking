import { Container, Row, Col } from 'react-bootstrap'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'
import '../styles/Footer.css'

const Footer = () => {
  return (
    <footer className="main-footer">
      <Container>
        <Row>
          <Col lg={4} className="mb-4 mb-lg-0">
            <h5>BusExpress</h5>
            <p>Your trusted partner for comfortable and safe bus travels across the country.</p>
            <div className="social-icons">
              <a href="#"><FaFacebook /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaLinkedin /></a>
            </div>
          </Col>
          <Col md={4} lg={2} className="mb-4 mb-md-0">
            <h6>Quick Links</h6>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/routes">Routes</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </Col>
          <Col md={4} lg={3} className="mb-4 mb-md-0">
            <h6>Services</h6>
            <ul>
              <li><a href="/booking">Online Booking</a></li>
              <li><a href="/tracking">Bus Tracking</a></li>
              <li><a href="/offers">Special Offers</a></li>
              <li><a href="/corporate">Corporate</a></li>
            </ul>
          </Col>
          <Col md={4} lg={3}>
            <h6>Contact Info</h6>
            <ul className="contact-info">
              <li>123 Bus Station Road</li>
              <li>City, Country 10001</li>
              <li>info@busexpress.com</li>
              <li>+1 234 567 8900</li>
            </ul>
          </Col>
        </Row>
        <Row className="footer-bottom">
          <Col className="text-center py-3">
            <p className="mb-0">&copy; {new Date().getFullYear()} BusExpress. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer