import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Alert, Badge } from 'react-bootstrap';
import { FaTrash, FaDownload } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import '../styles/MyBookings.css';
import { constants } from 'crypto';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiGetBookings = `${import.meta.env.VITE_API_URL}/api/bookings/user/${user.id}`
  const apiGetBookingsById = `${import.meta.env.VITE_API_URL}/api/bookings/user/${user.id}`

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect to login if not authenticated
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch(apiGetBookings);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to cancel booking');
        await response.json(); // Consume the response to avoid unread body error
        const fetchBookings = async () => {
          const response = await fetch(apiGetBookingsById);
          if (!response.ok) throw new Error('Failed to refresh bookings');
          const data = await response.json();
          setBookings(data);
        };
        await fetchBookings();
        toast.success('Booking canceled successfully! Seats are now available.');
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const generatePDF = async (booking) => {
    console.log('Starting PDF generation for booking ID:', booking.id);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Skip background image temporarily to isolate the issue
    // const backgroundImg = new Image();
    // backgroundImg.src = '/images/background.jpg';
    // await new Promise(resolve => backgroundImg.onload = resolve);
    // doc.addImage(backgroundImg, 'JPEG', 0, 0, 210, 297, '', 'FAST', 0.1);

    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.width = '180mm';
    element.style.color = '#333';
    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        <h1 style="font-size: 24px; color: #007bff;">TravelCo Logo</h1>
        <p style="font-size: 12px; color: #666;">Your Trusted Travel Partner</p>
      </div>
      <div style="margin: 20px 0;">
        <h3 style="text-align: center; color: #007bff; margin-bottom: 15px;">Booking Receipt</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr>
            <td style="width: 30%; padding: 5px; border: 1px solid #ddd;"><strong>Booking ID:</strong></td>
            <td style="width: 70%; padding: 5px; border: 1px solid #ddd;">${booking.id}</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #ddd;"><strong>Bus:</strong></td>
            <td style="padding: 5px; border: 1px solid #ddd;">${booking.bus.name} (${booking.bus.routeFrom} to ${booking.bus.routeTo})</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #ddd;"><strong>Date:</strong></td>
            <td style="padding: 5px; border: 1px solid #ddd;">${new Date(booking.date).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #ddd;"><strong>Seats:</strong></td>
            <td style="padding: 5px; border: 1px solid #ddd;">${booking.seats.map(seat => seat.seatNumber).join(', ')}</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #ddd;"><strong>Passengers:</strong></td>
            <td style="padding: 5px; border: 1px solid #ddd;">
              <ul style="margin: 0; padding-left: 20px;">
                ${booking.passengers.map(passenger => `<li>${passenger.name} (${passenger.gender}, Age: ${passenger.age})</li>`).join('')}
              </ul>
            </td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #ddd;"><strong>Total Price:</strong></td>
            <td style="padding: 5px; border: 1px solid #ddd;">₹${booking.totalPrice}</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #ddd;"><strong>Status:</strong></td>
            <td style="padding: 5px; border: 1px solid #ddd;">${booking.status}</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #ddd;"><strong>User:</strong></td>
            <td style="padding: 5px; border: 1px solid #ddd;">${user.email}</td>
          </tr>
        </table>
        <div style="text-align: center; margin-top: 20px;" id="qrcode-${booking.id}"></div>
      </div>
    `;

    document.body.appendChild(element);

    // Generate QR code as an image
    const qrCodeData = `Booking ID: ${booking.id}, User: ${user.email}, Date: ${booking.date}, Total: ₹${booking.totalPrice}`;
    try {
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData, { width: 100 });
      const qrCodeImg = document.createElement('img');
      qrCodeImg.src = qrCodeUrl;
      qrCodeImg.style.width = '100px';
      qrCodeImg.style.height = '100px';
      document.getElementById(`qrcode-${booking.id}`).appendChild(qrCodeImg);

      // Wait for QR code image to load
      await new Promise(resolve => {
        qrCodeImg.onload = resolve;
        qrCodeImg.onerror = () => console.error('QR code image failed to load');
      });

      console.log('QR code loaded, capturing canvas...');
      const canvas = await html2canvas(element, { scale: 2 });
      console.log('Canvas captured, generating PDF...');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      console.log('PDF image added, saving...');
      doc.save(`receipt_booking_${booking.id}.pdf`);
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Check console for details.');
    } finally {
      document.body.removeChild(element);
    }
  };

  if (loading) return <Container>Loading...</Container>;
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;
  if (!user) return null; // Should never reach here due to redirect

  return (
    <Container className="bookings-container">
      <h2 className="text-center mb-4 text-primary fw-bold">My Bookings</h2>
      {bookings.length === 0 ? (
        <Alert variant="info" className="text-center py-4">
          <h4>No bookings found.</h4>
          <Button variant="outline-primary" onClick={() => navigate('/seat-selection')}>
            Book Now
          </Button>
        </Alert>
      ) : (
        <Row>
          <Col>
            <div className="bookings-table-wrapper">
              <Table striped bordered hover responsive className="bookings-table shadow-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <th>S.No</th>
                    <th>Booking ID</th>
                    <th>Bus</th>
                    <th>Date</th>
                    <th>Seats</th>
                    <th>Passengers</th>
                    <th>Total Price</th>
                    {/* <th>Status</th>
                    <th>Action</th> */}
                    <th>Receipt/Bill Copy</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <tr key={booking.id} className="align-middle">
                      <td className="text-center">{index + 1}</td>
                      <td>{booking.id}</td>
                      <td>
                        <span className="text-info fw-semibold">{booking.bus.name}</span>
                        <br />({booking.bus.routeFrom} to {booking.bus.routeTo})
                      </td>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                      <td>
                        {booking.seats.map(seat => (
                          <Badge key={seat.id} bg="secondary" className="me-2 mb-1">
                            {seat.seatNumber}
                          </Badge>
                        ))}
                      </td>
                      <td>
                        {booking.passengers.map(passenger => (
                          <p key={passenger.id} className="mb-1">
                            <span className="text-muted">{passenger.name}</span>
                            ({passenger.gender}, Age: {passenger.age})
                          </p>
                        ))}
                      </td>
                      <td className="text-success fw-bold">₹{booking.totalPrice}</td>
                      {/* <td>
                        {booking.status === 'canceled' ? (
                          <Badge bg="danger" className="px-3 py-2">Canceled</Badge>
                        ) : (
                          <Badge bg="success" className="px-3 py-2">Confirmed</Badge>
                        )}
                      </td>
                      <td>
                        {booking.status === 'confirmed' ? (
                          <Button
                            variant="danger"
                            size="sm"
                            className="d-flex align-items-center gap-2"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            <FaTrash /> Cancel
                          </Button>
                        ) : null}
                      </td> */}
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="d-flex align-items-center gap-2"
                          onClick={() => generatePDF(booking)}
                        >
                          <FaDownload /> Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default MyBookings;