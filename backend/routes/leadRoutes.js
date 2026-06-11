import express from 'express'
import Lead from '../models/Lead.js'

const router = express.Router()

// ── GET /api/leads ──────────────────────────────────────
// Get all leads with search, filter and pagination
router.get('/', async (req, res, next) => {
  try {
    const { search, status, source, page = 1, limit = 10 } = req.query

    // Build filter object
    const filter = {}

    if (status) {
      filter.status = status
    }

    if (source) {
      filter.source = source
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ]
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const total = await Lead.countDocuments(filter)
    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)

    res.json({ success: true, total, page: pageNum, leads })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/leads/:id ──────────────────────────────────
// Get single lead by ID
router.get('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)

    if (!lead) {
      res.status(404)
      throw new Error('Lead not found')
    }

    res.json(lead)
  } catch (err) {
    next(err)
  }
})

// ── POST /api/leads ─────────────────────────────────────
// Create new lead
router.post('/', async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      contactNumber,
      companyName,
      source,
      status,
      assignedTo,
      remarks,
    } = req.body

    const lead = await Lead.create({
      fullName,
      email,
      contactNumber,
      companyName,
      source,
      status,
      assignedTo,
      remarks,
    })

    res.status(201).json(lead)
  } catch (err) {
    next(err)
  }
})

// ── PUT /api/leads/:id ──────────────────────────────────
// Update full lead
router.put('/:id', async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      contactNumber,
      companyName,
      source,
      status,
      assignedTo,
      remarks,
    } = req.body

    const lead = await Lead.findById(req.params.id)

    if (!lead) {
      res.status(404)
      throw new Error('Lead not found')
    }

    lead.fullName = fullName || lead.fullName
    lead.email = email || lead.email
    lead.contactNumber = contactNumber || lead.contactNumber
    lead.companyName = companyName || lead.companyName
    lead.source = source || lead.source
    lead.status = status || lead.status
    lead.assignedTo = assignedTo || lead.assignedTo
    lead.remarks = remarks || lead.remarks

    const updatedLead = await lead.save()

    res.json(updatedLead)
  } catch (err) {
    next(err)
  }
})

// ── PATCH /api/leads/:id/status ─────────────────────────
// Update status only
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body

    const allowedStatuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost']

    if (!status || !allowedStatuses.includes(status)) {
      res.status(400)
      throw new Error('Invalid status value')
    }

    const lead = await Lead.findById(req.params.id)

    if (!lead) {
      res.status(404)
      throw new Error('Lead not found')
    }

    lead.status = status
    const updatedLead = await lead.save()

    res.json(updatedLead)
  } catch (err) {
    next(err)
  }
})

// ── DELETE /api/leads/:id ───────────────────────────────
// Delete lead
router.delete('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)

    if (!lead) {
      res.status(404)
      throw new Error('Lead not found')
    }

    await lead.deleteOne()

    res.json({ success: true, message: 'Lead deleted successfully' })
  } catch (err) {
    next(err)
  }
})

export default router