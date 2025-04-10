import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Badge } from 'react-bootstrap';
import { FaCreditCard, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';
import '../styles/Billing.css';

const Billing = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { busId, selectedSeats, passengerDetails, totalPrice, selectedDate, busData, userId } = state || {};
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [bookingId, setBookingId] = useState(null);

  const apiUrl = `${import.meta.env.VITE_API_URL}/api/bookings`
  const apiUrlDelete = `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`


  useEffect(() => {
    if (!state) {
      navigate('/seat-selection');
    }
  }, [state, navigate]);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const createBooking = async () => {
    if (bookingId) return bookingId; // Return existing bookingId if already created

    const bookingData = {
      busId,
      totalPrice,
      seats: selectedSeats.map(seat => seat.id),
      passengers: passengerDetails.map(passenger => ({
        name: passenger.name,
        gender: passenger.gender,
        age: parseInt(passenger.age) // Ensure age is a number
      })),
      date: selectedDate,
      userId // Pass userId from state
    };

    console.log('Sending booking data:', bookingData); // Debug log

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }
      const data = await response.json();
      setBookingId(data.id); // Store the booking ID
      return data.id;
    } catch (error) {
      console.error('Booking error:', error);
      throw error;
    }
  };

  const simulatePayment = async (method) => {
    setProcessing(true);
    setPaymentStatus(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        const isSuccess = Math.random() > 0.2; // 80% success rate
        resolve(isSuccess);
      }, 2000); // 2-second delay
    });
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      setPaymentStatus({ type: 'danger', message: 'Please select a payment method' });
      return;
    }

    try {
      const bookingId = await createBooking();
      const paymentSuccess = await simulatePayment(paymentMethod);

      if (paymentSuccess) {
        setPaymentStatus({ type: 'success', message: 'Payment successful! Booking confirmed.' });
        // Navigate to confirmation page or update state
        setTimeout(() => navigate('/my-bookings', { state: { bookingId } }), 2000);
      } else {
        setPaymentStatus({ type: 'danger', message: 'Payment failed. Please try again.' });
        // Optionally cancel booking on failure
        await fetch(apiUrlDelete, { method: 'DELETE' });
      }
    } catch (error) {
      setPaymentStatus({ type: 'danger', message: `Payment error: ${error.message}` });
      console.error('Payment error:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (!state) return <Container>Loading...</Container>;

  return (
    <Container className="billing-container">
      <h2 className="text-center mb-4">Billing & Payment</h2>

      <Row>
        {/* Booking Summary */}
        <Col md={8}>
          <div className="summary-card">
            <h4>Booking Summary</h4>
            <p><strong>Bus:</strong> {busData.name} ({busData.routeFrom} to {busData.routeTo})</p>
            <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
            <h5>Selected Seats:</h5>
            <div className="selected-seats">
              {selectedSeats.map(seat => (
                <Badge key={seat.id} bg="primary" className="me-2 mb-2">
                  {seat.seatNumber} ({seat.type}) - ₹{seat.price}
                </Badge>
              ))}
            </div>
            <h5>Total Price: ₹{totalPrice}</h5>
            <h5>Passenger Details:</h5>
            {passengerDetails.map((passenger, index) => (
              <p key={index}>
                <strong>Seat {passenger.seatNumber}:</strong> {passenger.name}, {passenger.gender}, Age: {passenger.age}
              </p>
            ))}
          </div>
        </Col>

        {/* Payment Section */}
        <Col md={4}>
          <div className="payment-card">
            <h4>Payment Method</h4>
            <Form>
              <div className="mb-3">
                <Form.Check
                  type="radio"
                  label={<><FaCreditCard className="me-2" />Credit/Debit Card</>}
                  name="paymentMethod"
                  value="card"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  checked={paymentMethod === 'card'}
                />
                {paymentMethod === 'card' && (
                  <div className="card-details mt-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Card Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="number"
                        value={cardDetails.number}
                        onChange={handleCardChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                      />
                    </Form.Group>
                    <Row>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Expiry Date</Form.Label>
                          <Form.Control
                            type="text"
                            name="expiry"
                            value={cardDetails.expiry}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                                                    </Form.Group>

                        </Col>
                        <Col>
                          <Form.Group className="mb-3">
                            <Form.Label>CVV</Form.Label>
                            <Form.Control
                              type="text"
                              name="cvv"
                              value={cardDetails.cvv}
                              onChange={handleCardChange}
                              placeholder="123"
                              maxLength="4"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  )}
              </div>
              <div className="mb-3">
                <Form.Check
                  type="radio"
                  label={<><FaMoneyBillWave className="me-2" />Cash on Delivery (COD)</>}
                  name="paymentMethod"
                  value="cod"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  checked={paymentMethod === 'cod'}
                />
              </div>
              <Button
                variant="primary"
                onClick={handlePayment}
                disabled={processing}
                className="w-100"
              >
                {processing ? (
                  <>
                    <FaSpinner className="spinner" /> Processing...
                  </>
                ) : 'Pay Now'}
              </Button>
            </Form>
            {paymentStatus && (
              <Alert variant={paymentStatus.type} className="mt-3">
                {paymentStatus.message}
              </Alert>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Billing;