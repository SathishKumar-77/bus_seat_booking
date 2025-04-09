import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RecurringTripForm = () => {
  const [buses, setBuses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    busId: '',
    daysOfWeek: [],
    departureTime: '',
    arrivalTime: ''
  });

  // Fetch buses
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/buses');
        setBuses(res.data.buses || []);
      } catch (err) {
        console.error('Error fetching buses', err);
        setBuses([]);
      }
    };
    fetchBuses();
  }, []);

  // Fetch recurring trips
  const fetchTrips = async () => {
    try {
      const res = await axios.get('http://localhost:5000/recurring-trips');
      setTrips(res.data.trips || []);
    } catch (err) {
      console.error('Failed to fetch trips', err);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Handle input changes
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

    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/recurring-trips/${editId}`, form);
        alert('Recurring trip updated!');
      } else {
        await axios.post('http://localhost:5000/recurring-trips', form);
        alert('Recurring trip created!');
      }

      // Reset
      setForm({
        busId: '',
        daysOfWeek: [],
        departureTime: '',
        arrivalTime: ''
      });
      setSelectedBus(null);
      setEditMode(false);
      setEditId(null);

      fetchTrips(); // Refresh list
    } catch (err) {
      console.error('Error saving recurring trip:', err);
      alert('Failed to save trip');
    }
  };

  const handleEdit = (trip) => {
    setForm({
      busId: trip.busId,
      daysOfWeek: trip.daysOfWeek,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime
    });
    const bus = buses.find(b => b.id === trip.busId);
    setSelectedBus(bus || null);
    setEditMode(true);
    setEditId(trip.id);
  };

  return (
    <div style={styles.container}>
      <h2>{editMode ? 'Edit Recurring Trip' : 'Create Recurring Trip'}</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label>Bus:</label>
        <select name="busId" value={form.busId} onChange={handleChange} required>
          <option value="">Select Bus</option>
          {buses.map(bus => (
            <option key={bus.id} value={bus.id}>{bus.name}</option>
          ))}
        </select>

        {selectedBus && (
          <div style={styles.busInfo}>
            <p><strong>From:</strong> {selectedBus.routeFrom}</p>
            <p><strong>To:</strong> {selectedBus.routeTo}</p>
            <p><strong>Seater Price:</strong> ₹{selectedBus.priceSeater}</p>
            <p><strong>Sleeper Price:</strong> ₹{selectedBus.priceSleeper}</p>
          </div>
        )}

        <label>Departure Time:</label>
        <input type="time" name="departureTime" value={form.departureTime} onChange={handleChange} required />

        <label>Arrival Time:</label>
        <input type="time" name="arrivalTime" value={form.arrivalTime} onChange={handleChange} required />

        <label>Days of Week:</label>
        <select multiple value={form.daysOfWeek} onChange={handleDaysChange}>
          <option value="Mon">Monday</option>
          <option value="Tue">Tuesday</option>
          <option value="Wed">Wednesday</option>
          <option value="Thu">Thursday</option>
          <option value="Fri">Friday</option>
          <option value="Sat">Saturday</option>
          <option value="Sun">Sunday</option>
        </select>

        <button type="submit">{editMode ? 'Update Trip' : 'Create Trip'}</button>
      </form>

      <hr />

      <h2>Recurring Trips</h2>
      {trips.length === 0 ? (
        <p>No recurring trips found.</p>
      ) : (
        trips.map(trip => (
          <div key={trip.id} style={styles.card}>
            <p><strong>Bus:</strong> {trip.bus?.name}</p>
            <p><strong>From:</strong> {trip.bus?.routeFrom} → <strong>To:</strong> {trip.bus?.routeTo}</p>
            <p><strong>Days:</strong> {trip.daysOfWeek.join(', ')}</p>
            <p><strong>Departure:</strong> {trip.departureTime}</p>
            <p><strong>Arrival:</strong> {trip.arrivalTime}</p>
            <button onClick={() => handleEdit(trip)}>Edit</button>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '700px',
    margin: 'auto',
    fontFamily: 'Arial'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '30px'
  },
  busInfo: {
    backgroundColor: '#f1f1f1',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '10px'
  },
  card: {
    border: '1px solid #ccc',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px',
    backgroundColor: '#fafafa'
  }
};

export default RecurringTripForm;
