import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  city: { type: String, required: true },
  country: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  // activationCode: { type: String, required: true }, // maybe used later for book activation
  isActive: { type: Boolean, default: true }, // cambiar a true cuando se tenga que activar el libro

});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);