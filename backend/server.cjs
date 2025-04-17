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

const allowedOrigins = ['http://localhost:5173', 'https://bus-seat-booking-ebon.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


// Middleware
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


// app.post('/bus', async (req, res) => {
//   try {
//     const {
//       name,
//       numberPlate,
//       routeFrom,
//       routeTo,
//       operatorId,
//       type,
//       acType,
//       priceSeater,
//       priceSleeper,
//       seatCount,
//     } = req.body;

//     console.log("Res_ body", req.body);

//     // Validate operator exists
//     const operator = await prisma.user.findUnique({ where: { id: operatorId } });
//     if (!operator) {
//       return res.status(400).json({ message: 'Invalid operator ID' });
//     }

//     // Check for duplicate bus
//     const exists = await prisma.bus.findUnique({ where: { numberPlate } });
//     if (exists) {
//       return res.status(400).json({ message: 'Bus with this number plate already exists' });
//     }

//     // Create the bus with default prices set to 0.0 if missing
//     const bus = await prisma.bus.create({
//       data: {
//         name,
//         numberPlate,
//         routeFrom,
//         routeTo,
//         operator: {
//           connect: { id: operatorId },
//         },
//         type,
//         acType,
//         priceSeater: priceSeater ? parseFloat(priceSeater) : 0.0,
//         priceSleeper: priceSleeper ? parseFloat(priceSleeper) : 0.0,
//         seatCount,
//       },
//     });

//     console.log("Buses", bus);
//     res.status(201).json(bus);
//   } catch (error) {
//     console.error('Error creating bus:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });





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

    console.log("Request body:", req.body);

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Bus name is required and must be a non-empty string.' });
    }
    if (!numberPlate || typeof numberPlate !== 'string' || numberPlate.trim() === '') {
      return res.status(400).json({ message: 'Number plate is required and must be a non-empty string.' });
    }
    if (!routeFrom || typeof routeFrom !== 'string' || routeFrom.trim() === '') {
      return res.status(400).json({ message: 'Route From is required and must be a non-empty string.' });
    }
    if (!routeTo || typeof routeTo !== 'string' || routeTo.trim() === '') {
      return res.status(400).json({ message: 'Route To is required and must be a non-empty string.' });
    }
    if (!operatorId || typeof operatorId !== 'number') {
      return res.status(400).json({ message: 'Operator ID is required and must be a number.' });
    }
    if (!type || !['28_seater_only', '14_sleeper_upper_28_seater_lower', '14_sleeper_upper_14_sleeper_lower'].includes(type)) {
      return res.status(400).json({ message: 'Invalid bus type. Must be one of: 28_seater_only, 14_sleeper_upper_28_seater_lower, 14_sleeper_upper_14_sleeper_lower.' });
    }
    if (!acType || !['AC', 'Non-AC'].includes(acType)) {
      return res.status(400).json({ message: 'AC Type must be either AC or Non-AC.' });
    }
    if (seatCount == null || typeof seatCount !== 'number' || seatCount <= 0) {
      return res.status(400).json({ message: 'Seat count is required and must be a positive number.' });
    }

    // Validate prices based on bus type
    const parsedPriceSeater = priceSeater ? parseFloat(priceSeater) : 0;
    const parsedPriceSleeper = priceSleeper ? parseFloat(priceSleeper) : 0;

    if (type === '28_seater_only' && (isNaN(parsedPriceSeater) || parsedPriceSeater <= 0)) {
      return res.status(400).json({ message: 'Seater price must be a positive number for 28_seater_only configuration.' });
    }
    if (type === '14_sleeper_upper_28_seater_lower') {
      if (isNaN(parsedPriceSeater) || parsedPriceSeater <= 0) {
        return res.status(400).json({ message: 'Seater price must be a positive number for 14_sleeper_upper_28_seater_lower configuration.' });
      }
      if (isNaN(parsedPriceSleeper) || parsedPriceSleeper <= 0) {
        return res.status(400).json({ message: 'Sleeper price must be a positive number for 14_sleeper_upper_28_seater_lower configuration.' });
      }
    }
    if (type === '14_sleeper_upper_14_sleeper_lower' && (isNaN(parsedPriceSleeper) || parsedPriceSleeper <= 0)) {
      return res.status(400).json({ message: 'Sleeper price must be a positive number for 14_sleeper_upper_14_sleeper_lower configuration.' });
    }

    // Validate operator exists
    const operator = await prisma.user.findUnique({ where: { id: operatorId } });
    if (!operator) {
      return res.status(400).json({ message: 'Invalid operator ID. Operator does not exist.' });
    }

    // Check for duplicate bus
    const exists = await prisma.bus.findUnique({ where: { numberPlate } });
    if (exists) {
      return res.status(400).json({ message: 'Bus with this number plate already exists.' });
    }

    // Create the bus
    const bus = await prisma.bus.create({
      data: {
        name: name.trim(),
        numberPlate: numberPlate.trim(),
        routeFrom: routeFrom.trim(),
        routeTo: routeTo.trim(),
        operator: {
          connect: { id: operatorId },
        },
        type,
        acType,
        priceSeater: parsedPriceSeater,
        priceSleeper: parsedPriceSleeper,
        seatCount,
      },
    });

    console.log("Created bus:", bus);
    res.status(201).json(bus);
  } catch (error) {
    console.error('Error creating bus:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Bus with this number plate already exists.' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ message: 'Invalid operator ID. Operator does not exist.' });
    }
    res.status(500).json({ message: 'Failed to create bus. Please try again.' });
  }
});





