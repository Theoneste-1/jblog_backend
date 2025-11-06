import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../users/entities/user.entity';
import { PostStatus } from '../../common/enums/post-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, author: User): Promise<Post> {
    const post = this.postsRepository.create({
      ...createPostDto,
      author,
    });

    if (createPostDto.status === PostStatus.PUBLISHED) {
      post.publishedAt = new Date();
    }

    return this.postsRepository.save(post);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: PostStatus,
    category?: string,
    tag?: string,
  ): Promise<[Post[], number]> {
    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.categories', 'categories')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('post.createdAt', 'DESC');

    if (status) {
      query.andWhere('post.status = :status', { status });
    } else {
      query.andWhere('post.status = :status', { status: PostStatus.PUBLISHED });
    }

    if (category) {
      query.andWhere('categories.slug = :category', { category });
    }

    if (tag) {
      query.andWhere(':tag = ANY(post.tags)', { tag });
    }

    return query.getManyAndCount();
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author', 'categories', 'comments'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { slug, status: PostStatus.PUBLISHED },
      relations: ['author', 'categories'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    user: User,
  ): Promise<Post> {
    const post = await this.findOne(id);

    if (post.author.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own posts');
    }

    Object.assign(post, updatePostDto);

    if (updatePostDto.status === PostStatus.PUBLISHED && !post.publishedAt) {
      post.publishedAt = new Date();
    }

    return this.postsRepository.save(post);
  }

  async remove(id: string, user: User): Promise<void> {
    const post = await this.findOne(id);

    if (post.author.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postsRepository.delete(id);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.postsRepository.increment({ id }, 'viewCount', 1);
  }

  async search(query: string, page: number = 1, limit: number = 10) {
    return this.postsRepository.findAndCount({
      where: [
        { title: Like(`%${query}%`), status: PostStatus.PUBLISHED },
        { content: Like(`%${query}%`), status: PostStatus.PUBLISHED },
        { excerpt: Like(`%${query}%`), status: PostStatus.PUBLISHED },
      ],
      relations: ['author', 'categories'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findFeatured(limit: number = 5): Promise<Post[]> {
    return this.postsRepository.find({
      where: { status: PostStatus.PUBLISHED },
      relations: ['author', 'categories'],
      order: { viewCount: 'DESC' },
      take: limit,
    });
  }

  async findPopular(limit: number = 10): Promise<Post[]> {
    return this.postsRepository.find({
      where: { status: PostStatus.PUBLISHED },
      relations: ['author'],
      order: { viewCount: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }
}
