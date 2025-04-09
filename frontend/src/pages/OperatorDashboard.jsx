import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const OperatorDashboard = () => {
  const { user } = useAuth();

  if (user?.role !== 'BUS_OPERATOR') {
    return <p className="container mt-4">You are not authorized to view this page.</p>;
  }

  return (
    <div className="container mt-4">
      <h3>Welcome, {user.name}</h3>
      <div className="row mt-4">
        {/* Card for Adding Bus */}
        <div className="col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title">Add New Bus</h5>
              <p className="card-text">Create a new bus and add its details to your fleet.</p>
              <Link to="/busform" className="btn btn-primary">Add Bus</Link>
            </div>
          </div>
        </div>

        {/* Card for Creating Recurring Trips */}
        <div className="col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title">Create Recurring Trip</h5>
              <p className="card-text">Schedule regular trips for your buses across selected weekdays.</p>
              <Link to="/RecurringTrip" className="btn btn-success">Create Trip</Link>
            </div>
          </div>
        </div>


        <div className="col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title">View Detail of bookings</h5>
              <p className="card-text">Manage your bookings with your bus.</p>
              <Link to="/operator-bookings" className="btn btn-success">Show Bookings</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
