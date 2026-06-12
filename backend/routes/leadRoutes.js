import express from 'express'
import Lead from '../models/Lead.js'
import { Parser } from 'json2csv'
import PDFDocument from 'pdfkit'

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

// ── GET /api/leads/export/csv ───────────────────────────
// Download all leads as CSV
router.get('/export/csv', async (req, res, next) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 })

    if (leads.length === 0) {
      res.status(404)
      throw new Error('No leads found to export')
    }

    const fields = [
      { label: 'Full Name',       value: 'fullName' },
      { label: 'Email',           value: 'email' },
      { label: 'Contact Number',  value: 'contactNumber' },
      { label: 'Company Name',    value: 'companyName' },
      { label: 'Source',          value: 'source' },
      { label: 'Status',          value: 'status' },
      { label: 'Assigned To',     value: 'assignedTo' },
      { label: 'Remarks',         value: 'remarks' },
      { label: 'Created Date',    value: (row) => new Date(row.createdAt).toLocaleDateString('en-IN') },
      { label: 'Updated Date',    value: (row) => new Date(row.updatedAt).toLocaleDateString('en-IN') },
    ]

    const parser = new Parser({ fields })
    const csv = parser.parse(leads.map((l) => l.toObject()))

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv')
    res.send(csv)
  } catch (err) {
    next(err)
  }
})

// ── GET /api/leads/export/pdf ───────────────────────────
// Download all leads as PDF
router.get('/export/pdf', async (req, res, next) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 })

    if (leads.length === 0) {
      res.status(404)
      throw new Error('No leads found to export')
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=leads.pdf')

    doc.pipe(res)

    // ── Title ──
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Lead Management Report', { align: 'center' })

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' })

    doc.moveDown(1)

    // ── Table headers ──
    const headers = ['Full Name', 'Email', 'Contact', 'Company', 'Source', 'Status', 'Assigned To']
    const colWidths = [110, 150, 90, 100, 80, 70, 90]
    const startX = 30
    let currentY = doc.y

    // Header row background
    doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), 20).fill('#2c3e50')

    let currentX = startX
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff')

    headers.forEach((header, i) => {
      doc.text(header, currentX + 4, currentY + 5, {
        width: colWidths[i] - 8,
        ellipsis: true,
      })
      currentX += colWidths[i]
    })

    currentY += 20

    // ── Table rows ──
    leads.forEach((lead, rowIndex) => {
      const rowData = [
        lead.fullName || '—',
        lead.email || '—',
        lead.contactNumber || '—',
        lead.companyName || '—',
        lead.source || '—',
        lead.status || '—',
        lead.assignedTo || '—',
      ]

      // Alternate row background
      const bgColor = rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff'
      doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), 20).fill(bgColor)

      currentX = startX
      doc.font('Helvetica').fontSize(8).fillColor('#333333')

      rowData.forEach((cell, i) => {
        doc.text(String(cell), currentX + 4, currentY + 5, {
          width: colWidths[i] - 8,
          ellipsis: true,
        })
        currentX += colWidths[i]
      })

      currentY += 20

      // Add new page if running out of space
      if (currentY > doc.page.height - 60) {
        doc.addPage()
        currentY = 30
      }
    })

    // ── Footer ──
    doc
      .moveDown(1)
      .fontSize(9)
      .fillColor('#777777')
      .font('Helvetica')
      .text(`Total Leads: ${leads.length}`, startX)

    doc.end()
  } catch (err) {
    next(err)
  }
})