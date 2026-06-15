import Lead, { calculateScore } from '../models/Lead.js'
import { Parser } from 'json2csv'
import PDFDocument from 'pdfkit'
import {
  ACTIONS,
  logActivity,
  buildStatusDescription,
  buildUpdateDescription,
} from '../utils/activityLogger.js'

// ── GET /api/leads ───────────────────────────────────────
export const getAllLeads = async (req, res, next) => {
  try {
    const { search, status, source, page = 1, limit = 10 } = req.query

    const filter = {}

    if (status) filter.status = status
    if (source) filter.source = source

    if (search) {
      filter.$or = [
        { fullName:    { $regex: search, $options: 'i' } },
        { email:       { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { leadId:      { $regex: search, $options: 'i' } },
      ]
    }

    const pageNum  = parseInt(page)
    const limitNum = parseInt(limit)
    const skip     = (pageNum - 1) * limitNum

    const total = await Lead.countDocuments(filter)
    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)

    res.json({ success: true, total, page: pageNum, leads })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/leads/summary ───────────────────────────────
export const getLeadsSummary = async (req, res, next) => {
  try {
    const now       = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const staleDate = new Date(now - 30 * 24 * 60 * 60 * 1000)

    // Run all queries in parallel
    const [
      totalLeads,
      statusCounts,
      sourceCounts,
      newThisMonth,
      staleLeads,
      overdueLeads,
      convertedLeads,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),
      Lead.countDocuments({ createdAt: { $gte: thisMonth } }),
      Lead.countDocuments({ updatedAt: { $lt: staleDate } }),
      Lead.countDocuments({
        followUpDate: { $lt: now },
        status: { $nin: ['Converted', 'Lost'] },
      }),
      Lead.countDocuments({ status: 'Converted' }),
    ])

    // Format status counts into a clean object
    const byStatus = {}
    statusCounts.forEach((s) => { byStatus[s._id] = s.count })

    // Format source counts into a clean object
    const bySource = {}
    sourceCounts.forEach((s) => { bySource[s._id] = s.count })

    res.json({
      success: true,
      summary: {
        totalLeads,
        newThisMonth,
        staleLeads,
        overdueLeads,
        convertedLeads,
        byStatus,
        bySource,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/leads/:id ───────────────────────────────────
export const getLeadById = async (req, res, next) => {
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
}

// ── POST /api/leads ──────────────────────────────────────
export const createLead = async (req, res, next) => {
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

    // Check duplicate contact number
    if (contactNumber) {
      const existing = await Lead.findOne({ contactNumber })
      if (existing) {
        res.status(400)
        throw new Error(
          `A lead with this contact number already exists (${existing.leadId})`
        )
      }
    }

    const lead = new Lead({
      fullName,
      email,
      contactNumber,
      companyName,
      source,
      status,
      assignedTo,
      remarks,
    })

    // Log creation activity
    logActivity(
      lead,
      ACTIONS.LEAD_CREATED,
      `Lead created for ${fullName} from ${source}`
    )

    await lead.save()

    res.status(201).json(lead)
  } catch (err) {
    next(err)
  }
}

// ── PUT /api/leads/:id ───────────────────────────────────
export const updateLead = async (req, res, next) => {
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

    // Track which fields changed
    const updatedFields = []

    if (fullName    && fullName    !== lead.fullName)    { lead.fullName    = fullName;    updatedFields.push('Full Name') }
    if (email       && email       !== lead.email)       { lead.email       = email;       updatedFields.push('Email') }
    if (companyName && companyName !== lead.companyName) { lead.companyName = companyName; updatedFields.push('Company Name') }
    if (source      && source      !== lead.source)      { lead.source      = source;      updatedFields.push('Source') }
    if (assignedTo  && assignedTo  !== lead.assignedTo)  { lead.assignedTo  = assignedTo;  updatedFields.push('Assigned To') }
    if (remarks     && remarks     !== lead.remarks)     { lead.remarks     = remarks;     updatedFields.push('Remarks') }

    // Handle contact number change — check duplicate
    if (contactNumber && contactNumber !== lead.contactNumber) {
      const existing = await Lead.findOne({
        contactNumber,
        _id: { $ne: lead._id },
      })
      if (existing) {
        res.status(400)
        throw new Error(
          `This contact number belongs to another lead (${existing.leadId})`
        )
      }
      lead.contactNumber = contactNumber
      updatedFields.push('Contact Number')
    }

    // Handle status change inside update
    if (status && status !== lead.status) {
      const oldStatus = lead.status
      lead.status        = status
      lead.statusChangedAt = new Date()

      if (status === 'Contacted') lead.lastContactedAt = new Date()
      if (status === 'Converted') lead.convertedAt     = new Date()

      logActivity(
        lead,
        ACTIONS.STATUS_CHANGED,
        buildStatusDescription(oldStatus, status)
      )
      updatedFields.push('Status')
    }

    // Log update activity if any fields changed
    if (updatedFields.length > 0) {
      logActivity(
        lead,
        ACTIONS.LEAD_UPDATED,
        buildUpdateDescription(updatedFields)
      )
    }

    // Recalculate score on update
    lead.score = calculateScore(lead)

    const updatedLead = await lead.save()

    res.json(updatedLead)
  } catch (err) {
    next(err)
  }
}

// ── PATCH /api/leads/:id/status ──────────────────────────
export const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const allowed = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost']

    if (!status || !allowed.includes(status)) {
      res.status(400)
      throw new Error('Invalid status value')
    }

    const lead = await Lead.findById(req.params.id)

    if (!lead) {
      res.status(404)
      throw new Error('Lead not found')
    }

    const oldStatus = lead.status

    if (oldStatus === status) {
      return res.json(lead)
    }

    // Update status and auto dates
    lead.status          = status
    lead.statusChangedAt = new Date()

    if (status === 'Contacted') lead.lastContactedAt = new Date()
    if (status === 'Converted') lead.convertedAt     = new Date()

    // Reset followUpDate on contact
    if (status === 'Contacted' || status === 'Qualified') {
      const followUp = new Date()
      followUp.setDate(followUp.getDate() + 3)
      lead.followUpDate = followUp
    }

    // Log the status change
    logActivity(
      lead,
      ACTIONS.STATUS_CHANGED,
      buildStatusDescription(oldStatus, status)
    )

    const updatedLead = await lead.save()

    res.json(updatedLead)
  } catch (err) {
    next(err)
  }
}

// ── DELETE /api/leads/:id ────────────────────────────────
export const deleteLead = async (req, res, next) => {
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
}

// ── GET /api/leads/export/csv ────────────────────────────
export const exportCSV = async (req, res, next) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 })

    if (leads.length === 0) {
      res.status(404)
      throw new Error('No leads found to export')
    }

    const fields = [
      { label: 'Lead ID',        value: 'leadId' },
      { label: 'Full Name',      value: 'fullName' },
      { label: 'Email',          value: 'email' },
      { label: 'Contact Number', value: 'contactNumber' },
      { label: 'Company Name',   value: 'companyName' },
      { label: 'Source',         value: 'source' },
      { label: 'Status',         value: 'status' },
      { label: 'Score',          value: 'score' },
      { label: 'Assigned To',    value: 'assignedTo' },
      { label: 'Remarks',        value: 'remarks' },
      { label: 'Follow Up Date', value: (row) => row.followUpDate ? new Date(row.followUpDate).toLocaleDateString('en-IN') : '—' },
      { label: 'Created Date',   value: (row) => new Date(row.createdAt).toLocaleDateString('en-IN') },
      { label: 'Updated Date',   value: (row) => new Date(row.updatedAt).toLocaleDateString('en-IN') },
    ]

    const parser = new Parser({ fields })
    const csv    = parser.parse(leads.map((l) => l.toObject()))

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv')
    res.send(csv)
  } catch (err) {
    next(err)
  }
}

