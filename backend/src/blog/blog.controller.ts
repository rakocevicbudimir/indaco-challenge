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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { FindBlogsDto } from './dto/find-blogs.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ConditionalAuthGuard } from '../auth/guards/conditional-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PublicOrAuth } from '../auth/decorators/public-or-auth.decorator';
import { Role } from '../auth/types/role.enum';
import { JwtUser } from '../auth/types/jwt.types';

@Controller('blogs')
@ApiTags('Blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({
    status: 201,
    description: 'The blog post has been successfully created.',
  })
  create(@GetUser() user: JwtUser, @Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(user.userId, createBlogDto);
  }

  @Get()
  @UseGuards(ConditionalAuthGuard)
  @PublicOrAuth()
  @ApiOperation({
    summary: 'Get all blog posts with pagination, filtering and search',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated blog posts with metadata',
  })
  findAll(@GetUser() user: JwtUser | null, @Query() query: FindBlogsDto) {
    return this.blogService.findAll(user?.userId, query);
  }

  @Get(':id')
  @UseGuards(ConditionalAuthGuard)
  @PublicOrAuth()
  @ApiOperation({ summary: 'Get a blog post by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the blog post',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: JwtUser | null,
  ) {
    return this.blogService.findOne(id, user?.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a blog post' })
  @ApiResponse({
    status: 200,
    description: 'The blog post has been successfully updated.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: JwtUser,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogService.update(id, user.userId, updateBlogDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiResponse({
    status: 200,
    description: 'The blog post has been successfully deleted.',
  })
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: JwtUser) {
    return this.blogService.remove(id, user.userId);
  }
}
