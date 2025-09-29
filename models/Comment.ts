import { Schema, model, models, Model, Types } from 'mongoose';

export interface ICommentReport {
  userId: string;
  reason: string;
  createdAt: Date;
}

export interface IComment {
  id: string;
  postId: Types.ObjectId;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  parentCommentId?: Types.ObjectId; // For nested replies
  likes: number;
  reports: ICommentReport[];
  isModerated: boolean;
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationReason?: string;
  isHidden: boolean;
}

const commentSchema = new Schema<IComment>({
  postId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post',
    required: true,
    index: true
  },
  authorId: { 
    type: String, 
    required: true,
    index: true
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 1000 // Reasonable limit for comment length
  },
  isEdited: { 
    type: Boolean, 
    default: false 
  },
  parentCommentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Comment',
    index: true
  },
  likes: { 
    type: Number, 
    default: 0 
  },
  reports: [{
    userId: { type: String, required: true },
    reason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  isModerated: { 
    type: Boolean, 
    default: false 
  },
  moderatedBy: { 
    type: String 
  },
  moderatedAt: { 
    type: Date 
  },
  moderationReason: { 
    type: String 
  },
  isHidden: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: {
    virtuals: true,
    transform: (_, ret: { _id?: Types.ObjectId; __v?: number } & Partial<IComment>) => {
      ret.id = ret._id!.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for common queries
commentSchema.index({ postId: 1, createdAt: -1 }); // For listing comments on a post
commentSchema.index({ authorId: 1, createdAt: -1 }); // For user's comment history
commentSchema.index({ parentCommentId: 1, createdAt: 1 }); // For nested replies
commentSchema.index({ isModerated: 1, createdAt: -1 }); // For moderation queues
commentSchema.index({ 'reports.createdAt': -1 }); // For reviewing reported comments

// Virtual for report count
commentSchema.virtual('reportCount').get(function(this: IComment) {
  return this.reports?.length || 0;
});

// Method to add a report
commentSchema.methods.addReport = async function(userId: string, reason: string) {
  if (!this.reports.some((report: ICommentReport) => report.userId === userId)) {
    const newReport: ICommentReport = {
      userId,
      reason,
      createdAt: new Date()
    };
    this.reports.push(newReport);
    await this.save();
  }
};

// Method to moderate a comment
commentSchema.methods.moderate = async function(moderatorId: string, reason: string, hide: boolean = false) {
  this.isModerated = true;
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  this.moderationReason = reason;
  this.isHidden = hide;
  await this.save();
};

// Static method to get comment thread
commentSchema.statics.getThread = async function(postId: string) {
  return this.find({ 
    postId, 
    isHidden: false 
  })
  .sort({ createdAt: 1 })
  .populate('authorId', 'name avatar');
};

export const Comment = models.Comment as Model<IComment> || model<IComment>('Comment', commentSchema);
