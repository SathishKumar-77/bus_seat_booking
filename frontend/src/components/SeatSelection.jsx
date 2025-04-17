import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Tab, Tabs, Container, Button, Badge, Row, Col, Form } from 'react-bootstrap';
import { FaChair, FaBed, FaUserAlt, FaTimes, FaCheck } from 'react-icons/fa';
import '../styles/SeatSelection.css';
import { useAuth } from '../context/AuthContext';

const SeatSelection = () => {
  const { busId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busData, setBusData] = useState(null);
  const [seatLayout, setSeatLayout] = useState({ upper: [], lower: [] });
  const [activeTab, setActiveTab] = useState('upper');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);

  const apiGet = `${import.meta.env.VITE_API_URL}/api/bus/${busId}?date=${selectedDate}`
  const apiPostBookings = `${import.meta.env.VITE_API_URL}/api/bookings`

  const locatapiGet = `http://localhost:5000/api/bus/${busId}?date=${selectedDate}`

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        if (!busId) {
          setError('No bus ID provided');
          setLoading(false);
          return;
        }
        const response = await fetch(apiGet);
        if (!response.ok) {
          throw new Error('Failed to fetch bus data');
        }
        const data = await response.json();
        setBusData(data);
        setSeatLayout(generateSeatLayout(data));
        setActiveTab(data.type.includes('Sleeper') ? 'upper' : 'lower');
      } catch (err) {
        setError(err.message);
        console.error('Error fetching bus data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusData();
  }, [busId, selectedDate]);

  // const generateSeatLayout = (bus) => {
  //   if (!bus || !bus.seats) {
  //     return { upper: [], lower: [] }; // Return empty if no seats
  //   }

  //   const upperSeats = bus.seats.filter(seat => seat.position === 'upper');
  //   const lowerSeats = bus.seats.filter(seat => seat.position === 'lower');

  //   const organizeSeats = (seats, isSleeper = false) => {
  //     const rows = [];
  //     const seatsByRow = {};

  //     seats.forEach(seat => {
  //       const rowNum = parseInt(seat.seatNumber.match(/\d+/)[0]) || 1; // Default to 1 if no number
  //       if (!seatsByRow[rowNum]) seatsByRow[rowNum] = { left: [], right: [] };

  //       let position = 'right';
  //       if (seat.seatNumber.match(/[12]$/) || seat.seatNumber.endsWith('L')) {
  //         position = 'left';
  //       } else if (seat.seatNumber.match(/[34]$/) || seat.seatNumber.endsWith('R1') || seat.seatNumber.endsWith('R2')) {
  //         position = 'right';
  //       }

  //       const seatData = {
  //         id: seat.id,
  //         number: seat.seatNumber,
  //         type: seat.type || (isSleeper ? 'sleeper' : 'standard'),
  //         status: seat.status || 'available',
  //         price: seat.price || (isSleeper ? 800 : 500),
  //         deck: seat.position,
  //         position: position
  //       };

  //       seatsByRow[rowNum][position].push(seatData);
  //     });

  //     const sortedRows = Object.keys(seatsByRow).sort((a, b) => a - b);
      
  //     sortedRows.forEach(rowNum => {
  //       const row = seatsByRow[rowNum];
  //       if (isSleeper) {
  //         if (rowNum <= 4) {
  //           row.left = row.left.slice(0, 1); // 1 left seat for rows 1-4
  //           row.right = row.right.slice(0, 2); // 2 right seats
  //         } else if (rowNum <= 5) {
  //           row.left = []; // No left seat for row 5
  //           row.right = row.right.slice(0, 2); // 2 right seats
  //         }
  //       } else {
  //         row.left = row.left.slice(0, 2); // 2 left seats per row
  //         row.right = row.right.slice(0, 2); // 2 right seats per row
  //       }
  //       rows.push({
  //         rowNumber: rowNum,
  //         left: row.left,
  //         right: row.right
  //       });
  //     });

  //     console.log('Seat Layout:', rows);
  //     return rows;
  //   };

  //   return {
  //     upper: upperSeats.length > 0 ? organizeSeats(upperSeats, bus.type.includes('Sleeper')) : [],
  //     lower: lowerSeats.length > 0 ? organizeSeats(lowerSeats, bus.type.includes('Sleeper')) : []
  //   };
  // };


  const generateSeatLayout = (bus) => {
    if (!bus || !bus.seats) {
      return { upper: [], lower: [] };
    }
  
    const upperSeats = bus.seats.filter(seat => seat.position === 'upper');
    const lowerSeats = bus.seats.filter(seat => seat.position === 'lower');
  
    const organizeSeats = (seats) => {
      if (seats.length === 0) return [];
  
      // Determine if deck is sleeper or seater based on first seat's type
      const isSleeper = seats[0].type === 'sleeper';
  
      // Sort seats by seatNumber to ensure consistent ordering
      const sortedSeats = [...seats].sort((a, b) => {
        const numA = parseInt(a.seatNumber.match(/\d+/)[0]);
        const numB = parseInt(b.seatNumber.match(/\d+/)[0]);
        return numA - numB;
      });
  
      const rows = [];
  
      if (!isSleeper) {
        // Seater: 7 rows, 4 seats per row (2 left + 2 right)
        const numRows = 7;
        const seatsPerRow = 4;
        let seatIndex = 0;
  
        for (let rowNum = 1; rowNum <= numRows; rowNum++) {
          // Get the next 4 seats for this row
          const rowSeats = sortedSeats.slice(seatIndex, seatIndex + seatsPerRow);
          const left = [];
          const right = [];
  
          // Assign seats to left and right based on index (first 2 left, next 2 right)
          rowSeats.forEach((seat, idx) => {
            const seatData = {
              id: seat.id,
              number: seat.seatNumber,
              type: seat.type,
              status: seat.status,
              price: seat.price,
              deck: seat.position,
              position: idx < 2 ? 'left' : 'right'
            };
            if (idx < 2) {
              left.push(seatData);
            } else {
              right.push(seatData);
            }
          });
  
          // Ensure seats within left and right are sorted by seatNumber
          rows.push({
            rowNumber: rowNum,
            left: left.sort((a, b) => parseInt(a.number.match(/\d+/)[0]) - parseInt(b.number.match(/\d+/)[0])),
            right: right.sort((a, b) => parseInt(a.number.match(/\d+/)[0]) - parseInt(b.number.match(/\d+/)[0]))
          });
  
          seatIndex += seatsPerRow;
        }
      } else {
        // Sleeper: 5 rows with specific layout
        let seatIndex = 0;
        for (let rowNum = 1; rowNum <= 5; rowNum++) {
          const row = { rowNumber: rowNum, left: [], right: [] };
          if (rowNum <= 4) {
            // Rows 1-4: 1 left, 2 right
            if (seatIndex < sortedSeats.length) {
              row.left.push({
                id: sortedSeats[seatIndex].id,
                number: sortedSeats[seatIndex].seatNumber,
                type: sortedSeats[seatIndex].type,
                status: sortedSeats[seatIndex].status,
                price: sortedSeats[seatIndex].price,
                deck: sortedSeats[seatIndex].position,
                position: 'left'
              });
              seatIndex++;
            }
            for (let j = 0; j < 2; j++) {
              if (seatIndex < sortedSeats.length) {
                row.right.push({
                  id: sortedSeats[seatIndex].id,
                  number: sortedSeats[seatIndex].seatNumber,
                  type: sortedSeats[seatIndex].type,
                  status: sortedSeats[seatIndex].status,
                  price: sortedSeats[seatIndex].price,
                  deck: sortedSeats[seatIndex].position,
                  position: 'right'
                });
                seatIndex++;
              }
            }
          } else if (rowNum === 5) {
            // Row 5: 0 left, 2 right
            for (let j = 0; j < 2; j++) {
              if (seatIndex < sortedSeats.length) {
                row.right.push({
                  id: sortedSeats[seatIndex].id,
                  number: sortedSeats[seatIndex].seatNumber,
                  type: sortedSeats[seatIndex].type,
                  status: sortedSeats[seatIndex].status,
                  price: sortedSeats[seatIndex].price,
                  deck: sortedSeats[seatIndex].position,
                  position: 'right'
                });
                seatIndex++;
              }
            }
          }
          rows.push(row);
        }
      }
  
      return rows;
    };
  
    return {
      upper: organizeSeats(upperSeats),
      lower: organizeSeats(lowerSeats)
    };
  };


  const handleSeatClick = (seat) => {
    if (!seat || seat.status === 'booked') return;

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
    if (!newDetails[index]) newDetails[index] = {};
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
      detail?.name?.trim() && detail?.age?.trim()
    );

    if (!isValid) {
      alert('Please fill all passenger details');
      return;
    }

    try {
      const bookingData = {
        busId,
        totalPrice: selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
        seats: selectedSeats.map(seat => seat.id),
        passengers: passengerDetails,
        date: selectedDate,
        userId: user ? user.id : null
      };

      const response = await fetch(apiPostBookings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) throw new Error('Failed to create booking');
      
      alert(`${selectedSeats.length} seat(s) booked successfully!`);
      navigate('/');
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
      <FaBed className={`seat-icon ${isSeatSelected(seat.id) ? 'selected' : 'available'}`} />
    ) : (
      <FaChair className={`seat-icon ${isSeatSelected(seat.id) ? 'selected' : 'available'}`} />
    );
  };

  const renderSeat = (seat) => {
    return (
      <div
        key={seat.id}
        className={`seat ${seat.type} ${seat.status} ${isSeatSelected(seat.id) ? 'selected' : ''}`}
        onClick={() => handleSeatClick(seat)}
      >
        {renderSeatIcon(seat)}
        <div className="seat-number">{seat.number}</div>
        <div className="seat-price">₹{seat.price}</div>
        {isSeatSelected(seat.id) && <FaCheck className="selected-check" />}
      </div>
    );
  };

  const renderDeck = (deck) => {
    if (!seatLayout || !seatLayout[deck] || seatLayout[deck].length === 0) {
      return <div className="text-center my-4">No {deck} deck seats available</div>;
    }

    return (
      <div className="deck-container">
        <div className="bus-front">
          <div className="driver-area">
            <FaUserAlt className="driver-icon" />
            <span>Driver</span>
          </div>
        </div>
        
        <div className="seat-grid">
          {seatLayout[deck].map((row) => (
            <div key={`row-${row.rowNumber}`} className="seat-row">
              <div className="left-column">
                <div className="left-subcolumn">
                  {row.left.slice(0, 1).map(seat => renderSeat(seat))} {/* First seat of left pair */}
                </div>
                <div className="left-subcolumn-gap"></div>
                <div className="left-subcolumn">
                  {row.left.slice(1, 2).map(seat => renderSeat(seat))} {/* Second seat of left pair */}
                </div>
                {row.left.length < 2 && Array(2 - row.left.length).fill().map((_, i) => <div key={`placeholder-left-${i}`} className="placeholder" />)}
              </div>
              <div className="aisle">
                <div className="aisle-label">Aisle</div>
              </div>
              <div className="right-column">
                <div className="right-subcolumn">
                  {row.right.slice(0, 1).map(seat => renderSeat(seat))} {/* First seat of right pair */}
                </div>
                <div className="right-subcolumn-gap"></div>
                <div className="right-subcolumn">
                  {row.right.slice(1, 2).map(seat => renderSeat(seat))} {/* Second seat of right pair */}
                </div>
                {row.right.length < 2 && Array(2 - row.right.length).fill().map((_, i) => <div key={`placeholder-right-${i}`} className="placeholder" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (loading) return <Container className="text-center my-5"><h3>Loading bus data...</h3></Container>;
  if (error) return <Container className="text-center my-5"><h3 className="text-danger">Error: {error}</h3></Container>;
  if (!busData) return <Container className="text-center my-5"><h3>No bus data available</h3></Container>;

  return (
    <Container className="seat-booking-container">
      <h2 className="text-center mb-4">
        {`${busData.name} - ${busData.routeFrom} to ${busData.routeTo}`}
      </h2>

      <Form.Group className="mb-4">
        <Form.Label>Selected Travel Date</Form.Label>
        <Form.Control
          type="date"
          value={selectedDate}
          disabled
          style={{ cursor: 'not-allowed' }}
        />
      </Form.Group>

      <Row>
        <Col md={8}>
          {seatLayout?.upper && seatLayout.upper.length > 0 && (
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
          {(!seatLayout?.upper || seatLayout.upper.length === 0) && renderDeck('lower')}
        </Col>

        <Col md={4}>
          <div className="passenger-details-card">
            <div className="selection-summary">
              <h4>Booking Summary</h4>
              <div className="selected-seats mb-3">
                <h5>Selected Seats ({selectedSeats.length}):</h5>
                {selectedSeats.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {selectedSeats.map(seat => (
                      <Badge key={seat.id} bg="primary" className="seat-badge">
                        {seat.number} ({seat.type}) - ₹{seat.price}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No seats selected</p>
                )}
              </div>
              {selectedSeats.length > 0 && (
                <div className="total-price mb-3">
                  <h5>Total Price: ₹{totalPrice}</h5>
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
                  <h4>Total: ₹{totalPrice}</h4>
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
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SeatSelection;

