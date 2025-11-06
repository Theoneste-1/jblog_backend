import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  altText: string;

  @ManyToOne(() => User, { eager: true })
  uploadedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
