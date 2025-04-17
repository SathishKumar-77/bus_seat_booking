import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaBus, FaIdCard, FaRoute, 
  FaEdit, FaTrash, FaSave, FaPlus,
  FaSnowflake, FaSun, FaChair, FaBed,
  FaArrowRight
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/BusForm.css';

const seatConfigs = {
  '28_seater_only': { upper: 0, lower: 28, sleeper: 0 },
  '14_sleeper_upper_28_seater_lower': { upper: 14, lower: 28, sleeper: 14 },
  '14_sleeper_upper_14_sleeper_lower': { upper: 14, lower: 14, sleeper: 28 },
};

const BusForm = () => {
  const [form, setForm] = useState({
    name: '',
    numberPlate: '',
    routeFrom: '',
    routeTo: '',
    operatorId: null,
    type: '28_seater_only',
    acType: 'AC',
    priceSeater: '',
    priceSleeper: '',
  });

  const [error, setError] = useState('');
  const [buses, setBuses] = useState([]);
  const [editingBus, setEditingBus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.role === 'BUS_OPERATOR') {
      setForm(prev => ({ ...prev, operatorId: storedUser.id }));
    } else {
      setError('User must be a bus operator to add buses.');
      toast.error('User must be a bus operator to add buses.');
    }
  }, []);
  
  // Fetch buses once operatorId is set
  useEffect(() => {
    if (form.operatorId) {
      fetchBuses();
    }
  }, [form.operatorId]);

  const operatorId = form.operatorId;

  const fetchBuses = async () => {
    if (!operatorId) return;
    setIsLoading(true);
    try {
      const apiGetBusById = `${import.meta.env.VITE_API_URL}/api/buses?operatorId=${operatorId}`;
      const localapiGetBusById = `http://localhost:5000/api/buses?operatorId=${operatorId}`;

      const res = await axios.get(apiGetBusById);
      setBuses(res.data.buses || []);
      console.log("Buses", res.data.buses);
    } catch (err) {
      console.error('Failed to fetch buses:', err);
      toast.error('Failed to load buses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Validate form before submission
  const validateForm = () => {
    const { name, numberPlate, routeFrom, routeTo, operatorId, priceSeater, priceSleeper, type } = form;
    const selectedType = seatConfigs[type];

    if (!name || !numberPlate || !routeFrom || !routeTo) {
      return 'All fields (Bus Name, Number Plate, From, To) are required.';
    }
    if (!operatorId) {
      return 'Operator ID is missing. Please log in as a bus operator.';
    }
    if (selectedType.sleeper < selectedType.lower && (!priceSeater || isNaN(priceSeater) || parseFloat(priceSeater) <= 0)) {
      return 'Seater price must be a positive number.';
    }
    if (selectedType.sleeper > 0 && (!priceSleeper || isNaN(priceSleeper) || parseFloat(priceSleeper) <= 0)) {
      return 'Sleeper price must be a positive number.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    const seatConfig = seatConfigs[form.type];
    const totalSeats = seatConfig.upper + seatConfig.lower;

    try {
      let busId;
      if (editingBus) {
        const apiPutBus = `${import.meta.env.VITE_API_URL}/bus/${editingBus}`;
        await axios.put(apiPutBus, {
          ...form,
          seatCount: totalSeats,
          priceSeater: parseFloat(form.priceSeater) || 0,
          priceSleeper: parseFloat(form.priceSleeper) || 0,
        });
        toast.success('Bus updated successfully!');
        busId = editingBus;
      } else {
        const apiPostBuses = `${import.meta.env.VITE_API_URL}/bus`;
        const localapiPostBuses = `http://localhost:5000/bus`;

        const busRes = await axios.post(apiPostBuses, {
          ...form,
          seatCount: totalSeats,
          priceSeater: parseFloat(form.priceSeater) || 0,
          priceSleeper: parseFloat(form.priceSleeper) || 0,
        });
        busId = busRes.data.id;

        // Define onlar seat types based on bus type
        let upperType, lowerType;
        switch (form.type) {
          case '28_seater_only':
            upperType = 'seater';
            lowerType = 'seater';
            break;
          case '14_sleeper_upper_28_seater_lower':
            upperType = 'sleeper';
            lowerType = 'seater';
            break;
          case '14_sleeper_upper_14_sleeper_lower':
            upperType = 'sleeper';
            lowerType = 'sleeper';
            break;
          default:
            upperType = 'seater';
            lowerType = 'seater';
        }

        const configWithTypes = {
          ...seatConfig,
          upperType,
          lowerType,
          busType: form.type,
        };

        const apiPostSeats = `${import.meta.env.VITE_API_URL}/seats`;
        const localPostSeats = `http://localhost:5000/seats`;
        await axios.post(apiPostSeats, {
          busId,
          config: configWithTypes,
          priceSeater: parseFloat(form.priceSeater) || 0,
          priceSleeper: parseFloat(form.priceSleeper) || 0,
        });

        toast.success('Bus and seats created successfully!');
      }

      resetForm();
      fetchBuses();
    } catch (err) {
      console.error('Error creating/updating bus:', err);
      const errorMsg = err.response?.data?.message?.includes('numberPlate') 
        ? 'Number plate already exists!' 
        : err.response?.data?.message || 'Failed to create/update bus. Please check your inputs and try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      numberPlate: '',
      routeFrom: '',
      routeTo: '',
      operatorId: form.operatorId,
      type: '28_seater_only',
      acType: 'AC',
      priceSeater: '',
      priceSleeper: '',
    });
    setEditingBus(null);
    setError('');
  };

  const handleEdit = (bus) => {
    setForm({
      name: bus.name,
      numberPlate: bus.numberPlate,
      routeFrom: bus.routeFrom,
      routeTo: bus.routeTo,
      type: bus.type,
      acType: bus.acType,
      operatorId: bus.operatorId,
      priceSeater: bus.priceSeater?.toString() || '',
      priceSleeper: bus.priceSleeper?.toString() || ''
    });
    setEditingBus(bus.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;
  
    try {
      const apiDeleteBuses = `${import.meta.env.VITE_API_URL}/bus/${id}`;
      await axios.delete(apiDeleteBuses);
      toast.success('Bus deleted successfully!');
      fetchBuses();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 'Failed to delete bus';
      toast.error(errorMessage);
    }
  };

  const selectedType = seatConfigs[form.type];

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4">
        {/* Left Column - Form */}
        <div className="col-lg-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card shadow-lg h-100"
          >
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <FaBus className="me-2" />
                {editingBus ? 'Update Bus' : 'Add New Bus'}
              </h4>
            </div>
            
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      <FaBus className="me-2" />
                      Bus Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="e.g., Express Deluxe"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">
                      <FaIdCard className="me-2" />
                      Number Plate
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="numberPlate"
                      placeholder="e.g., MH01AB1234"
                      value={form.numberPlate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">
                      <FaRoute className="me-2" />
                      From
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="routeFrom"
                      placeholder="Departure city"
                      value={form.routeFrom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">
                      <FaRoute className="me-2" />
                      To
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="routeTo"
                      placeholder="Destination city"
                      value={form.routeTo}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Bus Layout Type</label>
                    <select 
                      className="form-select"
                      name="type" 
                      value={form.type}
                      onChange={handleChange}
                    >
                      <option value="28_seater_only">28 Seater Only</option>
                      <option value="14_sleeper_upper_28_seater_lower">14 Sleeper Upper + 28 Seater Lower</option>
                      <option value="14_sleeper_upper_14_sleeper_lower">14 Sleeper Upper + 14 Sleeper Lower</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">A/C Type</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="acType"
                          id="acTypeAC"
                          value="AC"
                          checked={form.acType === 'AC'}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="acTypeAC">
                          <FaSnowflake className="me-1" />
                          A/C
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="acType"
                          id="acTypeNonAC"
                          value="Non-AC"
                          checked={form.acType === 'Non-AC'}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="acTypeNonAC">
                          <FaSun className="me-1" />
                          Non-A/C
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {selectedType.sleeper < selectedType.lower && (
                    <div className="col-md-6">
                      <label className="form-label">
                        <FaChair className="me-2" />
                        Seater Price (₹)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="priceSeater"
                        placeholder="Enter price"
                        value={form.priceSeater}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  )}
                  
                  {selectedType.sleeper > 0 && (
                    <div className="col-md-6">
                      <label className="form-label">
                        <FaBed className="me-2" />
                        Sleeper Price (₹)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="priceSleeper"
                        placeholder="Enter price"
                        value={form.priceSleeper}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  )}
                </div>
                
                <div className="d-flex justify-content-between mt-4">
                  {editingBus && (
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={`btn btn-primary ms-auto ${isLoading ? 'pe-none' : ''}`}
                    disabled={isLoading || !!validateForm()}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        {editingBus ? (
                          <>
                            <FaSave className="me-2" />
                            Update Bus
                          </>
                        ) : (
                          <>
                            <FaPlus className="me-2" />
                            Add Bus + Seats
                          </>
                        )}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Bus List */}
        <div className="col-lg-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card shadow-lg h-100"
          >
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <FaBus className="me-2" />
                Your Buses ({buses.length})
              </h4>
            </div>
            
            <div className="card-body">
              {isLoading && buses.length === 0 ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : buses.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No buses added yet. Add your first bus!
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <table className="table table-hover">
                    <thead className="sticky-top bg-light">
                      <tr>
                        <th>Bus</th>
                        <th>Route</th>
                        <th>Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buses.map(bus => (
                        <motion.tr 
                          key={bus.id}
                          whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                          className={editingBus === bus.id ? 'table-primary' : ''}
                        >
                          <td>
                            <div className="fw-bold">{bus.name}</div>
                            <small className="text-muted">{bus.numberPlate}</small>
                          </td>
                          <td>
                            <div>
                              {bus.routeFrom} <FaArrowRight className="mx-1" /> {bus.routeTo}
                            </div>
                            <small className={`badge ${bus.acType === 'AC' ? 'bg-info text-dark' : 'bg-warning text-dark'}`}>
                              {bus.acType}
                            </small>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {bus.type.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button 
                                onClick={() => handleEdit(bus)}
                                className="btn btn-sm btn-outline-primary"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              {/* <button 
                                onClick={() => handleDelete(bus.id)}
                                className="btn btn-sm btn-outline-danger"
                                title="Delete"
                              >
                                <FaTrash />
                              </button> */}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BusForm;