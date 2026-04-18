// Ambient module declarations for libraries without types
// Makes TS happy when importing these modules in strict mode.

declare module "multer-storage-cloudinary" {
  import type { StorageEngine } from "multer";

  export class CloudinaryStorage implements StorageEngine {
    constructor(opts: any);
    _handleFile(
      req: any,
      file: any,
      cb: (error?: any, info?: any) => void
    ): void;
    _removeFile(
      req: any,
      file: any,
      cb: (error: Error) => void
    ): void;
  }
}
