/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';
import 'multer';

@Injectable()
export class CloudinaryService {
  //méthode pour qui récupère le file intercepté par multer, et le dossier de destination, afin de l'injecter.
  uploadFile(
    file: Express.Multer.File,
    folder = 'employe_documents',
  ): Promise<UploadApiResponse> {
    //retourne une promesse resolve ou reject.
    return new Promise((resolve, reject) => {
      //on crée un flux d'écriture vers folder (nom du dossier) Cloudinary et on laisse cloudinary résoudre le type
      //de ce qu'on veut upload.
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        //soit on fini par recevoir une erreur soit l'opéraion est validée.
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            // Transforme l'objet d'erreur en instance d'Error pour satisfaire le linter
            return reject(new Error(error.message || JSON.stringify(error)));
          }

          if (!result) {
            reject(new Error('Cloudinary upload failed'));
            return;
          }

          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
  deleteFile(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      void cloudinary.uploader.destroy(publicId, (error, result) => {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  // Utilitaire pour extraire le Public ID à partir de l'URL Cloudinary
  extractPublicIdFromUrl(url: string): string {
    // Ex d'URL: https://res.cloudinary.com/demo/image/upload/v1612345678/employes_docs/doc_123.pdf
    const parts = url.split('/');
    const filenameWithExtension = parts.pop(); // ex: doc_123.pdf
    const folderPath = parts.slice(parts.indexOf('upload') + 2).join('/'); // ex: employes_docs

    if (!filenameWithExtension) {
      throw new Error('URL Cloudinary invalide : aucun fichier trouvé');
    }
    const filename = filenameWithExtension.split('.')[0]; // ex: doc_123

    return folderPath ? `${folderPath}/${filename}` : filename;
  }
}
