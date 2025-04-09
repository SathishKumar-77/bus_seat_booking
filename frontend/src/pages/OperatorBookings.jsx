import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Alert, Form, Badge, Pagination } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../styles/OperatorBookings.css';

const OperatorBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [busNameFilter, setBusNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('confirmed');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 10 rows per page

  useEffect(() => {
    if (!user || user.role !== 'BUS_OPERATOR') {
      navigate('/'); // Redirect to home if not an operator or not logged in
      return;
    }

    const fetchOperatorBookings = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/operator/${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch operator bookings');
        const data = await response.json();
        setBookings(data);
        setFilteredBookings(data); // Initialize filtered bookings
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOperatorBookings();
  }, [user, navigate]);

  // Filter bookings based on search and filter criteria
  useEffect(() => {
    let result = bookings;

    // Filter by search term (booking ID or passenger name)
    if (searchTerm) {
      result = result.filter(booking =>
        booking.id.toString().includes(searchTerm.toLowerCase()) ||
        booking.passengers.some(passenger =>
          passenger.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by date range
    if (startDate && endDate) {
      result = result.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate);
      });
    } else if (startDate) {
      result = result.filter(booking => new Date(booking.date) >= new Date(startDate));
    } else if (endDate) {
      result = result.filter(booking => new Date(booking.date) <= new Date(endDate));
    }

    // Filter by bus name
    if (busNameFilter) {
      result = result.filter(booking =>
        booking.bus.name.toLowerCase().includes(busNameFilter.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter) {
      result = result.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, startDate, endDate, busNameFilter, statusFilter, bookings]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  if (loading) return <Container>Loading...</Container>;
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;
  if (!user || user.role !== 'BUS_OPERATOR') return null;

  return (
    <Container className="operator-bookings-container">
      <h2 className="text-center mb-4">Operator Booking Notifications</h2>

      {/* Filter and Search Section */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group controlId="searchTerm">
            <Form.Label>Search (Booking ID or Passenger Name)</Form.Label>
            <Form.Control
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter ID or name"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="startDate">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="endDate">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="busNameFilter">
            <Form.Label>Bus Name</Form.Label>
            <Form.Control
              type="text"
              value={busNameFilter}
              onChange={(e) => setBusNameFilter(e.target.value)}
              placeholder="Enter bus name"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group controlId="statusFilter">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="canceled">Canceled</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {filteredBookings.length === 0 ? (
        <Alert variant="info">No bookings found for your buses.</Alert>
      ) : (
        <>
          <Row>
            <Col>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Bus</th>
                    <th>Date</th>
                    <th>Seats</th>
                    <th>Passengers</th>
                    <th>Booked By</th>
                    <th>Total Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(booking => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.bus.name} ({booking.bus.routeFrom} to {booking.bus.routeTo})</td>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                      <td>
                        {booking.seats.map(seat => (
                          <span key={seat.id} className="me-2">{seat.seatNumber}</span>
                        ))}
                      </td>
                      <td>
                        {booking.passengers.map(passenger => (
                          <p key={passenger.id}>
                            {passenger.name} ({passenger.gender}, Age: {passenger.age})
                          </p>
                        ))}
                      </td>
                      <td>
                        {booking.userId ? (
                          <Badge bg="info">
                            User ID: {booking.userId}
                            {/* {booking.user?.name || 'Unknown'} */}
                          </Badge>
                        ) : (
                          <Badge bg="warning">Anonymous</Badge>
                        )}
                      </td>
                      <td>₹{booking.totalPrice}</td>
                      <td>
                      {booking.status === 'cancelled' ?(
                        <Badge bg='danger'>
                        {booking.status}

                        </Badge>
                      ):(
                        <Badge bg='info'>
                        {booking.status}

                        </Badge>
                      )
                       
                     
                      }
                    
                      
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>

          {/* Pagination Controls */}
          <Row className="mt-4">
            <Col className="d-flex justify-content-center">
              <Pagination>
                <Pagination.Prev onClick={prevPage} disabled={currentPage === 1} />
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={nextPage} disabled={currentPage === totalPages} />
              </Pagination>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default OperatorBookings;