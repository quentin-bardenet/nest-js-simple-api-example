import { Document } from 'mongoose';

interface PostModel {
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post extends PostModel, Document {}
