import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import Header from './components/Header'
import Footer from './components/Footer'
import BusForm from './pages/BusForm'
import OperatorDashboard from './pages/OperatorDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import SeatSelection from './components/SeatSelection'
import './App.css'
import CityForm from './components/CityForm'
import BusList from './pages/BusList'
import RecurringTripForm from './pages/RecurringTripForm'
import SeatSelectionWrapper from './components/SeatSelectionWrapper'

function App() {
  return (
 
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className='flex-grow-1'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/busform" element={<BusForm />}/>
              <Route path="/operator-dashboard" element={<OperatorDashboard />} />
              {/* <Route path="/seatselection" element={<SeatSelection />}/> */}
              <Route path="/cityselection" element={<CityForm />}/>
              <Route path="/list-buses" element={<BusList />}/>
              <Route path="/RecurringTrip" element={<RecurringTripForm />}/>
              <Route path="/seat-selection/:busId" element={<SeatSelectionWrapper />} />
              

              

              {/* Add more protected routes here */}
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
  )
}

export default App