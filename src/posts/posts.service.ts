import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.interface';

class Criteria {
  page: string;
  limit: string;
  sort: any;
  term: string;
}

@Injectable()
export class PostsService {
  constructor(@InjectModel('Posts') private readonly postModel: Model<Post>) {}

  create(createPostDto: CreatePostDto) {
    const createdPost = new this.postModel({
      ...createPostDto,
      createdAt: new Date(),
    });
    return createdPost.save();
  }

  async findAll(criteria: Criteria) {
    const { filter, sort, skip, limit } = this.queryBuilder(criteria);
    const items = await this.postModel.aggregate([
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
    return this.postModel.findById(id);
  }

  update(id: string, updatePostDto: UpdatePostDto) {
    return this.postModel.findByIdAndUpdate(
      id,
      { ...updatePostDto, updatedAt: new Date() },
      { new: true },
    );
  }

  remove(id: string) {
    return this.postModel.findByIdAndRemove(id);
  }

  private queryBuilder(criteria: Criteria): any {
    const filter = criteria;
    let sort: any = { createdAt: -1 };
    let page = 1;
    let limit = 10;

    if (criteria.term) {
      filter['content'] = new RegExp(criteria.term.toLowerCase(), 'i');
      delete filter.term;
    }

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
