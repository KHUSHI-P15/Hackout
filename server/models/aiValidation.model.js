const AIAuditSchema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: "Report", required: true },
  aiResult: { type: String }, // e.g., "mangrove detected", "not mangrove"
  confidence: { type: Number }, // confidence score %
  verified: { type: Boolean, default: false }, // human verification
  isActive: { type: Boolean, default: true } // for soft deletion and record management
}, { timestamps: true });
