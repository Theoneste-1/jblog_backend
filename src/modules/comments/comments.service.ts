import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { CommentStatus } from 'src/common/enums/comment-status.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
    user: User,
  ): Promise<Comment> {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    let depth = 0;
    let parent: Comment | null = null;

    if (createCommentDto.parentId) {
      parent = await this.commentsRepository.findOne({
        where: { id: createCommentDto.parentId },
      });
      if (parent) {
        depth = parent.depth + 1;
      }
    }

    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      user,
      post,
      parent: parent ?? undefined,
      depth,
      status: CommentStatus.PENDING,
    });

    return this.commentsRepository.save(comment);
  }

  async findByPost(postId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { 
        post: { id: postId },
        status: CommentStatus.APPROVED,
      },
      relations: ['user', 'replies'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(id: string, content: string, user: User): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.user.id !== user.id) {
      throw new ForbiddenException('You can only update your own comments');
    }

    comment.content = content;
    return this.commentsRepository.save(comment);
  }

  async remove(id: string, user: User): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.user.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.delete(id);
  }

  async updateStatus(id: string, status: CommentStatus): Promise<Comment> {
    const comment = await this.findOne(id);
    comment.status = status;
    return this.commentsRepository.save(comment);
  }

  async findAllForModeration(
    page: number = 1,
    limit: number = 10,
  ): Promise<[Comment[], number]> {
    return this.commentsRepository.findAndCount({
      relations: ['user', 'post'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }
}
