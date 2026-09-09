/** Minimal typings for the parts of piexifjs this project uses. */
declare module 'piexifjs' {
  interface ImageIFDTags {
    ImageDescription: number;
    Artist: number;
    Copyright: number;
    Software: number;
    XPTitle: number;
    XPComment: number;
    XPAuthor: number;
    XPKeywords: number;
    XPSubject: number;
    [key: string]: number;
  }

  interface ExifDump {
    '0th': Record<number, unknown>;
    Exif: Record<number, unknown>;
    GPS: Record<number, unknown>;
    Interop: Record<number, unknown>;
    '1st': Record<number, unknown>;
    thumbnail: string | null;
  }

  const piexif: {
    ImageIFD: ImageIFDTags;
    ExifIFD: Record<string, number>;
    dump(exifObj: ExifDump): string;
    /** Both arguments are binary strings (latin1), as is the return value. */
    insert(exifBytes: string, jpegData: string): string;
    load(jpegData: string): ExifDump;
    remove(jpegData: string): string;
  };

  export default piexif;
}
