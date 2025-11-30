import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './configs/database.js'; // Import the DB connection

import authRoutes from './routes/authRoutes.js'; // Import auth routes
import inventoryRoutes from "./routes/inventoryRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import cookieParser from "cookie-parser"; 
import dashboardRoutes from "./routes/dashboardRoutes.js"
import otpRoutes from "./routes/otpRoutes.js"
import itembillRoutes from './routes/itembillRoutes.js';

import transactionRoutes from './routes/transcationRoutes.js';

dotenv.config();

connectDB();


const app = express();

// Middlewares
app.use(express.json()); // To parse JSON bodies
app.use(cors());         // To allow cross-origin requests
app.use(cookieParser());

// Basic test route


app.use('/api/auth', authRoutes ,otpRoutes ); // Use auth routes
app.use('/api/inventory', inventoryRoutes); // Use inventory routes
app.use('/api/categories',categoryRoutes) // Use category routes
app.use('/api/bill' , uploadRoutes)
app.use('/api/profile', dashboardRoutes )
app.use("/api/customers", transactionRoutes)
app.use('/api/bills', itembillRoutes); // Use item bill routes

app.get('/', (req, res) => {
  res.send('Smart Inventory API is running...');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});