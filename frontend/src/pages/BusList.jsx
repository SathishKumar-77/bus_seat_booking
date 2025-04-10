import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBus, 
  faClock, 
  faCalendarAlt, 
  faTicketAlt, 
  faArrowLeft,
  faExchangeAlt,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';

const BusList = () => {
  const [buses, setBuses] = useState([]);
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const apiGetAllBuses = `${import.meta.env.VITE_API_URL}/api/bus?from=${from}&to=${to}&date=${date}`

  useEffect(() => {
    if (from && to) {
      setIsLoading(true);
      setError(null);
      
      axios.get(apiGetAllBuses)
        .then(res => {
          const allBuses = Array.isArray(res.data) ? res.data : [];
          setBuses(allBuses); // Backend filters non-operating buses
          console.log("Buses data:", allBuses); // Debug log
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching buses:', err);
          setError('Failed to fetch bus data. Please try again.');
          setIsLoading(false);
        });
    } else {
      setError('Missing search parameters (from or to).');
      setIsLoading(false);
    }
  }, [from, to, date]);

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const dateObj = new Date();
    dateObj.setHours(Number(hours));
    dateObj.setMinutes(Number(minutes));
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (departure, arrival) => {
    const [depHour, depMinute] = departure.split(':').map(Number);
    const [arrHour, arrMinute] = arrival.split(':').map(Number);
  
    const today = new Date();
    const dep = new Date(today);
    dep.setHours(depHour, depMinute, 0, 0);
  
    const arr = new Date(today);
    arr.setHours(arrHour, arrMinute, 0, 0);
  
    if (arr <= dep) {
      arr.setDate(arr.getDate() + 1);
    }
  
    const diff = arr - dep;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
    return `${hours}h ${minutes}m`;
  };

  const handleBookNow = (busId) => {
    navigate(`/seat-selection/${busId}?date=${date}`);
  };

  const handleSearchAgain = () => {
    navigate(`/cityselection?from=${from}&to=${to}&date=${date}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container py-4"
    >
      <div className="row mb-4">
        <div className="col-12">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline-primary mb-3"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Search
          </button>
          
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="h4 mb-0">
                <FontAwesomeIcon icon={faBus} className="me-2" />
                Available Buses from {from} to {to}
              </h2>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span className="badge bg-info text-dark">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <button 
                  onClick={handleSearchAgain}
                  className="btn btn-sm btn-outline-secondary"
                >
                  <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
                  Modify Search
                </button>
              </div>
              
              {isLoading ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon 
                    icon={faSpinner} 
                    spin 
                    size="2x" 
                    className="text-primary"
                  />
                  <p className="mt-3">Loading available buses...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger text-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                  {error}
                </div>
              ) : buses.length === 0 ? (
                <div className="text-center py-4">
                  <h4 className="text-muted">No buses available for this route</h4>
                  <p>Try modifying your search criteria</p>
                  <button 
                    onClick={handleSearchAgain}
                    className="btn btn-primary mt-2"
                  >
                    Search Again
                  </button>
                </div>
              ) : (
                <div className="row g-4">
                  {buses.map((bus) => (
                    <motion.div
                      key={bus.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="col-12"
                    >
                      <div className="card shadow-sm h-100">
                        <div className="card-body">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="d-flex align-items-center mb-2">
                                <h4 className="mb-0 me-3">{bus.name}</h4>
                                <span className="badge bg-warning text-dark">
                                  {bus.type || 'AC Sleeper'}
                                </span>
                              </div>
                              <p className="text-muted mb-2">
                                <FontAwesomeIcon icon={faBus} className="me-2" />
                                {bus.numberPlate}
                              </p>
                              <div className="d-flex text-primary mb-2">
                                <div className="me-4">
                                  <FontAwesomeIcon icon={faClock} className="me-2" />
                                  <strong>{formatTime(bus.departure)}</strong> - {formatTime(bus.arrival)}
                                </div>
                                <div>
                                  <span className="badge bg-light text-dark">
                                    {formatDuration(bus.departure, bus.arrival)}
                                  </span>
                                </div>
                              </div>
                              <div className="d-flex flex-wrap">
                                {bus.amenities?.map((amenity, index) => (
                                  <span key={index} className="badge bg-light text-dark me-2 mb-2">
                                    {amenity}
                                  </span>
                                ))}
                                {bus.acType && (
                                  <span className="badge bg-light text-dark me-2 mb-2">
                                    {bus.acType}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="col-md-4 text-md-end mt-3 mt-md-0">
                              <div className="mb-3">
                                {bus.fare.seater && (
                                  <h5 className="text-success mb-0">
                                    Seater: {bus.fare.seater}
                                  </h5>
                                )}
                                {bus.fare.sleeper && (
                                  <h5 className="text-success mb-0">
                                    Sleeper: {bus.fare.sleeper}
                                  </h5>
                                )}
                                <small className="text-muted">per seat</small>
                              </div>
                              <div className="d-flex justify-content-md-end">
                                <span className="badge bg-info text-dark me-2">
                                  {bus.availableSeats} seats left
                                </span>
                              </div>
                              <button
                                onClick={() => handleBookNow(bus.id)}
                                className="btn btn-primary mt-3 w-100 w-md-auto"
                                disabled={bus.availableSeats === 0}
                              >
                                <FontAwesomeIcon icon={faTicketAlt} className="me-2" />
                                Book Now
                              </button>
                            </div>
                          </div>
                        </div>
                        {bus.operator?.name && (
                          <div className="card-footer bg-light">
                            <small className="text-muted">
                              Operated by: <strong>{bus.operator.name}</strong>
                            </small>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BusList;