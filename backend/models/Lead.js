import mongoose from 'mongoose'

// ── Auto-generate LEAD-0001 format ID ───────────────────
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
})

const Counter = mongoose.model('Counter', counterSchema)

// ── Lead scoring logic ───────────────────────────────────
export const calculateScore = (lead) => {
  let score = 0
  if (lead.source === 'Referral') score += 30
  else if (lead.source === 'Website') score += 20
  else if (lead.source === 'Social Media') score += 15
  else if (lead.source === 'Email Campaign') score += 10
  else score += 5

  if (lead.companyName) score += 20
  if (lead.contactNumber) score += 20
  if (lead.assignedTo) score += 15
  if (lead.remarks) score += 15

  return score
}

// ── Lead Schema ─────────────────────────────────────────
const leadSchema = new mongoose.Schema(
  {
    // Unique human-readable ID
    leadId: {
      type: String,
      unique: true,
    },

    // Basic Info
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Enter a valid email address'],
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },

    // Classification
    source: {
      type: String,
      enum: ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Other'],
      default: 'Website',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'],
      default: 'New',
    },

    // Assignment
    assignedTo: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },

    // ── Auto dates ──────────────────────────────────────
    lastContactedAt: {
      type: Date,
      default: null,
    },
    convertedAt: {
      type: Date,
      default: null,
    },
    statusChangedAt: {
      type: Date,
      default: Date.now,
    },

    // ── Follow-up ───────────────────────────────────────
    followUpDate: {
      type: Date,
      default: null,
    },

    // ── Lead Score ──────────────────────────────────────
    score: {
      type: Number,
      default: 0,
    },

    // ── Activity Log ────────────────────────────────────
    activityLog: [
      {
        action: { type: String, required: true },
        description: { type: String, required: true },
        performedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
)

// ── Auto-generate leadId before saving ──────────────────
leadSchema.pre('save', async function () {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: 'leadId' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      )
      this.leadId = `LEAD-${String(counter.value).padStart(4, '0')}`

      const followUp = new Date()
      followUp.setDate(followUp.getDate() + 3)
      this.followUpDate = followUp

      this.score = calculateScore(this)
    } catch (err) {
      throw new Error(err)
    }
  }
})



// ── Virtual: days in current status ─────────────────────
leadSchema.virtual('daysInStatus').get(function () {
  const now = new Date()
  const changed = new Date(this.statusChangedAt)
  return Math.floor((now - changed) / (1000 * 60 * 60 * 24))
})

// ── Virtual: isStale (no update in 30+ days) ────────────
leadSchema.virtual('isStale').get(function () {
  const now = new Date()
  const updated = new Date(this.updatedAt)
  const days = Math.floor((now - updated) / (1000 * 60 * 60 * 24))
  return days > 30
})

// ── Virtual: isOverdue (followUpDate passed) ────────────
leadSchema.virtual('isOverdue').get(function () {
  if (!this.followUpDate) return false
  return new Date() > new Date(this.followUpDate)
})

// ── Include virtuals in JSON output ─────────────────────
leadSchema.set('toJSON', { virtuals: true })
leadSchema.set('toObject', { virtuals: true })

const Lead = mongoose.model('Lead', leadSchema)

export { Counter }
export default Lead