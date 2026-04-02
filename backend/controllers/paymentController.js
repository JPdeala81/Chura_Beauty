import { supabase } from '../config/supabase.js'

const paymentController = {
  // Generate new payment session
  createPaymentSession: async (req, res) => {
    try {
      const {
        serviceId,
        customerName,
        customerPhone,
        serviceAmount,
        paymentNetwork,
        paymentMethod
      } = req.body

      // Validate required fields
      if (!serviceId || !customerName || !customerPhone || !serviceAmount || !paymentNetwork || !paymentMethod) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Validate payment network
      if (!['airtel', 'moov'].includes(paymentNetwork)) {
        return res.status(400).json({ error: 'Invalid payment network' })
      }

      // Generate unique session code (8 digits)
      const sessionCode = Math.floor(10000000 + Math.random() * 90000000).toString()

      // Create payment session
      const { data, error } = await supabase
        .from('payment_sessions')
        .insert([{
          session_code: sessionCode,
          service_id: serviceId,
          customer_name: customerName,
          customer_phone: customerPhone,
          service_amount: serviceAmount,
          payment_network: paymentNetwork,
          payment_method: paymentMethod,
          payment_status: 'pending'
        }])
        .select()

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      // Log transaction
      await supabase
        .from('payment_transactions')
        .insert([{
          session_id: data[0].id,
          transaction_type: 'ussd_code_generated',
          transaction_data: { method: paymentMethod }
        }])

      res.json({
        message: 'Payment session created',
        session: data[0]
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Get payment session by code
  getPaymentSession: async (req, res) => {
    try {
      const { sessionCode } = req.params

      const { data, error } = await supabase
        .from('payment_sessions')
        .select('*')
        .eq('session_code', sessionCode)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Session not found' })
        }
        return res.status(500).json({ error: error.message })
      }

      // Check if session expired
      if (new Date(data.expires_at) < new Date()) {
        // Update status to expired
        await supabase
          .from('payment_sessions')
          .update({ payment_status: 'expired' })
          .eq('id', data.id)

        data.payment_status = 'expired'
      }

      res.json(data)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Upload payment screenshot
  uploadPaymentScreenshot: async (req, res) => {
    try {
      const { sessionId } = req.params
      const { screenshotUrl, paymentReference } = req.body

      if (!screenshotUrl) {
        return res.status(400).json({ error: 'Screenshot URL required' })
      }

      // Update payment session
      const { data, error } = await supabase
        .from('payment_sessions')
        .update({
          screenshot_url: screenshotUrl,
          payment_reference: paymentReference || null,
          payment_status: 'waiting_confirmation',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      // Log transaction
      await supabase
        .from('payment_transactions')
        .insert([{
          session_id: sessionId,
          transaction_type: 'screenshot_uploaded',
          transaction_data: { reference: paymentReference }
        }])

      res.json({
        message: 'Screenshot uploaded successfully',
        session: data[0]
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Admin confirms payment
  confirmPayment: async (req, res) => {
    try {
      const { sessionId } = req.params
      const { adminNotes } = req.body

      // Get admin ID from token (from auth middleware)
      const adminId = req.userId

      if (!adminId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Update payment session
      const { data, error } = await supabase
        .from('payment_sessions')
        .update({
          admin_confirmed: true,
          admin_confirmed_by: adminId,
          admin_notes: adminNotes || null,
          payment_status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      // Log transaction
      await supabase
        .from('payment_transactions')
        .insert([{
          session_id: sessionId,
          transaction_type: 'admin_confirmed',
          transaction_data: { admin_id: adminId }
        }])

      res.json({
        message: 'Payment confirmed',
        session: data[0]
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Reject payment
  rejectPayment: async (req, res) => {
    try {
      const { sessionId } = req.params
      const { reason } = req.body

      const { data, error } = await supabase
        .from('payment_sessions')
        .update({
          payment_status: 'cancelled',
          admin_notes: reason || 'Payment rejected by admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      res.json({
        message: 'Payment rejected',
        session: data[0]
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Get all FAQs
  getAllFAQs: async (req, res) => {
    try {
      const { category } = req.query

      let query = supabase
        .from('help_faqs')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      res.json(data)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Get FAQ categories
  getFAQCategories: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('help_faqs')
        .select('category')
        .eq('active', true)
        .distinct()

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      const categories = data.map(d => d.category)
      res.json(categories)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Admin: Create/Update FAQ
  createFAQ: async (req, res) => {
    try {
      const { category, question, answer, orderIndex } = req.body
      const adminId = req.userId

      if (!category || !question || !answer) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const { data, error } = await supabase
        .from('help_faqs')
        .insert([{
          category,
          question,
          answer,
          order_index: orderIndex || 0,
          active: true,
          created_by: adminId
        }])
        .select()

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      res.json({
        message: 'FAQ created',
        faq: data[0]
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Admin: Delete FAQ
  deleteFAQ: async (req, res) => {
    try {
      const { faqId } = req.params

      const { error } = await supabase
        .from('help_faqs')
        .update({ active: false })
        .eq('id', faqId)

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      res.json({ message: 'FAQ deleted' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Get payment sessions for admin
  getPaymentSessions: async (req, res) => {
    try {
      const { status, days } = req.query
      const daysAgo = parseInt(days) || 30

      let query = supabase
        .from('payment_sessions')
        .select('*')
        .gte('created_at', new Date(Date.now() - daysAgo * 24 * 60 * 60000).toISOString())
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('payment_status', status)
      }

      const { data, error } = await query

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      res.json(data)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
}

export default paymentController
