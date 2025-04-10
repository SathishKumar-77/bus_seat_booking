Project Flow

1. User Authentication

Registration (/api/auth/register):

Users sign up with name, email, password, phone, and an optional operatorKey.
    
    First user becomes ADMIN; others with a valid operatorKey become BUS_OPERATOR; else USER.
    Passwords are hashed (bcrypt), and a JWT token is issued (valid for 30 days).

Login (/api/auth/login):

    Users log in with email and password, receiving a JWT token and user details.
Protected Routes:
    Middleware (protect) verifies JWT and role (e.g., ADMIN, BUS_OPERATOR).

2. Admin Features
    Generate Operator Key (/api/admin/generate-key):
    Admin creates unique keys for bus operators, stored in operatorKey table.

3. Bus Management (Operators)

Create Bus (/bus):
    Operators add buses with details (name, numberPlate, route, type, prices, seatCount).
Update Bus (/bus/:id):
    Modify bus details.
View Buses (/api/buses):
    Fetch all buses, optionally filtered by operatorId, with seats and trips.

4. Seat Management
Create Seats (/seats):
    Seats automatically create during bus creation based on the bus type.

5. Trip Scheduling (Operators)

Create Recurring Trip (/recurring-trips):
    Operators schedule recurring trips for a bus (busId, daysOfWeek, times).
    One trip per bus enforced.
Update Recurring Trip (/recurring-trips/:id):
    Modify trip details.
Delete Recurring Trip (/recurring-trips/:id):
    Remove a recurring trip.
View Recurring Trips (/recurring-trips):
    Fetch trips by operatorId with bus details.
Generate Daily Trips (/generate-daily-trips):
    Creates daily trips for the next 7 days based on recurring trips, including seats.

6. Booking (Users)

Search Buses (/api/bus):
    Users search buses by route (from, to) and date, showing available seats and prices.
Bus Details (/api/bus/:id):
    Fetch a bus with seat availability for a specific date.
Book Seats (/api/bookings):
    Users book seats with passenger details; seats marked as booked.
View User Bookings (/api/bookings/user/:userId):
    Users see their bookings.

7. Operator Dashboard
View Operator Bookings (/api/bookings/operator/:operatorId):
    Operators see bookings for their buses.
8. Deployment
    Railway: Backend runs on Railway, using PostgreSQL (via Prisma) and dynamic PORT.
    Versal: For frontend.