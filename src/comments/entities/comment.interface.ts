import { Document } from 'mongoose';

interface CommentModel {
  postId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment extends CommentModel, Document {}
