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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PostStatus } from '../../common/enums/post-status.enum';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: User) {
    return this.postsService.create(createPostDto, user);
  }

  @Get()
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('status') status: PostStatus,
    @Query('category') category: string,
    @Query('tag') tag: string,
  ) {
    return this.postsService.findAll(page, limit, status, category, tag);
  }

  @Get('search')
  search(
    @Query('q') query: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.postsService.search(query, page, limit);
  }

  @Get('featured')
  findFeatured(@Query('limit') limit: number) {
    return this.postsService.findFeatured(limit);
  }

  @Get('popular')
  findPopular(@Query('limit') limit: number) {
    return this.postsService.findPopular(limit);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.postsService.update(id, updatePostDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.postsService.remove(id, user);
  }

  @Post(':id/view')
  incrementView(@Param('id') id: string) {
    return this.postsService.incrementViewCount(id);
  }
}