// app.post('/seats', async (req, res) => {
//   const { busId, config, priceSeater, priceSleeper } = req.body;

//   let seatData = [];
//   let seatNumber = 1;


//   // Create upper seats
//   for (let i = 0; i < config.upper; i++) {
//     seatData.push({
//       busId,
//       seatNumber: `U${seatNumber++}`,
//       type: config.upperType, // 'sleeper' or 'seater'
//       position: 'upper',
//       price: config.upperType === 'sleeper' ? parseInt(priceSleeper) : parseInt(priceSeater)
//     });
//   }

//   seatNumber = 1;
//   // Create lower seats
//   for (let i = 0; i < config.lower; i++) {
//     seatData.push({
//       busId,
//       seatNumber: `L${seatNumber++}`,
//       type: config.lowerType, // 'sleeper' or 'seater'
//       position: 'lower',
//       price: config.lowerType === 'sleeper' ? parseInt(priceSleeper) : parseInt(priceSeater)
//     });
//   }

//   await prisma.seat.createMany({
//     data: seatData
//   });

//   res.json({ message: 'Seats created!' });
// });






app.post('/seats', async (req, res) => {
  try {
    const { busId, config, priceSeater, priceSleeper } = req.body;

    console.log("Request body:", req.body);

    // Validate required fields
    if (!busId || typeof busId !== 'number') {
      return res.status(400).json({ error: 'Bus ID is required and must be a number.' });
    }
    if (!config || typeof config !== 'object') {
      return res.status(400).json({ error: 'Config object is required.' });
    }
    if (priceSeater == null || isNaN(parseFloat(priceSeater))) {
      return res.status(400).json({ error: 'Seater price is required and must be a valid number.' });
    }
    if (priceSleeper == null || isNaN(parseFloat(priceSleeper))) {
      return res.status(400).json({ error: 'Sleeper price is required and must be a valid number.' });
    }

    // Validate config fields
    const validBusTypes = ['28_seater_only', '14_sleeper_upper_28_seater_lower', '14_sleeper_upper_14_sleeper_lower'];
    if (!config.busType || !validBusTypes.includes(config.busType)) {
      return res.status(400).json({ error: 'Invalid bus type. Must be one of: ' + validBusTypes.join(', ') });
    }
    if (config.upper == null || typeof config.upper !== 'number' || config.upper < 0) {
      return res.status(400).json({ error: 'Upper seat count is required and must be a non-negative number.' });
    }
    if (config.lower == null || typeof config.lower !== 'number' || config.lower < 0) {
      return res.status(400).json({ error: 'Lower seat count is required and must be a non-negative number.' });
    }
    if (!config.upperType || !['sleeper', 'seater'].includes(config.upperType)) {
      return res.status(400).json({ error: 'Upper seat type is required and must be either sleeper or seater.' });
    }
    if (!config.lowerType || !['sleeper', 'seater'].includes(config.lowerType)) {
      return res.status(400).json({ error: 'Lower seat type is required and must be either sleeper or seater.' });
    }

    // Validate bus exists
    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) {
      return res.status(400).json({ error: 'Bus with the provided ID does not exist.' });
    }

    // Validate seat counts and types match bus type
    const expectedConfig = {
      '28_seater_only': { upper: 0, lower: 28, upperType: 'seater', lowerType: 'seater' },
      '14_sleeper_upper_28_seater_lower': { upper: 14, lower: 28, upperType: 'sleeper', lowerType: 'seater' },
      '14_sleeper_upper_14_sleeper_lower': { upper: 14, lower: 14, upperType: 'sleeper', lowerType: 'sleeper' },
    }[config.busType];

    if (config.upper !== expectedConfig.upper || config.lower !== expectedConfig.lower) {
      return res.status(400).json({ error: `Invalid seat counts for ${config.busType}. Expected upper: ${expectedConfig.upper}, lower: ${expectedConfig.lower}.` });
    }
    if (config.upperType !== expectedConfig.upperType || config.lowerType !== expectedConfig.lowerType) {
      return res.status(400).json({ error: `Invalid seat types for ${config.busType}. Expected upperType: ${expectedConfig.upperType}, lowerType: ${expectedConfig.lowerType}.` });
    }

    // Validate prices based on seat types
    if (config.upperType === 'seater' || config.lowerType === 'seater') {
      if (parseFloat(priceSeater) <= 0) {
        return res.status(400).json({ error: 'Seater price must be a positive number for configurations with seater seats.' });
      }
    }
    if (config.upperType === 'sleeper' || config.lowerType === 'sleeper') {
      if (parseFloat(priceSleeper) <= 0) {
        return res.status(400).json({ error: 'Sleeper price must be a positive number for configurations with sleeper seats.' });
      }
    }

    let seatData = [];
    let upperSeatNumber = 1;
    let lowerSeatNumber = 1;

    // Create upper seats
    for (let i = 0; i < config.upper; i++) {
      seatData.push({
        busId,
        seatNumber: `U${upperSeatNumber++}`,
        type: config.upperType,
        position: 'upper',
        price: config.upperType === 'sleeper' ? parseInt(priceSleeper) : parseInt(priceSeater),
      });
    }

    // Create lower seats
    for (let i = 0; i < config.lower; i++) {
      seatData.push({
        busId,
        seatNumber: `L${lowerSeatNumber++}`,
        type: config.lowerType,
        position: 'lower',
        price: config.lowerType === 'sleeper' ? parseInt(priceSleeper) : parseInt(priceSeater),
      });
    }

    // Create seats in the database
    await prisma.seat.createMany({
      data: seatData,
    });

    console.log("Created seats:", seatData);
    res.json({ message: 'Seats created!' });
  } catch (error) {
    console.error('Error creating seats:', error);
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid bus ID. Bus does not exist.' });
    }
    res.status(500).json({ error: 'Failed to create seats. Please try again.' });
  }
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
        recurringTrips: true, // Already includes trips for each bus
      },
    });

    // Enhance response with trip details
    const enrichedBuses = buses.map(bus => ({
      ...bus,
      trips: bus.recurringTrips.map(trip => ({
        id: trip.id,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        daysOfWeek: trip.daysOfWeek,
      })),
    }));

    res.json({ buses: enrichedBuses });
  } catch (error) {
    console.error('❌ Error fetching buses:', error);
    res.status(500).json({ error: 'Server error' });
  }
});




