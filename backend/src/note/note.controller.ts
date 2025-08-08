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
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { FindNotesDto } from './dto/find-notes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { JwtUser } from '../auth/types/jwt.types';

@Controller('notes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({
    status: 201,
    description: 'The note has been successfully created.',
  })
  create(@GetUser() user: JwtUser, @Body() createNoteDto: CreateNoteDto) {
    return this.noteService.create(user.userId, createNoteDto);
  }

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get all notes with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated notes with metadata',
  })
  findAll(@GetUser() user: JwtUser, @Query() query: FindNotesDto) {
    return this.noteService.findAll(user.userId, query);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get a note by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the note',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: JwtUser) {
    return this.noteService.findOne(id, user.userId);
  }

  @Patch(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update a note' })
  @ApiResponse({
    status: 200,
    description: 'The note has been successfully updated.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: JwtUser,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return this.noteService.update(id, user.userId, updateNoteDto);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a note' })
  @ApiResponse({
    status: 200,
    description: 'The note has been successfully deleted.',
  })
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: JwtUser) {
    return this.noteService.remove(id, user.userId);
  }
}
