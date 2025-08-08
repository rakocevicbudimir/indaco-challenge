import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DocumentModule } from './document/document.module';
import { BlogModule } from './blog/blog.module';
import { NoteModule } from './note/note.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    DocumentModule,
    BlogModule,
    NoteModule,
  ],
})
export class AppModule {}
