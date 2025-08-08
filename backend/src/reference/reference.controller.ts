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
import { ReferenceService } from './reference.service';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { CreateReferencesDto } from './dto/create-references.dto';
import { UpdateReferenceDto } from './dto/update-reference.dto';
import { FindReferencesDto } from './dto/find-references.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { JwtUser } from '../auth/types/jwt.types';

@Controller('references')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('References')
export class ReferenceController {
  constructor(private readonly referenceService: ReferenceService) {}

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new reference' })
  @ApiResponse({
    status: 201,
    description: 'The reference has been successfully created.',
  })
  create(
    @GetUser() user: JwtUser,
    @Body() createReferenceDto: CreateReferenceDto,
  ) {
    return this.referenceService.create(user.userId, createReferenceDto);
  }

  @Post('bulk')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'Create multiple references in one request',
    description:
      'Creates multiple references in one request. Each reference is validated independently, and the operation continues even if some references fail.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Returns an array of created references and errors, along with a summary of the operation.',
  })
  createMany(
    @GetUser() user: JwtUser,
    @Body() createReferencesDto: CreateReferencesDto,
  ) {
    return this.referenceService.createMany(user.userId, createReferencesDto);
  }

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'Get all references with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated references with metadata',
  })
  findAll(@GetUser() user: JwtUser, @Query() query: FindReferencesDto) {
    return this.referenceService.findAll(user.userId, query);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get a reference by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the reference',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: JwtUser) {
    return this.referenceService.findOne(id, user.userId);
  }

  @Patch(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a reference' })
  @ApiResponse({
    status: 200,
    description: 'The reference has been successfully updated.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: JwtUser,
    @Body() updateReferenceDto: UpdateReferenceDto,
  ) {
    return this.referenceService.update(id, user.userId, updateReferenceDto);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a reference' })
  @ApiResponse({
    status: 200,
    description: 'The reference has been successfully deleted.',
  })
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: JwtUser) {
    return this.referenceService.remove(id, user.userId);
  }
}
