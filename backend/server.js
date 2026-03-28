import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';

import { supabase } from './config/supabase.js';
import { setupNotificationSocket } from './sockets/notificationSocket.js';
import { errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import revenueRoutes from './routes/revenueRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Vérification connexion Supabase au démarrage
const checkSupabase = async () => {
  try {
    const { error } = await supabase.from('admins').select('count')
    if (error) {
      console.error('❌ Supabase connexion échouée:', error.message)
      console.error('Assurez-vous que SUPABASE_URL et SUPABASE_SERVICE_KEY sont correctement configurés in .env')
    } else {
      console.log('✅ Supabase connecté avec succès')
    }
  } catch (err) {
    console.error('❌ Erreur Supabase:', err.message)
  }
}
checkSupabase()

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

setupNotificationSocket(io);

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/revenue', revenueRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, io };
