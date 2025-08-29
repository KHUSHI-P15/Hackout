const ResearchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  file: { type: String }, // PDF/Excel/Doc link
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // researcher
  tags: [{ type: String }],
}, { timestamps: true });
