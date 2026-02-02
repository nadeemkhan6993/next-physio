import mongoose from 'mongoose';

const CaseSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    physiotherapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issueDetails: { type: String, required: true }, // Sensitive medical info
    city: { type: String, required: true },
    canTravel: { type: Boolean, default: false },
    preferredGender: { type: String },
    status: { 
      type: String, 
      enum: ['open', 'in_progress', 'pending_closure', 'closed'], 
      default: 'open',
      index: true // Index for faster queries
    },
    closureRequestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    closureRequestTimestamp: { type: Date },
    comments: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String, required: true },
        userRole: { type: String, required: true },
        message: { type: String, required: true }, // Could contain sensitive info
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for better query performance
CaseSchema.index({ patientId: 1 });
CaseSchema.index({ physiotherapistId: 1 });
CaseSchema.index({ status: 1, createdAt: -1 });

export const Case = mongoose.models.Case || mongoose.model('Case', CaseSchema);
