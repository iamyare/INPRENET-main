import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { PdfService } from './pdf/pdf.service';
import { DriveService } from './drive/drive.service';

@Module({
  controllers: [DocumentsController],
  providers: [PdfService, DriveService],
})
export class DocumentsModule {}
