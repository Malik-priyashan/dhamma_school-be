import { BadRequestException } from '@nestjs/common';

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const imageUploadOptions = {
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(
    _request: unknown,
    file: { mimetype: string },
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) {
    if (!allowedImageTypes.has(file.mimetype)) {
      callback(new BadRequestException('Only JPEG, PNG, and WebP images are allowed'), false);
      return;
    }
    callback(null, true);
  },
};
