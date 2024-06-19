import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Readable } from 'typeorm/platform/PlatformTools';

@Injectable()
export class DriveService {
  private auth: any;

  constructor() {
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    };

    this.auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
  }

  private bufferToStream(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  async uploadFile(fileName: string, buffer: Buffer): Promise<string> {
    const drive = google.drive({ version: 'v3', auth: await this.auth.getClient() });
    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_FOLDER_ID], 
    };
    const media = {
      mimeType: 'application/pdf',
      body: this.bufferToStream(buffer),
    };

    try {
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });

      
      return response.data.id;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file to Google Drive');
    }
  }

}
