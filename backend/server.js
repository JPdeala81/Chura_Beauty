import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

import { supabase } from './config/supabase.js'
import { errorHandler } from './middleware/errorMiddleware.js'

import authRoutes from './routes/authRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import revenueRoutes from './routes/revenueRoutes.js'
import siteSettingsRoutes from './routes/siteSettingsRoutes.js'
import ownerProfileRoutes from './routes/ownerProfileRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

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

const app = express()

// CORS configuration for Vercel deployment
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id']
}))

app.use(helmet())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/revenue', revenueRoutes)
app.use('/api/site-settings', siteSettingsRoutes)
app.use('/api/owner-profile', ownerProfileRoutes)

// Serve static files from frontend/dist (production) or public (development)
const distPath = path.join(__dirname, '../frontend/dist')
const publicPath = path.join(__dirname, '../frontend/public')

// Check if dist folder exists (production build)
if (fs.existsSync(distPath)) {
  console.log('📁 Serving frontend from dist folder')
  app.use(express.static(distPath, { 
    setHeaders: (res, path) => {
      // Cache control for assets with hash in filename
      if (path.match(/\.[0-9a-f]{8,}\.(js|css)$/i)) {
        res.set('Cache-Control', 'public, max-age=31536000')
      }
    }
  }))
  
  // SPA fallback for production - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes (they're already handled)
    // and don't serve for known file extensions
    if (req.path.startsWith('/api/') || /\.\w+$/.test(req.path)) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      })
    }
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) {
        res.status(500).json({
          success: false,
          message: 'Error loading application',
        })
      }
    })
  })
} else {
  console.log('⚠️  Frontend dist folder not found. In development, use: npm run dev (from root)')
  
  // Fallback 404 for development without frontend build
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      console.log('📌 Dev mode: Frontend not available, use frontend dev server at http://localhost:5173')
      res.status(404).json({
        success: false,
        message: 'Frontend not available. Start frontend dev server: npm run dev:frontend',
      })
    }
  })
}

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

app.use(errorHandler)

// Only listen on non-production environments
// Vercel handles the server creation for production
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`)
  })
}

// Export app for Vercel serverless
export default app
