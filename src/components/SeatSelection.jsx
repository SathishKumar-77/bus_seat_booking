// components/SeatSelection.jsx
import React, { useState, useEffect } from 'react';
import { Tab, Tabs, Container, Button, Badge, Row, Col, Form } from 'react-bootstrap';
import { FaChair, FaBed, FaUserAlt, FaArrowRight, FaTimes, FaCheck } from 'react-icons/fa';
import '../styles/SeatSelection.css';

const SeatSelection = ({ busId, navigate }) => {
  const [busData, setBusData] = useState(null);
  const [seatLayout, setSeatLayout] = useState(null);
  const [activeTab, setActiveTab] = useState('upper');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const response = await fetch(`/api/bus/${busId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bus data');
        }
        const data = await response.json();
        setBusData(data);
        const layout = generateSeatLayout(mapBusType(data), data.seats);
        setSeatLayout(layout);
        setActiveTab(layout.upper ? 'upper' : 'lower');
      } catch (err) {
        setError(err.message);
        console.error('Error fetching bus data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusData();
  }, [busId]);

  // Map bus type from database to one of the predefined configurations
  const mapBusType = (bus) => {
    const seatCount = bus.seatCount;
    const hasSleeper = bus.seats.some(seat => seat.type === 'sleeper');
    
    if (seatCount === 28 && !hasSleeper) {
      return '28_seater_only';
    } else if (seatCount === 42 && hasSleeper) {
      return '14_sleeper_28_seater';
    } else if (seatCount === 28 && hasSleeper) {
      return '14_sleeper_14_sleeper';
    }
    return '28_seater_only'; // Default fallback
  };

  const generateSeatLayout = (type, dbSeats) => {
    const seatMap = new Map(dbSeats.map(seat => [seat.seatNumber, seat]));

    if (type === '28_seater_only') {
      const lowerDeck = [];
      for (let row = 1; row <= 7; row++) {
        const rowSeats = [];
        for (let col = 0; col < 4; col++) {
          const seatNumber = `${row}${String.fromCharCode(65 + col)}`;
          const dbSeat = seatMap.get(`L${seatNumber}`) || {};
          rowSeats.push({
            id: dbSeat.id || `L-${seatNumber}`,
            number: seatNumber,
            type: 'standard',
            status: dbSeat.id ? (dbSeat.status || 'available') : 'available',
            price: dbSeat.price || 500,
            deck: 'lower',
            position: col < 2 ? 'left' : 'right'
          });
        }
        lowerDeck.push(rowSeats);
      }
      return { lower: lowerDeck };
    } 
    else if (type === '14_sleeper_28_seater') {
      const upperDeck = [];
      for (let row = 1; row <= 5; row++) {
        const rowSeats = [];
        if (row <= 4) {
          const seatNumber = `U${row}A`;
          const dbSeat = seatMap.get(seatNumber) || {};
          rowSeats.push({
            id: dbSeat.id || `U-${seatNumber}`,
            number: seatNumber,
            type: 'sleeper',
            status: dbSeat.id ? (dbSeat.status || 'available') : 'available',
            price: dbSeat.price || 800,
            deck: 'upper',
            position: 'left'
          });
        } else {
          rowSeats.push(null);
        }
        for (let col = 1; col <= 2; col++) {
          const seatNumber = `U${row}${String.fromCharCode(65 + col)}`;
          const dbSeat = seatMap.get(seatNumber) || {};
          rowSeats.push({
            id: dbSeat.id || `U-${seatNumber}`,
            number: seatNumber,
            type: 'sleeper',
            status: dbSeat.id ? (dbSeat.status || 'available') : 'available',
            price: dbSeat.price || 800,
            deck: 'upper',
            position: 'right'
          });
        }
        upperDeck.push(rowSeats);
      }

      const lowerDeck = [];
      for (let row = 1; row <= 7; row++) {
        const rowSeats = [];
        for (let col = 0; col < 4; col++) {
          const seatNumber = `L${row}${String.fromCharCode(65 + col)}`;
          const dbSeat = seatMap.get(seatNumber) || {};
          rowSeats.push({
            id: dbSeat.id || `L-${seatNumber}`,
            number: seatNumber,
            type: 'standard',
            status: dbSeat.id ? (dbSeat.status || 'available') : 'available',
            price: dbSeat.price || 500,
            deck: 'lower',
            position: col < 2 ? 'left' : 'right'
          });
        }
        lowerDeck.push(rowSeats);
      }
      return { upper: upperDeck, lower: lowerDeck };
    } 
    else if (type === '14_sleeper_14_sleeper') {
      const upperDeck = [];
      const lowerDeck = [];
      
      for (let row = 1; row <= 5; row++) {
        const upperRowSeats = [];
        const lowerRowSeats = [];
        
        if (row <= 4) {
          const upperSeatNumber = `U${row}A`;
          const lowerSeatNumber = `L${row}A`;
          const upperDbSeat = seatMap.get(upperSeatNumber) || {};
          const lowerDbSeat = seatMap.get(lowerSeatNumber) || {};
          
          upperRowSeats.push({
            id: upperDbSeat.id || `U-${upperSeatNumber}`,
            number: upperSeatNumber,
            type: 'sleeper',
            status: upperDbSeat.id ? (upperDbSeat.status || 'available') : 'available',
            price: upperDbSeat.price || 800,
            deck: 'upper',
            position: 'left'
          });
          lowerRowSeats.push({
            id: lowerDbSeat.id || `L-${lowerSeatNumber}`,
            number: lowerSeatNumber,
            type: 'sleeper',
            status: lowerDbSeat.id ? (lowerDbSeat.status || 'available') : 'available',
            price: lowerDbSeat.price || 800,
            deck: 'lower',
            position: 'left'
          });
        } else {
          upperRowSeats.push(null);
          lowerRowSeats.push(null);
        }
        
        for (let col = 1; col <= 2; col++) {
          const upperSeatNumber = `U${row}${String.fromCharCode(65 + col)}`;
          const lowerSeatNumber = `L${row}${String.fromCharCode(65 + col)}`;
          const upperDbSeat = seatMap.get(upperSeatNumber) || {};
          const lowerDbSeat = seatMap.get(lowerSeatNumber) || {};
          
          upperRowSeats.push({
            id: upperDbSeat.id || `U-${upperSeatNumber}`,
            number: upperSeatNumber,
            type: 'sleeper',
            status: upperDbSeat.id ? (upperDbSeat.status || 'available') : 'available',
            price: upperDbSeat.price || 800,
            deck: 'upper',
            position: 'right'
          });
          lowerRowSeats.push({
            id: lowerDbSeat.id || `L-${lowerSeatNumber}`,
            number: lowerSeatNumber,
            type: 'sleeper',
            status: lowerDbSeat.id ? (lowerDbSeat.status || 'available') : 'available',
            price: lowerDbSeat.price || 800,
            deck: 'lower',
            position: 'right'
          });
        }
        
        upperDeck.push(upperRowSeats);
        lowerDeck.push(lowerRowSeats);
      }
      
      return { upper: upperDeck, lower: lowerDeck };
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked') return;

    setSelectedSeats(prev => {
      if (prev.some(s => s.id === seat.id)) {
        return prev.filter(s => s.id !== seat.id);
      }
      return [...prev, seat];
    });
  };

  const isSeatSelected = (seatId) => selectedSeats.some(s => s.id === seatId);

  const handlePassengerDetailChange = (index, field, value) => {
    const newDetails = [...passengerDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setPassengerDetails(newDetails);
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    const details = selectedSeats.map(seat => ({
      seatId: seat.id,
      seatNumber: seat.number,
      name: '',
      gender: 'male',
      age: ''
    }));

    setPassengerDetails(details);
    setShowPassengerForm(true);
  };

  const handleConfirmBooking = async () => {
    const isValid = passengerDetails.every(detail => 
      detail.name.trim() !== '' && detail.age.trim() !== ''
    );

    if (!isValid) {
      alert('Please fill all passenger details');
      return;
    }

    try {
      const bookingData = {
        busId,
        seats: selectedSeats.map(seat => seat.id),
        passengers: passengerDetails,
        totalPrice: selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      alert(`${selectedSeats.length} seat(s) booked successfully!`);
      navigate('/'); // Redirect to home or confirmation page
    } catch (error) {
      console.error('Booking error:', error);
      alert('Error confirming booking');
    }
  };

  const renderSeatIcon = (seat) => {
    if (seat.status === 'booked') {
      return <FaTimes className="seat-icon booked" />;
    }

    return seat.type === 'sleeper' ? (
      <div className={`sleeper-seat ${isSeatSelected(seat.id) ? 'selected' : 'available'}`}>
        <FaBed className="seat-icon" />
      </div>
    ) : (
      <div className={`standard-seat ${isSeatSelected(seat.id) ? 'selected' : 'available'}`}>
        <FaChair className="seat-icon" />
      </div>
    );
  };

  const renderDeck = (deck) => {
    if (!seatLayout || !seatLayout[deck]) return null;

    return (
      <div className="deck-container">
        <div className="bus-front">
          <div className="driver-area">
            <FaUserAlt className="driver-icon" />
            <span>Driver</span>
          </div>
        </div>
        
        <div className="seat-grid">
          {seatLayout[deck].map((row, rowIndex) => (
            <div key={rowIndex} className="seat-row">
              {row.map((seat) => (
                seat ? (
                  <div
                    key={seat.id}
                    className={`seat ${seat.type} ${seat.status} ${isSeatSelected(seat.id) ? 'selected' : ''}`}
                    onClick={() => handleSeatClick(seat)}
                  >
                    {renderSeatIcon(seat)}
                    <div className="seat-number">{seat.number}</div>
                    <div className="seat-price">৳{seat.price}</div>
                    {isSeatSelected(seat.id) && <FaCheck className="selected-check" />}
                  </div>
                ) : (
                  <div key={`empty-${rowIndex}`} className="empty-space"></div>
                )
              ))}
            </div>
          ))}
        </div>
        
        <div className="bus-rear">
          <div className="exit-door">
            <FaArrowRight className="exit-icon" />
            <span>Exit</span>
          </div>
        </div>
      </div>
    );
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (loading) return <Container>Loading...</Container>;
  if (error) return <Container>Error: {error}</Container>;

  return (
    <Container className="seat-booking-container">
      <h2 className="text-center mb-4">
        {busData ? `${busData.name} - ${busData.routeFrom} to ${busData.routeTo}` : 'Bus Seat Selection'}
      </h2>

      {seatLayout?.upper && (
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3 deck-tabs"
        >
          <Tab eventKey="upper" title={<><FaBed className="me-2" />Upper Deck</>}>
            {renderDeck('upper')}
          </Tab>
          <Tab eventKey="lower" title={<><FaChair className="me-2" />Lower Deck</>}>
            {renderDeck('lower')}
          </Tab>
        </Tabs>
      )}

      {!seatLayout?.upper && renderDeck('lower')}

      <div className="selection-summary mt-4">
        <h4>Booking Summary</h4>
        <div className="selected-seats mb-3">
          <h5>Selected Seats ({selectedSeats.length}):</h5>
          {selectedSeats.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {selectedSeats.map(seat => (
                <Badge key={seat.id} bg="primary" className="seat-badge">
                  {seat.number} ({seat.type}) - ৳{seat.price}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted">No seats selected</p>
          )}
        </div>

        {selectedSeats.length > 0 && (
          <div className="total-price mb-3">
            <h5>Total Price: ৳{totalPrice}</h5>
          </div>
        )}

        {!showPassengerForm && (
          <div className="text-center">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
            >
              Proceed to Passenger Details
            </Button>
          </div>
        )}
      </div>

      {showPassengerForm && (
        <div className="passenger-form-container mt-4 p-4">
          <h3 className="mb-4">Passenger Details</h3>
          {selectedSeats.map((seat, index) => (
            <div key={seat.id} className="passenger-card mb-4 p-3 border rounded">
              <h5>Seat: {seat.number} ({seat.type})</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={passengerDetails[index]?.name || ''}
                      onChange={(e) => handlePassengerDetailChange(index, 'name', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      value={passengerDetails[index]?.gender || 'male'}
                      onChange={(e) => handlePassengerDetailChange(index, 'gender', e.target.value)}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Age</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="120"
                      value={passengerDetails[index]?.age || ''}
                      onChange={(e) => handlePassengerDetailChange(index, 'age', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          ))}
          <div className="total-price text-end mb-4">
            <h4>Total: ৳{totalPrice}</h4>
          </div>
          <div className="d-flex justify-content-between">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowPassengerForm(false)}
            >
              Back to Seat Selection
            </Button>
            <Button 
              variant="primary" 
              onClick={handleConfirmBooking}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default SeatSelection;








// import React, { useState } from 'react';
// import { Tab, Tabs, Container, Button, Badge, Row, Col, Form, ButtonGroup } from 'react-bootstrap';
// import { FaChair, FaBed, FaUserAlt, FaArrowRight, FaTimes, FaCheck } from 'react-icons/fa';
// import '../styles/SeatSelection.css';

// const SeatSelection = () => {
//   const seatConfigs = {
//     '28_seater_only': { 
//       description: '28 Seater (14 left + 14 right)', 
//       upper: 0, 
//       lower: 28, 
//       sleeper: 0 
//     },
//     '14_sleeper_28_seater': { 
//       description: '14 Sleeper Upper + 28 Seater Lower', 
//       upper: 14, 
//       lower: 28, 
//       sleeper: 14 
//     },
//     '14_sleeper_14_sleeper': { 
//       description: '14 Sleeper Upper + 14 Sleeper Lower', 
//       upper: 14, 
//       lower: 14, 
//       sleeper: 28 
//     },
//   };

//   const [busType, setBusType] = useState('14_sleeper_28_seater');
//   const [activeTab, setActiveTab] = useState('upper');
//   const [selectedSeats, setSelectedSeats] = useState([]);
//   const [passengerDetails, setPassengerDetails] = useState([]);
//   const [showPassengerForm, setShowPassengerForm] = useState(false);

//   // Generate seat layout based on bus type
//   const generateSeatLayout = (type) => {
//     if (type === '28_seater_only') {
//       // 28 seater (14 left + 14 right)
//       const lowerDeck = [];
      
//       // 7 rows (2 left + 2 right per row)
//       for (let row = 1; row <= 7; row++) {
//         const rowSeats = [];
        
//         // Left seats (A-B)
//         for (let col = 0; col < 2; col++) {
//           const seatNumber = `${row}${String.fromCharCode(65 + col)}`;
//           rowSeats.push({
//             id: `L-${seatNumber}`,
//             number: seatNumber,
//             type: 'standard',
//             status: Math.random() > 0.7 ? 'booked' : 'available',
//             price: 500,
//             deck: 'lower',
//             position: 'left'
//           });
//         }
        
//         // Right seats (C-D)
//         for (let col = 2; col < 4; col++) {
//           const seatNumber = `${row}${String.fromCharCode(65 + col)}`;
//           rowSeats.push({
//             id: `L-${seatNumber}`,
//             number: seatNumber,
//             type: 'standard',
//             status: Math.random() > 0.7 ? 'booked' : 'available',
//             price: 500,
//             deck: 'lower',
//             position: 'right'
//           });
//         }
        
//         lowerDeck.push(rowSeats);
//       }
      
//       return { lower: lowerDeck };
//     } 
//     else if (type === '14_sleeper_28_seater') {
//       // Upper deck: 14 sleeper seats (5 rows)
//       const upperDeck = [];
      
//       // Left side: 1 seat per row for first 4 rows (total 4)
//       // Right side: 2 seats per row for 5 rows (total 10)
//       for (let row = 1; row <= 5; row++) {
//         const rowSeats = [];
        
//         // Left seat (only for first 4 rows)
//         if (row <= 4) {
//           const seatNumber = `U${row}A`;
//           rowSeats.push({
//             id: `U-${seatNumber}`,
//             number: seatNumber,
//             type: 'sleeper',
//             status: Math.random() > 0.7 ? 'booked' : 'available',
//             price: 800,
//             deck: 'upper',
//             position: 'left'
//           });
//         } else {
//           rowSeats.push(null);
//         }
        
//         // Right seats (2 per row)
//         for (let col = 1; col <= 2; col++) {
//           const seatNumber = `U${row}${String.fromCharCode(65 + col)}`;
//           rowSeats.push({
//             id: `U-${seatNumber}`,
//             number: seatNumber,
//             type: 'sleeper',
//             status: Math.random() > 0.7 ? 'booked' : 'available',
//             price: 800,
//             deck: 'upper',
//             position: 'right'
//           });
//         }
        
//         upperDeck.push(rowSeats);
//       }
      
//       // Lower deck: 28 seater seats (7 rows × 4 seats)
//       const lowerDeck = [];
//       for (let row = 1; row <= 7; row++) {
//         const rowSeats = [];
        
//         // Left side (2 seats per row)
//         for (let col = 0; col < 2; col++) {
//           const seatNumber = `L${row}${String.fromCharCode(65 + col)}`;
//           rowSeats.push({
//             id: `L-${seatNumber}`,
//             number: seatNumber,
//             type: 'standard',
//             status: Math.random() > 0.7 ? 'booked' : 'available',
//             price: 500,
//             deck: 'lower',
//             position: 'left'
//           });
//         }
        
//         // Right side (2 seats per row)
//         for (let col = 2; col < 4; col++) {
//           const seatNumber = `L${row}${String.fromCharCode(65 + col)}`;
//           rowSeats.push({
//             id: `L-${seatNumber}`,
//             number: seatNumber,
//             type: 'standard',
//             status: Math.random() > 0.7 ? 'booked' : 'available',
//             price: 500,
//             deck: 'lower',
//             position: 'right'
//           });
//         }
        
//         lowerDeck.push(rowSeats);
//       }
      
//       return { upper: upperDeck, lower: lowerDeck };
//     } 
//     else {
//       // 14 sleeper upper + 14 sleeper lower
//       const upperDeck = [];
//       const lowerDeck = [];
      
//       // Upper deck: 14 sleeper seats (5 rows)
//       for (let row = 1; row <= 5; row++) {
//         const rowSeats = [];
        
//         // Left seat (only for first 4 rows)
//         if (row <= 4) {
//           const seatNumber = `U${row}A`;
//           rowSeats.push({
//             id: `U-${seatNumber}`,
//             number: seatNumber,
//             type: 'sleeper',
//             status: Math.random() > 0.7 ? 'booked' : 'available',
//             price: 800,
//             deck: 'upper',
//             position: 'left'
//           });
//         } else {
//           rowSeats.push(null);
//         }
        
//         // Right seats (2 per row)
//         for (let col = 1; col <= 2; col++) {
//           const seatNumber = `U${row}${String.fromCharCode(65 + col)}`;
//           rowSeats.push({
//             id: `U-${seatNumber}`,
//             number: seatNumber,
//             type: 'sleeper',
//             status: Math.random() > 0.7 ? 'booked' : 'available',
//             price: 800,
//             deck: 'upper',
//             position: 'right'
//           });
//         }
        
//         upperDeck.push(rowSeats);
//       }
      
//       // Lower deck: same as upper deck (14 sleeper seats)
//       for (let row = 1; row <= 5; row++) {
//         const rowSeats = [];
        
//         // Left seat (only for first 4 rows)
//         if (row <= 4) {
//           const seatNumber = `L${row}A`;
//           rowSeats.push({
//             id: `L-${seatNumber}`,
//             number: seatNumber,
//             type: 'sleeper',
//             status: Math.random() > 0.7 ? 'booked' : 'available',
//             price: 800,
//             deck: 'lower',
//             position: 'left'
//           });
//         } else {
//           rowSeats.push(null);
//         }
        
//         // Right seats (2 per row)
//         for (let col = 1; col <= 2; col++) {
//           const seatNumber = `L${row}${String.fromCharCode(65 + col)}`;
//           rowSeats.push({
//             id: `L-${seatNumber}`,
//             number: seatNumber,
//             type: 'sleeper',
//             status: Math.random() > 0.7 ? 'booked' : 'available',
//             price: 800,
//             deck: 'lower',
//             position: 'right'
//           });
//         }
        
//         lowerDeck.push(rowSeats);
//       }
      
//       return { upper: upperDeck, lower: lowerDeck };
//     }
//   };

//   const [seatLayout, setSeatLayout] = useState(generateSeatLayout(busType));

//   const handleBusTypeChange = (type) => {
//     setBusType(type);
//     setSeatLayout(generateSeatLayout(type));
//     setSelectedSeats([]);
//     setActiveTab(type === '28_seater_only' ? 'lower' : 'upper');
//   };

//   const handleSeatClick = (seat) => {
//     if (seat.status === 'booked') return;

//     const seatId = seat.id;
//     setSelectedSeats(prev => {
//       if (prev.some(s => s.id === seatId)) {
//         return prev.filter(s => s.id !== seatId);
//       } else {
//         return [...prev, seat];
//       }
//     });
//   };

//   const isSeatSelected = (seatId) => {
//     return selectedSeats.some(s => s.id === seatId);
//   };

//   const handlePassengerDetailChange = (index, field, value) => {
//     const newDetails = [...passengerDetails];
//     newDetails[index] = { ...newDetails[index], [field]: value };
//     setPassengerDetails(newDetails);
//   };

//   const handleProceed = () => {
//     if (selectedSeats.length === 0) {
//       alert('Please select at least one seat');
//       return;
//     }
    
//     const details = selectedSeats.map(seat => ({
//       seatId: seat.id,
//       seatNumber: seat.number,
//       name: '',
//       gender: 'male',
//       age: ''
//     }));
    
//     setPassengerDetails(details);
//     setShowPassengerForm(true);
//   };

//   const handleConfirmBooking = () => {
//     const isValid = passengerDetails.every(detail => 
//       detail.name.trim() !== '' && detail.age.trim() !== ''
//     );
    
//     if (!isValid) {
//       alert('Please fill all passenger details');
//       return;
//     }
    
//     const bookingData = {
//       busType,
//       seats: selectedSeats,
//       passengers: passengerDetails,
//       totalPrice: selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
//       bookingTime: new Date().toISOString()
//     };
    
//     console.log('Booking confirmed:', bookingData);
//     alert(`${selectedSeats.length} seat(s) booked successfully!`);
//   };

//   const renderSeatIcon = (seat) => {
//     if (seat.status === 'booked') {
//       return <FaTimes className="seat-icon booked" />;
//     }
    
//     return seat.type === 'sleeper' ? (
//       <div className={`sleeper-seat ${isSeatSelected(seat.id) ? 'selected' : 'available'}`}>
//         <FaBed className="seat-icon" />
//       </div>
//     ) : (
//       <div className={`standard-seat ${isSeatSelected(seat.id) ? 'selected' : 'available'}`}>
//         <FaChair className="seat-icon" />
//       </div>
//     );
//   };

//   const renderDeck = (deck) => {
//     const deckSeats = seatLayout[deck];
//     if (!deckSeats) return null;

//     return (
//       <div className="deck-container">
//         <div className="bus-front">
//           <div className="driver-area">
//             <FaUserAlt className="driver-icon" />
//             <span>Driver</span>
//           </div>
//         </div>
        
//         <div className="seat-grid">
//           {deckSeats.map((row, rowIndex) => (
//             <div key={rowIndex} className="seat-row">
//               {row.map((seat, colIndex) => (
//                 seat ? (
//                   <div
//                     key={seat.id}
//                     className={`seat ${seat.type} ${seat.status} ${isSeatSelected(seat.id) ? 'selected' : ''}`}
//                     onClick={() => handleSeatClick(seat)}
//                   >
//                     {renderSeatIcon(seat)}
//                     <div className="seat-number">{seat.number}</div>
//                     <div className="seat-price">৳{seat.price}</div>
//                     {isSeatSelected(seat.id) && <FaCheck className="selected-check" />}
//                   </div>
//                 ) : (
//                   <div key={`empty-${rowIndex}-${colIndex}`} className="empty-space"></div>
//                 )
//               ))}
//             </div>
//           ))}
//         </div>
        
//         <div className="bus-rear">
//           <div className="exit-door">
//             <FaArrowRight className="exit-icon" />
//             <span>Exit</span>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

//   return (
//     <Container className="seat-booking-container">
//       <h2 className="text-center mb-4">Bus Seat Selection</h2>
      
//       <div className="bus-type-selector mb-4">
//         <h5>Select Bus Type:</h5>
//         <ButtonGroup className="w-100">
//           {Object.keys(seatConfigs).map(type => (
//             <Button
//               key={type}
//               variant={busType === type ? 'primary' : 'outline-primary'}
//               onClick={() => handleBusTypeChange(type)}
//             >
//               {seatConfigs[type].description}
//             </Button>
//           ))}
//         </ButtonGroup>
//       </div>

//       {busType !== '28_seater_only' && (
//         <Tabs
//           activeKey={activeTab}
//           onSelect={(k) => setActiveTab(k)}
//           className="mb-3 deck-tabs"
//         >
//           <Tab eventKey="upper" title={
//             <span>
//               <FaBed className="me-2" />
//               Upper Deck
//             </span>
//           }>
//             {renderDeck('upper')}
//           </Tab>
//           <Tab eventKey="lower" title={
//             <span>
//               {busType === '14_sleeper_14_sleeper' ? (
//                 <>
//                   <FaBed className="me-2" />
//                   Lower Deck (Sleeper)
//                 </>
//               ) : (
//                 <>
//                   <FaChair className="me-2" />
//                   Lower Deck (Seater)
//                 </>
//               )}
//             </span>
//           }>
//             {renderDeck('lower')}
//           </Tab>
//         </Tabs>
//       )}

//       {busType === '28_seater_only' && renderDeck('lower')}

//       <div className="selection-summary mt-4">
//         <h4>Booking Summary</h4>
        
//         <div className="selected-seats mb-3">
//           <h5>Selected Seats ({selectedSeats.length}):</h5>
//           {selectedSeats.length > 0 ? (
//             <div className="d-flex flex-wrap gap-2">
//               {selectedSeats.map(seat => (
//                 <Badge key={seat.id} bg="primary" className="seat-badge">
//                   {seat.number} ({seat.type === 'sleeper' ? 'Sleeper' : 'Seater'}) - ৳{seat.price}
//                 </Badge>
//               ))}
//             </div>
//           ) : (
//             <p className="text-muted">No seats selected</p>
//           )}
//         </div>

//         {selectedSeats.length > 0 && (
//           <div className="total-price mb-3">
//             <h5>Total Price: ৳{totalPrice}</h5>
//           </div>
//         )}

//         {!showPassengerForm && (
//           <div className="text-center">
//             <Button 
//               variant="primary" 
//               size="lg" 
//               onClick={handleProceed}
//               disabled={selectedSeats.length === 0}
//             >
//               Proceed to Passenger Details
//             </Button>
//           </div>
//         )}
//       </div>

//       {showPassengerForm && (
//         <div className="passenger-form-container mt-4 p-4">
//           <h3 className="mb-4">Passenger Details</h3>
          
//           {selectedSeats.map((seat, index) => (
//             <div key={seat.id} className="passenger-card mb-4 p-3 border rounded">
//               <h5>Seat: {seat.number} ({seat.type === 'sleeper' ? 'Sleeper' : 'Seater'})</h5>
//               <Row>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Full Name</Form.Label>
//                     <Form.Control
//                       type="text"
//                       value={passengerDetails[index]?.name || ''}
//                       onChange={(e) => handlePassengerDetailChange(index, 'name', e.target.value)}
//                       required
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={3}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Gender</Form.Label>
//                     <Form.Select
//                       value={passengerDetails[index]?.gender || 'male'}
//                       onChange={(e) => handlePassengerDetailChange(index, 'gender', e.target.value)}
//                     >
//                       <option value="male">Male</option>
//                       <option value="female">Female</option>
//                       <option value="other">Other</option>
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//                 <Col md={3}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Age</Form.Label>
//                     <Form.Control
//                       type="number"
//                       min="1"
//                       max="120"
//                       value={passengerDetails[index]?.age || ''}
//                       onChange={(e) => handlePassengerDetailChange(index, 'age', e.target.value)}
//                       required
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </div>
//           ))}
          
//           <div className="total-price text-end mb-4">
//             <h4>Total: ৳{totalPrice}</h4>
//           </div>
          
//           <div className="d-flex justify-content-between">
//             <Button 
//               variant="outline-secondary" 
//               onClick={() => setShowPassengerForm(false)}
//             >
//               Back to Seat Selection
//             </Button>
//             <Button 
//               variant="primary" 
//               onClick={handleConfirmBooking}
//             >
//               Confirm Booking
//             </Button>
//           </div>
//         </div>
//       )}
//     </Container>
//   );
// };

// export default SeatSelection;