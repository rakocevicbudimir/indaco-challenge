import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ConditionalAuthGuard } from '../auth/guards/conditional-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PublicOrAuth } from '../auth/decorators/public-or-auth.decorator';
import { Role } from '../auth/types/role.enum';
import { JwtUser } from '../auth/types/jwt.types';

@Controller('documents/:documentId/sections')
@ApiTags('Sections')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new section' })
  @ApiResponse({
    status: 201,
    description: 'The section has been successfully created.',
  })
  create(
    @Param('documentId', ParseIntPipe) documentId: number,
    @GetUser() user: JwtUser,
    @Body() createSectionDto: CreateSectionDto,
  ) {
    return this.sectionService.create(
      documentId,
      user.userId,
      createSectionDto,
    );
  }

  @Get()
  @UseGuards(ConditionalAuthGuard)
  @PublicOrAuth()
  @ApiOperation({ summary: 'Get all sections for a document' })
  @ApiResponse({
    status: 200,
    description: 'Returns all sections for the document',
  })
  findAll(
    @Param('documentId', ParseIntPipe) documentId: number,
    @GetUser() user: JwtUser | null,
  ) {
    return this.sectionService.findAll(documentId, user?.userId);
  }

  @Get(':id')
  @UseGuards(ConditionalAuthGuard)
  @PublicOrAuth()
  @ApiOperation({ summary: 'Get a section by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the section',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: JwtUser | null,
  ) {
    return this.sectionService.findOne(id, user?.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a section' })
  @ApiResponse({
    status: 200,
    description: 'The section has been successfully updated.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: JwtUser,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    return this.sectionService.update(id, user.userId, updateSectionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a section' })
  @ApiResponse({
    status: 200,
    description: 'The section has been successfully deleted.',
  })
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: JwtUser) {
    return this.sectionService.remove(id, user.userId);
  }
}
