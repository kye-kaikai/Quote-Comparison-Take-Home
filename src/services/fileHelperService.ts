import * as fs from 'fs';
import csv from 'csv-parser';
import { parse } from 'csv-parse';
import { RecognizedCarriers } from './recognizedCarriersService';
import { ParserErrorMsgs } from './errorMsgService';
import { RecognizedQuoteFiles } from './recognizedQuoteFilesService';

export class FileHelper {
    static getFileExt(path: string): string {
        const fileExtIdx: number = path.lastIndexOf('.');
        return fileExtIdx === -1 ? '' : path.substring(fileExtIdx);
    }

    static async readDataFromFile(carrier: string, filePath: string | undefined): Promise<string> {
        const mappedFilePath: string = RecognizedCarriers.carrierToFilePaths.get(carrier)!;
        const trueFilePath: string = (filePath ?? mappedFilePath).toLowerCase();
        const fileExt: string = FileHelper.getFileExt(trueFilePath);

        if (!fileExt) {
            throw new Error(ParserErrorMsgs.MISSING_FILE_EXT);
        } else if (!RecognizedQuoteFiles.fileExts.has(fileExt)) {
            throw new Error(ParserErrorMsgs.INVALID_FILE_EXT);
        }

        if (!fs.existsSync(trueFilePath)) {
            throw new Error(ParserErrorMsgs.MISSING_QUOTE_FILE);
        }

        if (fileExt === RecognizedQuoteFiles.CSV) {
            return await FileHelper.csvReader(trueFilePath);
        } else {
            return await FileHelper.jsonReader(trueFilePath);
        }
    }

    static async csvReader(path: string): Promise<string> {
        let allData: any[] = [];

        return new Promise((res, _) => {
            fs.createReadStream(path)
                .pipe(csv())
                .on('data', (data: any) => {
                    if (Object.keys(data).length > 0) {
                        allData.push(data)
                    }
                })
                .on('end', () => {
                    res(JSON.stringify(allData));
                });
        });
    }

    static async jsonReader(path: string): Promise<string> {
        return new Promise((res, _) => {
            fs.readFile(path, 'utf8', (err, data) => {
                res(data);
            })
        });
    }

    static async convertCSVRawData(data: string): Promise<string> {
        const results: any = [];
        return new Promise((res, _) => {
            const parser = parse(data, { columns: true, skip_empty_lines: true });
            parser.on('readable', () => {
                let record;
                while ((record = parser.read()) !== null) {
                    results.push(record);
                }
            })

            parser.end();
            res(JSON.stringify(results));
        })
    }
}