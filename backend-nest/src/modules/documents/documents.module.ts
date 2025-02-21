import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { PdfService } from './pdf/pdf.service';
import { DriveService } from './drive/drive.service';
import { AfiliacionService } from '../Persona/afiliacion/afiliacion.service';
import { AfiliadoModule } from '../Persona/afiliado.module';
import { BitacoraModule } from '../bitacora/bitacora.module';

@Module({
  imports: [AfiliadoModule, BitacoraModule],
  controllers: [DocumentsController],
  providers: [PdfService, DriveService, AfiliacionService],
})
export class DocumentsModule {}
