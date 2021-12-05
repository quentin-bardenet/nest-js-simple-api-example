import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.interface';

class Criteria {
  page: string;
  limit: string;
  sort: any;
  postId: string;
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel('Comments') private readonly commentModel: Model<Comment>,
  ) {}

  create(createCommentDto: CreateCommentDto) {
    const createdComment = new this.commentModel({
      ...createCommentDto,
      createdAt: new Date(),
    });
    return createdComment.save();
  }

  async findAll(criteria: Criteria) {
    const { filter, sort, skip, limit } = this.queryBuilder(criteria);
    const items = await this.commentModel.aggregate([
      { $match: filter },
      {
        $facet: {
          metadata: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
              },
            },
          ],
          data: [{ $sort: sort }, { $skip: skip }, { $limit: limit }],
        },
      },
    ]);
    return items[0];
  }

  findOne(id: string) {
    return this.commentModel.findById(id);
  }

  update(id: string, updateCommentDto: UpdateCommentDto) {
    return this.commentModel.findByIdAndUpdate(
      id,
      { ...updateCommentDto, updatedAt: new Date() },
      { new: true },
    );
  }

  remove(id: string) {
    return this.commentModel.findByIdAndRemove(id);
  }

  private queryBuilder(criteria: Criteria): any {
    const filter = criteria;
    let sort: any = { createdAt: -1 };
    let page = 1;
    let limit = 10;

    if (criteria.page) {
      page = parseInt(criteria.page);
      delete filter.page;
    }

    if (criteria.limit) {
      limit = parseInt(criteria.limit);
      delete filter.limit;
    }

    if (criteria.sort) {
      sort = criteria.sort;
      delete filter.sort;
    }

    return { filter, sort, skip: (page - 1) * limit, limit };
  }
}
