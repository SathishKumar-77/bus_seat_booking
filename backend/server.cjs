require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')
const { protect } = require('./middleware/auth')



const app = express()
const prisma = new PrismaClient()

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Test DB connection
prisma.$connect()
  .then(() => console.log('Connected to PostgreSQL via Prisma'))
  .catch(err => console.error('Error connecting to PostgreSQL', err))

// Routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone, operatorKey } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check total number of users to determine if this is the first user
    const totalUsers = await prisma.user.count();
    let role = 'USER';
    let keyRecord = null;

    if (totalUsers === 0) {
      // First user becomes ADMIN
      role = 'ADMIN';
    } else if (operatorKey) {
      // If operator key provided, validate it
      keyRecord = await prisma.operatorKey.findUnique({
        where: { key: operatorKey }
      });

      if (!keyRecord) {
        return res.status(400).json({ message: 'Invalid operator key' });
      }

      if (keyRecord.usedAt) {
        return res.status(400).json({ message: 'Operator key already used' });
      }

      role = 'BUS_OPERATOR';
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    // Mark operator key as used if applicable
    if (keyRecord) {
      await prisma.operatorKey.update({
        where: { id: keyRecord.id },
        data: {
          usedAt: new Date(),
          usedBy: newUser.id
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: newUser
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})



// Generate operator key (Admin only)
app.post('/api/admin/generate-key', protect(['ADMIN']), async (req, res) => {
  try {
    const key = crypto.randomBytes(16).toString('hex')

    const newKey = await prisma.operatorKey.create({
      data: {
        key,
        createdBy: req.user.id, // 👈 Safe, verified by JWT!
      }
    })

    res.status(201).json({
      key,
      createdAt: newKey.createdAt
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: 'Server error' })
  }
})
// Protected route example
app.get('/api/auth/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(401).json({ message: 'Not authorized, token failed' })
  }
})


app.post('/bus', async (req, res) => {
  try {
    const {
      name,
      numberPlate,
      routeFrom,
      routeTo,
      operatorId,
      type,
      acType,
      priceSeater,
      priceSleeper,
      seatCount,
    } = req.body;

    console.log("Res_ body", req.body);

    // Validate operator exists
    const operator = await prisma.user.findUnique({ where: { id: operatorId } });
    if (!operator) {
      return res.status(400).json({ message: 'Invalid operator ID' });
    }

    // Check for duplicate bus
    const exists = await prisma.bus.findUnique({ where: { numberPlate } });
    if (exists) {
      return res.status(400).json({ message: 'Bus with this number plate already exists' });
    }

    // Create bus
    const bus = await prisma.bus.create({
      data: {
        name,
        numberPlate,
        routeFrom,
        routeTo,
        operatorId,
        type,
        acType,
        priceSeater: parseFloat(priceSeater),
        priceSleeper: parseFloat(priceSleeper),
        seatCount,
      },
    });

    console.log("Buses", bus);

    res.status(201).json(bus);
  } catch (error) {
    console.error('Error creating bus:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



app.post('/seats', async (req, res) => {
  const { busId, config, priceSeater, priceSleeper } = req.body;

  let seatData = [];
  let seatNumber = 1;


  // Create upper seats
  for (let i = 0; i < config.upper; i++) {
    seatData.push({
      busId,
      seatNumber: `U${seatNumber++}`,
      type: config.upperType, // 'sleeper' or 'seater'
      position: 'upper',
      price: config.upperType === 'sleeper' ? parseInt(priceSleeper) : parseInt(priceSeater)
    });
  }

  seatNumber = 1;
  // Create lower seats
  for (let i = 0; i < config.lower; i++) {
    seatData.push({
      busId,
      seatNumber: `L${seatNumber++}`,
      type: config.lowerType, // 'sleeper' or 'seater'
      position: 'lower',
      price: config.lowerType === 'sleeper' ? parseInt(priceSleeper) : parseInt(priceSeater)
    });
  }

  await prisma.seat.createMany({
    data: seatData
  });

  res.json({ message: 'Seats created!' });
});







app.get('/api/buses', async (req, res) => {
  let { operatorId } = req.query;

  try {
    // Convert to number only if it exists and is valid
    const whereClause = operatorId && !isNaN(Number(operatorId))
      ? { operatorId: Number(operatorId) }
      : {};

    const buses = await prisma.bus.findMany({
      where: whereClause,
      include: {
        operator: true,
        seats: true,
        recurringTrips: true,
      },
    });

    res.json({ buses });
  } catch (error) {
    console.error('❌ Error fetching buses:', error);
    res.status(500).json({ error: 'Server error' });
  }
});





app.delete('/bus/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const busId = parseInt(id);

    // Step 1: Delete all seats associated with the bus
    await prisma.seat.deleteMany({
      where: { busId },
    });

    // Step 2: Delete all trips associated with the bus (if any)
    await prisma.trip.deleteMany({
      where: { busId },
    });

    // Step 3: Delete all recurring trips associated with the bus (if any)
    await prisma.recurringTrip.deleteMany({
      where: { busId },
    });

    // Step 4: Now delete the bus safely
    await prisma.bus.delete({
      where: { id: busId },
    });

    res.json({ message: '✅ Bus and related data deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting bus:', error);
    res.status(500).json({ error: 'Failed to delete bus', details: error.message });
  }
});



// Update a bus by ID
app.put('/bus/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    numberPlate,
    routeFrom,
    routeTo,
    acType,
    type,
    seatCount,
    priceSeater,
    priceSleeper,
    operatorId,
  } = req.body;

  try {
    const updateData = {
      name,
      numberPlate,
      routeFrom,
      routeTo,
      acType,
      type,
      seatCount: parseInt(seatCount),
      priceSeater: parseFloat(priceSeater),
      priceSleeper: parseFloat(priceSleeper),
    };

    // Conditionally connect operator if operatorId is passed
    if (operatorId) {
      updateData.operator = {
        connect: {
          id: parseInt(operatorId),
        },
      };
    }

    const updatedBus = await prisma.bus.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
    });

    res.json({ message: 'Bus updated successfully', updatedBus });
  } catch (error) {
    console.error('Error updating bus:', error);
    res.status(500).json({ error: 'Failed to update bus', details: error.message });
  }
});





