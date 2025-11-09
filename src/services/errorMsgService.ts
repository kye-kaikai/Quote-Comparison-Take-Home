import { RecognizedCarriers } from "./recognizedCarriersService";
import { RecognizedQuoteFiles } from "./recognizedQuoteFilesService";

export class ParserErrorMsgs {
    static readonly UNKNOWN_CARRIER: string =
        `Unknown carrier provided to parser. Please provide a recognized carrier: ${[...RecognizedCarriers.carrierToFilePaths.keys()].join(', ')}`;
    static readonly MISSING_FILE_EXT: string = "The carrier's file path is missing a file extension";
    static readonly INVALID_FILE_EXT: string =
        `The carrier's file extension is invalid. Please provide a recognized file extension: ${[...RecognizedQuoteFiles.fileExts].join(', ')}`;
    static readonly MISSING_QUOTE_FILE: string = "The carrier's quote file is missing";
}