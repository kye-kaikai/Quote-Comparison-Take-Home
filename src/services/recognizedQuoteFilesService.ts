export class RecognizedQuoteFiles {
    static readonly CSV = '.csv';
    static readonly JSON = '.json';

    static readonly fileExts: Set<string> = new Set([
        '.csv',
        '.json'
    ]);
}