// ── GET /api/leads/export/pdf ────────────────────────────
export const exportPDF = async (req, res, next) => {
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

    doc.fontSize(16).font('Helvetica-Bold')
      .text('Lead Management Report', { align: 'center' })
    doc.fontSize(10).font('Helvetica')
      .text(`Generated: ${new Date().toLocaleDateString('en-IN')}  |  Total Leads: ${leads.length}`, { align: 'center' })

    doc.moveDown(1)

    const headers   = ['Lead ID', 'Full Name', 'Email', 'Contact', 'Company', 'Source', 'Status', 'Score', 'Assigned To']
    const colWidths = [70, 100, 140, 85, 90, 75, 70, 40, 90]
    const startX    = 30
    let currentY    = doc.y

    // Header row
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

    // Data rows
    leads.forEach((lead, rowIndex) => {
      const rowData = [
        lead.leadId        || '—',
        lead.fullName      || '—',
        lead.email         || '—',
        lead.contactNumber || '—',
        lead.companyName   || '—',
        lead.source        || '—',
        lead.status        || '—',
        String(lead.score  || 0),
        lead.assignedTo    || '—',
      ]

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

      if (currentY > doc.page.height - 60) {
        doc.addPage()
        currentY = 30
      }
    })

    doc.end()
  } catch (err) {
    next(err)
  }
}

