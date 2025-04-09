import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion } from 'framer-motion';
import { FaBus, FaClock, FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';

const RecurringTripForm = () => {
  const [buses, setBuses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    busId: '',
    operatorId: '',
    daysOfWeek: [],
    departureTime: '',
    arrivalTime: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [operatorId, setOperatorId] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userOperatorId = storedUser?.role === 'BUS_OPERATOR' ? storedUser.id : null;
    if (userOperatorId) {
      setOperatorId(userOperatorId);
      setForm(prev => ({ ...prev, operatorId: userOperatorId }));
      initData(userOperatorId);
    } else {
      toast.error('Please log in as a bus operator to manage trips.');
    }
  }, []);

  // Fetch Buses
  const fetchBuses = async (operatorId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/buses?operatorId=${operatorId}`);
      return res.data.buses || [];
    } catch (err) {
      console.error('Error fetching buses:', err);
      toast.error('Failed to load buses');
      return [];
    }
  };

  // Fetch Trips
  const fetchTrips = async (operatorId) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/recurring-trips?operatorId=${operatorId}`);
      setTrips(res.data.trips || []);
    } catch (err) {
      console.error('Failed to fetch trips', err);
      toast.error('Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  };

  const initData = async (operatorId) => {
    setIsLoading(true);
    try {
      const busesData = await fetchBuses(operatorId);
      setBuses(busesData);
      await fetchTrips(operatorId);
    } catch (err) {
      console.error('Error initializing data:', err);
      toast.error('Failed to initialize data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'busId') {
      const bus = buses.find(b => b.id === parseInt(value));
      setSelectedBus(bus || null);
      setForm(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDaysChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    setForm(prev => ({ ...prev, daysOfWeek: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!operatorId) {
      toast.error('No operator ID available. Please log in.');
      return;
    }
    setIsLoading(true);
    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/recurring-trips/${editId}`, form);
        toast.success('Recurring trip updated!');
      } else {
        const response = await axios.post('http://localhost:5000/recurring-trips', form);
        toast.success(response.data.message || 'Recurring trip created!');
      }
      setForm({ busId: '', operatorId, daysOfWeek: [], departureTime: '', arrivalTime: '' });
      setSelectedBus(null);
      setEditMode(false);
      setEditId(null);
      fetchTrips(operatorId);
    } catch (err) {
      console.error('Error saving recurring trip:', err.response?.data || err);
      toast.error(err.response?.data?.error || 'Failed to save trip');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (trip) => {
    setForm({
      busId: trip.busId,
      operatorId: trip.operatorId,
      daysOfWeek: trip.daysOfWeek,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
    });
    const bus = buses.find(b => b.id === trip.busId);
    setSelectedBus(bus || null);
    setEditMode(true);
    setEditId(trip.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await axios.delete(`http://localhost:5000/recurring-trips/${id}`);
      toast.success('Trip deleted successfully!');
      fetchTrips(operatorId);
    } catch (err) {
      console.error('Error deleting trip:', err);
      toast.error('Failed to delete trip');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container py-4"
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">
            <FaBus className="me-2" />
            {editMode ? 'Edit Recurring Trip' : 'Create Recurring Trip'}
          </h2>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Bus</label>
                <select
                  name="busId"
                  className="form-select"
                  value={form.busId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Bus</option>
                  {buses.map(bus => (
                    <option key={bus.id} value={bus.id}>{bus.name}</option>
                  ))}
                </select>
              </div>

              {selectedBus && (
                <div className="col-12">
                  <div className="alert alert-info">
                    <p><strong>From:</strong> {selectedBus.routeFrom}</p>
                    <p><strong>To:</strong> {selectedBus.routeTo}</p>
                    <p><strong>Seater Price:</strong> ₹{selectedBus.priceSeater}</p>
                    <p><strong>Sleeper Price:</strong> ₹{selectedBus.priceSleeper}</p>
                  </div>
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label">Departure Time</label>
                <input
                  type="time"
                  className="form-control"
                  name="departureTime"
                  value={form.departureTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Arrival Time</label>
                <input
                  type="time"
                  className="form-control"
                  name="arrivalTime"
                  value={form.arrivalTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-12">
                <label className="form-label">Days of Week</label>
                <select
                  multiple
                  className="form-select"
                  name="daysOfWeek"
                  value={form.daysOfWeek}
                  onChange={handleDaysChange}
                  required
                >
                  <option value="Mon">Monday</option>
                  <option value="Tue">Tuesday</option>
                  <option value="Wed">Wednesday</option>
                  <option value="Thu">Thursday</option>
                  <option value="Fri">Friday</option>
                  <option value="Sat">Saturday</option>
                  <option value="Sun">Sunday</option>
                </select>
              </div>

              <div className="col-12 text-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : editMode ? 'Update Trip' : 'Create Trip'}
                </motion.button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white">
            <h2 className="mb-0">
              <FaCalendarAlt className="me-2" />
              Recurring Trips
            </h2>
          </div>
          <div className="card-body">
            {isLoading && trips.length === 0 ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No recurring trips found.
              </div>
            ) : (
              <div className="list-group">
                {trips.map(trip => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <p><strong>Bus:</strong> {trip.bus?.name || 'N/A'}</p>
                      <p><strong>Route:</strong> {trip.bus?.routeFrom} → {trip.bus?.routeTo}</p>
                      <p><strong>Days:</strong> {trip.daysOfWeek.join(', ')}</p>
                      <p><strong>Departure:</strong> {trip.departureTime}</p>
                      <p><strong>Arrival:</strong> {trip.arrivalTime}</p>
                    </div>
                    <div>
                      <button
                        onClick={() => handleEdit(trip)}
                        className="btn btn-sm btn-outline-primary me-2"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      {/* <button
                        onClick={() => handleDelete(trip.id)}
                        className="btn btn-sm btn-outline-danger"
                        title="Delete"
                      >
                        <FaTrash />
                      </button> */}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecurringTripForm;