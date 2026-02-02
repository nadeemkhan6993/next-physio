import mongoose from 'mongoose';
import { hashPassword } from '../encryption';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'physiotherapist', 'patient'], required: true },
    
    // Physiotherapist specific fields
    dob: { type: String },
    practicingSince: { type: String },
    degrees: [String],
    specialities: [String],
    citiesAvailable: [String],
    clinicAddresses: [String],
    
    // Patient specific fields
    age: { type: Number },
    city: { type: String },
    
    // Common fields (sensitive data)
    mobileNumber: { type: String },
    gender: { type: String },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  
  this.password = await hashPassword(this.password);
});

// Method to exclude password from JSON responses
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