app.delete('/bus/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const busId = parseInt(id);

    // Step 1: Check for associated recurring trips
    const recurringTripsCount = await prisma.recurringTrip.count({
      where: { busId },
    });

    if (recurringTripsCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete bus with associated recurring trips',
        message: 'Delete the associated recurring trip first.',
      });
    }

    // Step 2: Delete all seats associated with the bus
    await prisma.seat.deleteMany({
      where: { busId },
    });

    // Step 3: Delete all trips associated with the bus (if any)
    await prisma.trip.deleteMany({
      where: { busId },
    });

    // Step 4: Now delete the bus safely (no recurring trips to worry about)
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


// backend/routes/tripRoutes.js or wherever this route is defined
// backend/routes/tripRoutes.js or wherever this route is defined
app.get('/recurring-trips', async (req, res) => {
  const operatorId = parseInt(req.query.operatorId);

  try {
    if (!operatorId || isNaN(operatorId)) {
      return res.status(400).json({ error: 'Valid operatorId is required' });
    }

    console.log('Fetching trips for operatorId:', operatorId); // Debug log

    const trips = await prisma.recurringTrip.findMany({
      where: {
        operatorId: operatorId, // Filter by operatorId from RecurringTrip
      },
      include: {
        bus: {
          select: {
            id: true,
            name: true,
            routeFrom: true,
            routeTo: true,
            priceSeater: true,
            priceSleeper: true,
          },
        },
      },
    });

    console.log('Fetched trips:', trips); // Debug log to inspect the data

    if (!trips || trips.length === 0) {
      return res.json({ trips: [], message: 'No trips found for this operator' });
    }

    res.json({ trips });
  } catch (error) {
    console.error('Error fetching recurring trips:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
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
    let { busId, operatorId, departureTime, arrivalTime, daysOfWeek } = req.body;

    // Validate required fields
    if (!busId || !operatorId || !departureTime || !arrivalTime || !daysOfWeek) {
      return res.status(400).json({ error: 'Missing required fields: busId, operatorId, departureTime, arrivalTime, and daysOfWeek are required' });
    }

    // Convert busId and operatorId to numbers if they are strings
    busId = typeof busId === 'string' ? parseInt(busId, 10) : busId;
    operatorId = typeof operatorId === 'string' ? parseInt(operatorId, 10) : operatorId;

    // Validate busId and operatorId existence
    const busExists = await prisma.bus.findUnique({ where: { id: busId } });
    const operatorExists = await prisma.user.findUnique({ where: { id: operatorId } });
    if (!busExists) {
      return res.status(400).json({ error: 'Invalid busId: Bus does not exist' });
    }
    if (!operatorExists) {
      return res.status(400).json({ error: 'Invalid operatorId: User does not exist' });
    }

    // Check if a recurring trip already exists for this busId
    const existingTrip = await prisma.recurringTrip.findFirst({
      where: {
        busId: busId,
        operatorId: operatorId,
      },
    });

    if (existingTrip) {
      return res.status(400).json({ error: 'A recurring trip already exists for this bus. Only one trip per bus is allowed.' });
    }

    const trip = await prisma.recurringTrip.create({
      data: {
        busId,
        operatorId,
        departureTime,
        arrivalTime,
        daysOfWeek,
      },
    });

    res.json({ message: 'Recurring trip created', trip });
  } catch (err) {
    console.error('Error creating recurring trip:', err);
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid busId or operatorId: Check foreign key constraints', details: err.message });
    }
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


app.delete('/recurring-trips/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const tripId = parseInt(id);

    // Check if the recurring trip exists
    const existingTrip = await prisma.recurringTrip.findUnique({
      where: { id: tripId },
    });

    if (!existingTrip) {
      return res.status(404).json({
        error: 'Recurring trip not found',
        message: 'The trip you are trying to delete does not exist.',
      });
    }

    // Delete the recurring trip
    await prisma.recurringTrip.delete({
      where: { id: tripId },
    });

    res.json({ message: '✅ Trip deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting recurring trip:', error);
    res.status(500).json({
      error: 'Failed to delete trip',
      details: error.message,
    });
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





// app.get('/api/bus', async (req, res) => {
//   try {
//     const { from, to, date } = req.query;

//     if (!from || !to || !date) {
//       return res.status(400).json({ error: 'Missing from, to or date parameter' });
//     }

//     // Convert selected date to weekday (e.g., "Sun")
//     const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//     const selectedDay = weekdayNames[new Date(date).getDay()];

//     const buses = await prisma.bus.findMany({
//       where: {
//         routeFrom: from,
//         routeTo: to,
//         operator: {
//           role: 'BUS_OPERATOR',
//         },
//         recurringTrips: {
//           some: {
//             daysOfWeek: {
//               has: selectedDay,
//             },
//           },
//         },
//       },
//       include: {
//         operator: {
//           select: {
//             name: true,
//           },
//         },
//         recurringTrips: true, // we will extract daysOfWeek from here
//       },
//     });

//     const result = buses.map(bus => {
//       // Find the matching recurring trip that includes the selected day
//       const matchingTrip = bus.recurringTrips.find(rt => rt.daysOfWeek.includes(selectedDay));

//       return {
//         id: bus.id,
//         name: bus.name,
//         numberPlate: bus.numberPlate,
//         departure: matchingTrip?.departureTime ?? '',
//         arrival: matchingTrip?.arrivalTime ?? '',
//         recurringDays: matchingTrip?.daysOfWeek ?? [], // ✅ INCLUDE recurring days
//         fare: {
//           seater: bus.priceSeater,
//           sleeper: bus.priceSleeper,
//         },
//         type: bus.type,
//         acType: bus.acType,
//         availableSeats: bus.seatCount,
//         operator: {
//           name: bus.operator.name,
//           rating: bus.operator.rating ?? null,
//         },
//       };
//     });

//     res.json(result);
//   } catch (error) {
//     console.error('Error fetching buses:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

//After booking purpose
app.get('/api/bus', async (req, res) => {
  try {
    const { from, to, date } = req.query;

    // Validate required query parameters
    if (!from || !to || !date) {
      return res.status(400).json({ error: 'Missing required query parameters (from, to, date)' });
    }

    // Parse and validate date
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use ISO format (e.g., 2025-04-23)' });
    }
    bookingDate.setHours(0, 0, 0, 0); // Set to start of the day

    console.log(`Searching for buses: from=${from}, to=${to}, date=${bookingDate.toISOString()}`);

    // Find buses with recurring trips, operator details, and acType from DB
    const buses = await prisma.bus.findMany({
      where: {
        routeFrom: { equals: from, mode: 'insensitive' },
        routeTo: { equals: to, mode: 'insensitive' }
      },
      include: {
        recurringTrips: true,
        seats: {
          include: {
            bookings: {
              where: {
                date: {
                  gte: bookingDate,
                  lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000) // End of the day
                }
              }
            }
          }
        },
        operator: {
          select: {
            name: true // Fetch operator name from User model
          }
        }
      }
    });

    console.log(`Found buses:`, buses.map(b => b.id));
    console.log(`Recurring trips for buses:`, buses.map(b => ({
      busId: b.id,
      recurringTrips: b.recurringTrips
    })));

    if (!buses || buses.length === 0) {
      return res.status(404).json({ error: 'No buses found for the specified route and date' });
    }

    // Map response to match frontend expectations and filter non-operating buses
    const busesWithDetails = buses.map(bus => {
      const selectedDate = new Date(date);
      const fullDayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
      const shortDay = {
        Sunday: "Sun",
        Monday: "Mon",
        Tuesday: "Tue",
        Wednesday: "Wed",
        Thursday: "Thu",
        Friday: "Fri",
        Saturday: "Sat"
      }[fullDayName];

      console.log(`Checking bus ${bus.id} for day ${shortDay}, recurringTrips:`, bus.recurringTrips);

      // Find matching recurring trip for the day
      const trip = bus.recurringTrips.find(rt =>
        Array.isArray(rt.daysOfWeek) && rt.daysOfWeek.includes(shortDay)
      );

      console.log(`Trip for bus ${bus.id}:`, trip);

      if (!trip) {
        return null; // Exclude non-operating buses
      }

      const seatsWithStatus = bus.seats.map(seat => ({
        ...seat,
        status: seat.bookings.length > 0 ? 'booked' : 'available',
        isAvailable: seat.bookings.length === 0
      }));

      // Determine bus type and prices based on seats or type field
      // Fallback to type string if Seat model doesn't have type
      const hasSeaterSeats = bus.seats.some(seat => seat.type === 'seater') || bus.type.includes('seater');
      const hasSleeperSeats = bus.seats.some(seat => seat.type === 'sleeper') || bus.type.includes('sleeper');
      const seaterPrice = hasSeaterSeats ? (bus.priceSeater || 500) : null;
      const sleeperPrice = hasSleeperSeats ? (bus.priceSleeper || 800) : null;

      return {
        id: bus.id,
        name: bus.name,
        numberPlate: bus.numberPlate,
        routeFrom: bus.routeFrom,
        routeTo: bus.routeTo,
        acType: bus.acType, // Fetched from DB, not hardcoded
        type: bus.type,
        seatCount: bus.seatCount,
        operatorId: bus.operatorId,
        createdAt: bus.createdAt,
        updatedAt: bus.updatedAt,
        priceSeater: seaterPrice,
        priceSleeper: sleeperPrice,
        departure: trip.departureTime,
        arrival: trip.arrivalTime,
        fare: {
          seater: seaterPrice ? `₹${seaterPrice.toFixed(2)}` : null,
          sleeper: sleeperPrice ? `₹${sleeperPrice.toFixed(2)}` : null
        },
        availableSeats: seatsWithStatus.filter(s => s.isAvailable).length,
        amenities: [ 'WiFi', 'Charging'], // Remove if fetched from DB
        operator: { name: bus.operator?.name || 'Unknown Operator', rating: 4.5 },
        seats: seatsWithStatus,
        requestedDate: bookingDate.toISOString().split('T')[0]
      };
    }).filter(bus => bus !== null); // Strictly filter out non-operating buses

    console.log(`Filtered buses with details:`, busesWithDetails.map(b => b.id));

    if (busesWithDetails.length === 0) {
      return res.status(404).json({ error: 'No buses operate on the specified date for this route' });
    }

    res.json(busesWithDetails);
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// GET /api/bus/:id - Fetch specific bus details with seat availability for a date
app.get('/api/bus/:id', async (req, res) => {
  try {
    const busId = parseInt(req.params.id);
    const { date } = req.query;

    let bookingDate;
    if (date) {
      bookingDate = new Date(date);
      if (isNaN(bookingDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Use ISO format (e.g., 2025-04-09)' });
      }
      bookingDate.setHours(0, 0, 0, 0);
    } else {
      bookingDate = new Date();
      bookingDate.setHours(0, 0, 0, 0);
    }

    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: {
        seats: {
          include: {
            bookings: {
              where: {
                date: {
                  gte: bookingDate,
                  lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000)
                }
              }
            }
          }
        }
      }
    });

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    const seatsWithStatus = bus.seats.map(seat => ({
      ...seat,
      status: seat.bookings.length > 0 ? 'booked' : 'available',
      isAvailable: seat.bookings.length === 0
    }));

    res.json({
      id: bus.id,
      name: bus.name,
      numberPlate: bus.numberPlate,
      routeFrom: bus.routeFrom,
      routeTo: bus.routeTo,
      acType: bus.acType,
      type: bus.type,
      seatCount: bus.seatCount,
      operatorId: bus.operatorId,
      createdAt: bus.createdAt,
      updatedAt: bus.updatedAt,
      priceSeater: bus.priceSeater,
      priceSleeper: bus.priceSleeper,
      seats: seatsWithStatus,
      requestedDate: bookingDate.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error fetching bus:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// app.post('/api/bookings', async (req, res) => {
//   try {
//     const { busId, totalPrice, seats, passengers, date, userId } = req.body;

//     if (!busId || !totalPrice || !seats || !passengers || !date) {
//       return res.status(400).json({ error: 'Missing required fields (busId, totalPrice, seats, passengers, date)' });
//     }

//     const bookingDate = new Date(date);
//     if (isNaN(bookingDate.getTime())) {
//       return res.status(400).json({ error: 'Invalid date format. Use ISO format (e.g., 2025-04-09)' });
//     }

//     if (!Array.isArray(seats) || seats.length === 0) {
//       return res.status(400).json({ error: 'Seats must be a non-empty array of seat IDs' });
//     }
//     if (!Array.isArray(passengers) || passengers.length !== seats.length) {
//       return res.status(400).json({ error: 'Passengers array must match the number of seats' });
//     }

//     const booking = await prisma.$transaction(async (tx) => {
//       // Create booking with initial status 'confirmed'
//       const createdBooking = await tx.booking.create({
//         data: {
//           busId: parseInt(busId),
//           totalPrice: parseFloat(totalPrice),
//           date: bookingDate,
//           status: 'confirmed', // Set initial status to 'confirmed'
//           userId: userId ? parseInt(userId) : null,
//           seats: {
//             connect: seats.map(seatId => ({ id: parseInt(seatId) }))
//           },
//           passengers: {
//             create: passengers.map(passenger => ({
//               name: passenger.name,
//               gender: passenger.gender,
//               age: parseInt(passenger.age)
//             }))
//           }
//         },
//         include: {
//           seats: true,
//           passengers: true
//         }
//       });

//       // Update seat status (optional, consider per-date logic)
//       await tx.seat.updateMany({
//         where: { id: { in: seats.map(seatId => parseInt(seatId)) } },
//         data: { status: 'booked' }
//       });

//       return createdBooking;
//     }, {
//       isolationLevel: 'Serializable' // Prevent race conditions
//     });

//     res.status(201).json(booking);
//   } catch (error) {
//     console.error('Error creating booking:', error);
//     res.status(500).json({ error: 'Failed to create booking', details: error.message });
//   }
// });




app.post('/api/bookings', async (req, res) => {
  try {
    console.log('Received request body:', req.body); // Log the full request body
    const { busId, totalPrice, seats, passengers, date, userId } = req.body;

    // Validate required fields
    if (!busId || !totalPrice || !seats || !passengers || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields (busId, totalPrice, seats, passengers, date)', 
        received: { busId, totalPrice, seats, passengers, date } 
      });
    }

    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use ISO format (e.g., 2025-04-09)', 
        receivedDate: date 
      });
    }

    // Validate seats array
    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: 'Seats must be a non-empty array', receivedSeats: seats });
    }
    const seatIds = seats.map(seat => {
      if (typeof seat === 'number') return parseInt(seat);
      if (typeof seat === 'object' && seat.id) return parseInt(seat.id);
      return null; // Will be filtered out
    }).filter(id => id !== null);
    if (seatIds.length !== seats.length) {
      return res.status(400).json({ error: 'Each seat must have a valid id', receivedSeats: seats });
    }

    // Validate passengers match seats
    if (!Array.isArray(passengers) || passengers.length !== seatIds.length) {
      return res.status(400).json({ 
        error: 'Passengers array must match the number of seats', 
        seatsLength: seatIds.length, 
        passengersLength: passengers.length 
      });
    }

    // Verify seats exist and are available
    const availableSeats = await prisma.seat.findMany({
      where: {
        id: { in: seatIds },
        status: 'available'
      }
    });
    if (availableSeats.length !== seatIds.length) {
      return res.status(400).json({ 
        error: 'One or more seats are not available', 
        requestedSeats: seatIds, 
        availableSeats: availableSeats.map(s => s.id) 
      });
    }

    const booking = await prisma.$transaction(async (tx) => {
      // Create booking with connect for seats
      const createdBooking = await tx.booking.create({
        data: {
          busId: parseInt(busId),
          totalPrice: parseFloat(totalPrice),
          date: bookingDate,
          status: 'confirmed',
          userId: userId ? parseInt(userId) : null,
          seats: {
            connect: seatIds.map(seatId => ({ id: seatId }))
          },
          passengers: {
            create: passengers.map(passenger => ({
              name: passenger.name,
              gender: passenger.gender,
              age: parseInt(passenger.age)
            }))
          }
        },
        include: {
          seats: true,
          passengers: true,
          bookedSeats: true
        }
      });

      // Create BookedSeats entries with bookingDate
      await tx.bookedSeats.createMany({
        data: seatIds.map(seatId => ({
          bookingId: createdBooking.id,
          seatId: seatId,
          bookingDate: bookingDate
        }))
      });

      // Update seat status to 'booked'
      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: 'booked' }
      });

      return createdBooking;
    }, {
      isolationLevel: 'Serializable'
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
});




app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: parseInt(userId) }, // Show only confirmed bookings
      include: {
        seats: true,
        passengers: true,
        bus: true // Include bus details
      }
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
  }
});



