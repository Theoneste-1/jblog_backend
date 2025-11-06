import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { CommentStatus } from '../../common/enums/comment-status.enum';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.create(postId, createCommentDto, user);
  }

  @Get()
  findByPost(@Param('postId') postId: string) {
    return this.commentsService.findByPost(postId);
  }
}

@Controller('comments')
export class CommentsManagementController {
  constructor(private readonly commentsService: CommentsService) {}

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body('content') content: string,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.update(id, content, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.commentsService.remove(id, user);
  }

  @Get('moderation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  findAllForModeration(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.commentsService.findAllForModeration(page, limit);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: CommentStatus,
  ) {
    return this.commentsService.updateStatus(id, status);
  }
}
