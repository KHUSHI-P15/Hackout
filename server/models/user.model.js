const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["citizen", "ngo", "government", "researcher"], required: true },
  phone: { type: String, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: false },
  location: { type: String }, // optional (village/town)
  points: { type: Number, default: 0 }, // for gamification
  badges: [{ type: String }], // earned rewards
  profileImage: { type: String }, // cloud storage link
    isActive: { type: Boolean, default: true } // for soft deletion and record management
}, { timestamps: true });