app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Canceling booking with ID:", id);

    if (!id) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    // Fetch the booking with its seats and bookedSeats
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { seats: true, bookedSeats: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Start a transaction to ensure all changes are atomic
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Update booking status to 'canceled'
      const updated = await tx.booking.update({
        where: { id: parseInt(id) },
        data: { status: 'canceled' },
        include: { seats: true, passengers: true, bookedSeats: true }
      });

      // Remove entries from BookedSeats junction table
      if (booking.bookedSeats && booking.bookedSeats.length > 0) {
        await tx.bookedSeats.deleteMany({
          where: { bookingId: parseInt(id) }
        });
        console.log(`Removed ${booking.bookedSeats.length} entries from BookedSeats for booking ${id}. Affected table:`, await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_name = 'BookedSeats'`);
      } else {
        console.log('No BookedSeats entries associated with this booking to remove.');
      }

      // Update seat statuses to 'available'
      if (booking.seats && booking.seats.length > 0) {
        await tx.seat.updateMany({
          where: { id: { in: booking.seats.map(seat => seat.id) } },
          data: { status: 'available' }
        });
        console.log(`Reverted ${booking.seats.length} seats to 'available' for booking ${id}`);
      } else {
        console.log('No seats associated with this booking to revert.');
      }

      return updated;
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking', details: error.message });
  }
});





// app.delete('/api/bookings/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("Canceling booking with ID:", id);

//     if (!id) {
//       return res.status(400).json({ error: 'Booking ID is required' });
//     }

//     // Fetch the booking with its seats
//     const booking = await prisma.booking.findUnique({
//       where: { id: parseInt(id) },
//       include: { seats: true }
//     });

//     if (!booking) {
//       return res.status(404).json({ error: 'Booking not found' });
//     }

//     // Start a transaction to ensure all changes are atomic
//     const updatedBooking = await prisma.$transaction(async (tx) => {
//       // Update booking status to 'canceled'
//       const updated = await tx.booking.update({
//         where: { id: parseInt(id) },
//         data: { status: 'canceled' },
//         include: { seats: true, passengers: true }
//       });

//       // Remove entries from BookedSeats junction table
//       if (booking.seats && booking.seats.length > 0) {
//         await tx.bookedSeats.deleteMany({
//           where: { bookingId: parseInt(id) }
//         });
//         console.log(`Removed ${booking.seats.length} entries from BookedSeats for booking ${id}`);

//         // Update seat statuses to 'available'
//         await tx.seat.updateMany({
//           where: { id: { in: booking.seats.map(seat => seat.id) } },
//           data: { status: 'available' }
//         });
//         console.log(`Reverted ${booking.seats.length} seats to 'available' for booking ${id}`);
//       } else {
//         console.log('No seats associated with this booking to revert.');
//       }

//       return updated;
//     });

//     res.json(updatedBooking);
//   } catch (error) {
//     console.error('Error canceling booking:', error);
//     res.status(500).json({ error: 'Failed to cancel booking', details: error.message });
//   }
// });




app.get('/api/bookings/operator/:operatorId', async (req, res) => {
  try {
    const { operatorId } = req.params;
    console.log("Operator ID (User ID):", operatorId);

    if (!operatorId) {
      return res.status(400).json({ error: 'Operator ID is required' });
    }

    // Validate that the user is an operator
    const operator = await prisma.user.findUnique({
      where: { id: parseInt(operatorId) },
      select: { role: true }
    });

    if (!operator || operator.role !== 'BUS_OPERATOR') {
      return res.status(403).json({ error: 'Unauthorized: User is not a bus operator' });
    }

    // Debug: Check buses operated by this operator
    const operatorBuses = await prisma.bus.findMany({
      where: { operatorId: parseInt(operatorId) },
      select: { id: true, name: true }
    });
    console.log("Buses operated by operator:", operatorBuses);

    // Fetch bookings for buses operated by this operator
    const bookings = await prisma.booking.findMany({
      where: {
        busId: {
          in: operatorBuses.map(bus => bus.id)
        }// Adjust if status differs
      },
      include: {
        bus: true,
        seats: true,
        passengers: true
      },
      orderBy: {
        createdAt: 'desc' // Latest bookings first
      }
    });

    console.log("Found bookings:", bookings);

    if (bookings.length === 0) {
      console.log("No bookings found for operator buses.");
    }

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching operator bookings:', error);
    res.status(500).json({ error: 'Failed to fetch operator bookings', details: error.message });
  }
});

// const PORT = process.env.PORT || 5000
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })


app.get('/test', (req, res) => res.send('Server is up!'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit()
})