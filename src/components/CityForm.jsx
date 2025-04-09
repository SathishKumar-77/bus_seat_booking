import React, { useState, useEffect } from 'react';
import { City } from 'country-state-city';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBus, faLocationDot, faMapLocationDot, faSearch, faExchangeAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import '../styles/CityForm.css';

const CityForm = () => {
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedTo, setSelectedTo] = useState('');
  const [allCities, setAllCities] = useState([]);
  const [tripDate, setTripDate] = useState('');
  const [isSwapped, setIsSwapped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cities = City.getCitiesOfCountry('IN');
    setAllCities(cities || []);
  }, []);

  const filterCities = (query) => {
    if (!query || query.length < 2) return [];
    return allCities.filter(city =>
      city.name.toLowerCase().startsWith(query.toLowerCase())
    ).slice(0, 7);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFrom || !selectedTo || !tripDate) {
      const form = e.currentTarget;
      form.classList.add('animate__animated', 'animate__headShake');
      setTimeout(() => {
        form.classList.remove('animate__animated', 'animate__headShake');
      }, 1000);
      return;
    }

    const fromCity = selectedFrom.split(',')[0];
    const toCity = selectedTo.split(',')[0];

    navigate(`/list-buses?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&date=${tripDate}`);
  };

  const swapCities = () => {
    setIsSwapped(true);
    setTimeout(() => setIsSwapped(false), 500);
    const tempQuery = fromQuery;
    const tempSelected = selectedFrom;

    setFromQuery(toQuery);
    setSelectedFrom(selectedTo);
    setToQuery(tempQuery);
    setSelectedTo(tempSelected);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mt-5"
    >
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10 col-sm-12">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0 text-center">
                <FontAwesomeIcon icon={faBus} className="me-2" />
                Bus Route Finder
              </h3>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* From City */}
                <div className="mb-4 position-relative">
                  <label className="form-label fw-bold">
                    <FontAwesomeIcon icon={faLocationDot} className="me-2 text-primary" />
                    From City
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FontAwesomeIcon icon={faMapLocationDot} />
                    </span>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={fromQuery}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFromQuery(value);
                        setFromSuggestions(filterCities(value));
                      }}
                      placeholder="Enter departure city"
                      autoComplete="off"
                      required
                    />
                  </div>

                  {fromSuggestions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="list-group position-absolute w-100 z-index-1 mt-1 shadow-sm"
                      style={{ zIndex: 1000 }}
                    >
                      {fromSuggestions.map((city, i) => (
                        <motion.li
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          className="list-group-item list-group-item-action"
                          onClick={() => {
                            const fullCity = `${city.name}, ${city.stateCode}`;
                            setSelectedFrom(fullCity);
                            setFromQuery(fullCity);
                            setFromSuggestions([]);
                          }}
                        >
                          {city.name}, {city.stateCode}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </div>

                {/* Swap Button */}
                <div className="text-center my-3">
                  <motion.button
                    type="button"
                    className="btn btn-outline-primary rounded-circle p-2"
                    onClick={swapCities}
                    whileHover={{ rotate: 180, scale: 1.1 }}
                    animate={{ rotate: isSwapped ? 180 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FontAwesomeIcon icon={faExchangeAlt} />
                  </motion.button>
                </div>

                {/* To City */}
                <div className="mb-4 position-relative">
                  <label className="form-label fw-bold">
                    <FontAwesomeIcon icon={faLocationDot} className="me-2 text-danger" />
                    To City
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FontAwesomeIcon icon={faMapLocationDot} />
                    </span>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={toQuery}
                      onChange={(e) => {
                        const value = e.target.value;
                        setToQuery(value);
                        setToSuggestions(filterCities(value));
                      }}
                      placeholder="Enter destination city"
                      autoComplete="off"
                      required
                    />
                  </div>

                  {toSuggestions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="list-group position-absolute w-100 z-index-1 mt-1 shadow-sm"
                      style={{ zIndex: 1000 }}
                    >
                      {toSuggestions.map((city, i) => (
                        <motion.li
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          className="list-group-item list-group-item-action"
                          onClick={() => {
                            const fullCity = `${city.name}, ${city.stateCode}`;
                            setSelectedTo(fullCity);
                            setToQuery(fullCity);
                            setToSuggestions([]);
                          }}
                        >
                          {city.name}, {city.stateCode}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </div>

                {/* Date Picker */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-success" />
                    Travel Date
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-lg"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    required
                  />
                </div>

                <div className="d-grid mt-4">
                  <motion.button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FontAwesomeIcon icon={faSearch} className="me-2" />
                    Search Buses
                  </motion.button>
                </div>
              </form>
            </div>

            <div className="card-footer bg-light text-center">
              <small className="text-muted">Search buses across 5000+ routes in India</small>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CityForm;
