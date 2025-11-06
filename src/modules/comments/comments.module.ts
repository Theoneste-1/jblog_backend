import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController, CommentsManagementController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post])],
  controllers: [CommentsController, CommentsManagementController],
  providers: [CommentsService],
})
export class CommentsModule {}