app.get('/bus/:id', async (req, res) => {
  try {
    const busId = parseInt(req.params.id);
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: { seats: true }
    });

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json(bus);
  } catch (error) {
    console.error('Error fetching bus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/recurring-trips', async (req, res) => {
  try {
    const trips = await prisma.recurringTrip.findMany({
      include: { bus: true }
    });
    res.json({ trips });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});



app.put('/recurring-trips/:id', async (req, res) => {
  const { id } = req.params;
  const { busId, daysOfWeek, departureTime, arrivalTime } = req.body;

  try {
    const updatedTrip = await prisma.recurringTrip.update({
      where: { id: parseInt(id) },
      data: {
        busId,
        daysOfWeek,
        departureTime,
        arrivalTime
      }
    });

    res.json({ message: 'Trip updated', trip: updatedTrip });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update trip', details: err.message });
  }
});





app.post('/recurring-trips', async (req, res) => {
  try {
    let { busId, departureTime, arrivalTime, daysOfWeek } = req.body;

    // Convert busId to number if it's a string
    if (typeof busId === 'string') {
      busId = parseInt(busId, 10);
    }

    const trip = await prisma.recurringTrip.create({
      data: {
        busId,
        departureTime,
        arrivalTime,
        daysOfWeek,
      },
    });

    res.json({ message: 'Recurring trip created', trip });
  } catch (err) {
    console.error('Error creating recurring trip:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});



app.post('/generate-daily-trips', async (req, res) => {
  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d;
  });

  const allRecurring = await prisma.recurringTrip.findMany({ include: { bus: true } });

  for (const day of next7Days) {
    const weekday = day.toLocaleDateString('en-US', { weekday: 'short' }); // 'Mon', 'Tue', etc.
    const matchedTrips = allRecurring.filter(t => t.daysOfWeek.includes(weekday));

    for (const trip of matchedTrips) {
      const departure = new Date(`${day.toISOString().split('T')[0]}T${trip.departureTime}`);
      const arrival = new Date(`${day.toISOString().split('T')[0]}T${trip.arrivalTime}`);

      // Create trip only if not already created
      const existing = await prisma.trip.findFirst({
        where: { busId: trip.busId, date: day }
      });

      if (!existing) {
        const newTrip = await prisma.trip.create({
          data: {
            busId: trip.busId,
            routeFrom: trip.routeFrom,
            routeTo: trip.routeTo,
            departure,
            arrival,
            date: day,
            priceSeater: trip.priceSeater,
            priceSleeper: trip.priceSleeper
          }
        });

        // Create seats
        const config = JSON.parse(trip.bus.config); // assuming bus.config is a JSON string
        let seatNumber = 1;
        let seats = [];

        for (let i = 0; i < config.upper; i++) {
          seats.push({
            tripId: newTrip.id,
            seatNumber: `U${seatNumber++}`,
            type: 'sleeper',
            position: 'upper',
            price: trip.priceSleeper,
            status: 'available'
          });
        }

        seatNumber = 1;
        for (let i = 0; i < config.lower; i++) {
          const isSleeper = config.sleeper > 0;
          seats.push({
            tripId: newTrip.id,
            seatNumber: `L${seatNumber++}`,
            type: isSleeper ? 'sleeper' : 'seater',
            position: 'lower',
            price: isSleeper ? trip.priceSleeper : trip.priceSeater,
            status: 'available'
          });
        }

        await prisma.seat.createMany({ data: seats });
      }
    }
  }

  res.json({ message: 'Upcoming trips generated' });
});





app.get('/api/bus', async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ error: 'Missing from, to or date parameter' });
    }

    // Convert selected date to weekday (e.g., "Sun")
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const selectedDay = weekdayNames[new Date(date).getDay()];

    const buses = await prisma.bus.findMany({
      where: {
        routeFrom: from,
        routeTo: to,
        operator: {
          role: 'BUS_OPERATOR',
        },
        recurringTrips: {
          some: {
            daysOfWeek: {
              has: selectedDay,
            },
          },
        },
      },
      include: {
        operator: {
          select: {
            name: true,
          },
        },
        recurringTrips: true, // we will extract daysOfWeek from here
      },
    });

    const result = buses.map(bus => {
      // Find the matching recurring trip that includes the selected day
      const matchingTrip = bus.recurringTrips.find(rt => rt.daysOfWeek.includes(selectedDay));

      return {
        id: bus.id,
        name: bus.name,
        numberPlate: bus.numberPlate,
        departure: matchingTrip?.departureTime ?? '',
        arrival: matchingTrip?.arrivalTime ?? '',
        recurringDays: matchingTrip?.daysOfWeek ?? [], // ✅ INCLUDE recurring days
        fare: {
          seater: bus.priceSeater,
          sleeper: bus.priceSleeper,
        },
        type: bus.type,
        acType: bus.acType,
        availableSeats: bus.seatCount,
        operator: {
          name: bus.operator.name,
          rating: bus.operator.rating ?? null,
        },
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit()
})