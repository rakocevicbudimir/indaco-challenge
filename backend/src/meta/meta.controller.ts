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
import { MetaService } from './meta.service';
import { CreateMetaDto } from './dto/create-meta.dto';
import { CreateMetasDto } from './dto/create-metas.dto';
import { UpdateMetaDto } from './dto/update-meta.dto';
import { FindMetasDto } from './dto/find-metas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ConditionalAuthGuard } from '../auth/guards/conditional-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PublicOrAuth } from '../auth/decorators/public-or-auth.decorator';
import { Role } from '../auth/types/role.enum';

@Controller('metas')
@ApiTags('Metas')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new meta' })
  @ApiResponse({
    status: 201,
    description: 'The meta has been successfully created.',
  })
  create(@Body() createMetaDto: CreateMetaDto) {
    return this.metaService.create(createMetaDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Create multiple metas in one request',
    description:
      'Creates multiple metas in one request. If a meta with the same name and type already exists, returns the existing meta instead of creating a new one.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Returns an array of created/existing metas along with a summary of the operation.',
  })
  createMany(@Body() createMetasDto: CreateMetasDto) {
    return this.metaService.createMany(createMetasDto);
  }

  @Get()
  @UseGuards(ConditionalAuthGuard)
  @PublicOrAuth()
  @ApiOperation({ summary: 'Get all metas with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated metas with metadata',
  })
  findAll(@Query() query: FindMetasDto) {
    return this.metaService.findAll(query);
  }

  @Get(':id')
  @UseGuards(ConditionalAuthGuard)
  @PublicOrAuth()
  @ApiOperation({ summary: 'Get a meta by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the meta with usage information',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.metaService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a meta' })
  @ApiResponse({
    status: 200,
    description: 'The meta has been successfully updated.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMetaDto: UpdateMetaDto,
  ) {
    return this.metaService.update(id, updateMetaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a meta' })
  @ApiResponse({
    status: 200,
    description: 'The meta has been successfully deleted.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.metaService.remove(id);
  }
}
