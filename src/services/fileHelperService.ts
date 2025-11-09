export class FileHelper {
    static getFileExt(path: string): string {
        const fileExtIdx: number = path.lastIndexOf('.');
        return fileExtIdx === -1 ? '' : path.substring(fileExtIdx);
    }
}