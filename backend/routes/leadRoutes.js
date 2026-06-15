import express from 'express'
import {
  getAllLeads,
  getLeadsSummary,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
  exportCSV,
  exportPDF,
} from '../controllers/leadController.js'

const router = express.Router()

// ── Summary ──────────────────────────────────────────────
router.get('/summary', getLeadsSummary)

// ── Export ───────────────────────────────────────────────
router.get('/export/csv', exportCSV)
router.get('/export/pdf', exportPDF)

// ── CRUD ─────────────────────────────────────────────────
router.get('/',     getAllLeads)
router.get('/:id',  getLeadById)
router.post('/',    createLead)
router.put('/:id',  updateLead)
router.patch('/:id/status', updateLeadStatus)
router.delete('/:id', deleteLead)

export default router