import { useEffect } from 'react'
import { Container, Row, Col, Button, Card } from 'react-bootstrap'
import { FaBus, FaSearch, FaTicketAlt, FaUserShield, FaRoute, FaStar } from 'react-icons/fa'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Header from '../components/Header'
import Footer from '../components/Footer'
import '../styles/Home.css'

const FeatureCard = ({ icon, title, description, delay }) => {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 }
      }}
      transition={{ duration: 0.6, delay }}
      className="feature-card"
    >
      <div className="feature-icon-wrapper">
        <div className="feature-icon">{icon}</div>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  )
}

const Home = () => {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  const popularRoutes = [
    { from: 'Chennai', to: 'Theni', price: '₹1200', duration: '6h' },
    { from: 'Theni', to: 'Chennai', price: '₹1000', duration: '5h' },
    { from: 'Periyakulam', to: 'Chennai', price: '₹1500', duration: '8h' },
    { from: 'Chennai', to: 'Periyakulam', price: '₹1100', duration: '7h' }
  ]

  return (
    <div className="home-page">

      {/* Animated Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="particles"></div>
        <Container>
          <Row className="align-items-center min-vh-80">
            <Col lg={6} className="hero-content">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h6 className="pre-title">WELCOME TO BUSEXPRESS</h6>
                <h1 className="display-3 fw-bold text-white mb-4">
                  <span className="text-highlight">Comfortable</span> Journeys
                  <br />Across Bangladesh
                </h1>
                <p className="lead text-white mb-4">
                  Book your bus tickets online in just a few clicks. Safe, secure and reliable service with 1000+ daily trips.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="btn-glow"
                  >
                    Book Now <FaTicketAlt className="ms-2" />
                  </Button>
                  <Button 
                    variant="outline-light" 
                    size="lg"
                    className="btn-border-glow"
                  >
                    Explore Routes <FaRoute className="ms-2" />
                  </Button>
                </div>
              </motion.div>
            </Col>
            <Col lg={6} className="hero-image-col">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="hero-bus-animation"
              >
                <div className="bus-image">
                  <div className="bus-window"></div>
                  <div className="bus-window"></div>
                  <div className="bus-window"></div>
                </div>
                <div className="road">
                  <div className="road-line"></div>
                </div>
                <div className="cloud cloud-1"></div>
                <div className="cloud cloud-2"></div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Animated Features Section */}
      <section className="features-section py-5">
        <Container>
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 20 }
            }}
            transition={{ duration: 0.6 }}
          >
            <h6 className="section-pre-title text-center">WHY CHOOSE US</h6>
            <h2 className="section-title text-center mb-5">Our Key Features</h2>
          </motion.div>
          <Row className="g-4">
            <Col md={6} lg={3}>
              <FeatureCard
                icon={<FaBus size={30} />}
                title="Wide Network"
                description="1000+ routes across the country with premium buses"
                delay={0.1}
              />
            </Col>
            <Col md={6} lg={3}>
              <FeatureCard
                icon={<FaSearch size={30} />}
                title="Easy Booking"
                description="Simple and intuitive interface for quick reservations"
                delay={0.2}
              />
            </Col>
            <Col md={6} lg={3}>
              <FeatureCard
                icon={<FaTicketAlt size={30} />}
                title="E-Tickets"
                description="Instant confirmation with mobile tickets"
                delay={0.3}
              />
            </Col>
            <Col md={6} lg={3}>
              <FeatureCard
                icon={<FaUserShield size={30} />}
                title="Safe Travel"
                description="Verified operators with safety measures"
                delay={0.4}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Popular Routes Section */}
      <section className="popular-routes py-5 bg-light">
        <Container>
          <div className="section-header text-center mb-5">
            <h6 className="section-pre-title">POPULAR ROUTES</h6>
            <h2 className="section-title">Frequently Traveled Routes</h2>
          </div>
          <Row className="g-4">
            {popularRoutes.map((route, index) => (
              <Col key={index} sm={6} lg={3}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="route-card h-100">
                    <Card.Body>
                      <div className="route-icon">
                        <FaRoute />
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">{route.from}</h5>
                        <div className="arrow-icon">→</div>
                        <h5 className="mb-0">{route.to}</h5>
                      </div>
                      <div className="route-details">
                        <div className="d-flex justify-content-between">
                          <span>Price:</span>
                          <strong>{route.price}</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Duration:</span>
                          <strong>{route.duration}</strong>
                        </div>
                      </div>
                      <Button variant="outline-primary" className="w-100 mt-3">
                        View Buses
                      </Button>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials py-5">
        <Container>
          <div className="section-header text-center mb-5">
            <h6 className="section-pre-title">TESTIMONIALS</h6>
            <h2 className="section-title">What Our Customers Say</h2>
          </div>
          <Row className="g-4">
            {[1, 2, 3].map((item) => (
              <Col key={item} md={4}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="testimonial-card h-100">
                    <Card.Body>
                      <div className="rating mb-3">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className="star" />
                        ))}
                      </div>
                      <Card.Text>
                        "Excellent service! The buses are always on time and comfortable. The booking process is super easy."
                      </Card.Text>
                      <div className="testimonial-author">
                        <div className="author-avatar"></div>
                        <div className="author-info">
                          <h6 className="mb-0">Customer Name</h6>
                          <small>Regular Traveler</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5 bg-primary text-white">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="mb-4">Ready for Your Next Journey?</h2>
                <p className="lead mb-4">Download our mobile app for exclusive offers and easier booking.</p>
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Button variant="light" size="lg" className="px-4">
                    iOS App
                  </Button>
                  <Button variant="outline-light" size="lg" className="px-4">
                    Android App
                  </Button>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

    </div>
  )
}

export default Home