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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FindDocumentsDto } from './dto/find-documents.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ConditionalAuthGuard } from '../auth/guards/conditional-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PublicOrAuth } from '../auth/decorators/public-or-auth.decorator';
import { Role } from '../auth/types/role.enum';
import { JwtUser } from '../auth/types/jwt.types';

@Controller('documents')
@ApiTags('Documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'Create a new document',
    description:
      'Creates a new document with optional meta tags and categories',
  })
  @ApiResponse({
    status: 201,
    description: 'The document has been successfully created',
  })
  create(
    @GetUser() user: JwtUser,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentService.create(user.userId, createDocumentDto);
  }

  @Get()
  @UseGuards(ConditionalAuthGuard)
  @PublicOrAuth()
  @ApiOperation({
    summary: 'Get all documents with pagination, filtering and search',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated documents with metadata',
  })
  findAll(@GetUser() user: JwtUser | null, @Query() query: FindDocumentsDto) {
    return this.documentService.findAll(user?.userId, query);
  }

  @Get(':id')
  @UseGuards(ConditionalAuthGuard)
  @PublicOrAuth()
  findOne(@GetUser() user: JwtUser | null, @Param('id') id: string) {
    return this.documentService.findOne(+id, user?.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  update(
    @GetUser() user: JwtUser,
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(+id, user.userId, updateDocumentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@GetUser() user: JwtUser, @Param('id') id: string) {
    return this.documentService.remove(+id, user.userId);
  }
}
