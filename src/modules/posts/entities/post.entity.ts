import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import slugify from 'slugify';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { PostStatus } from '../../../common/enums/post-status.enum';
import { Category } from 'src/modules/categories/entities/category.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  excerpt: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({ nullable: true })
  featuredImage: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ nullable: true })
  readTime: number;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ nullable: true })
  scheduledFor: Date;

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  author: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @ManyToMany(() => Category, (category) => category.posts)
  @JoinTable({
    name: 'post_categories',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.title) {
      this.slug = slugify(this.title, { lower: true, strict: true });
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateReadTime() {
    if (this.content) {
      const wordsPerMinute = 200;
      const wordCount = this.content.split(/\s+/).length;
      this.readTime = Math.ceil(wordCount / wordsPerMinute);
    }
  }
}
