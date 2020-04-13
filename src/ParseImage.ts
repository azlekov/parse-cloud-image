import * as mime from 'mime';
import * as sharp from 'sharp';

export default class ParseImage {

    static async from(parseFile: Parse.File): Promise<ParseImage> {
        const data = await parseFile.getData()
        return new ParseImage(parseFile.name(), Buffer.from(data, 'base64'))
    }

    private filename: string;
    private data: Buffer;
    private contentType: string;

    constructor(filename: string, data: Buffer, contentType?: string) {
        this.filename = filename
        this.data = data
        this.contentType = contentType || mime.getType(filename)

        if (!contentType.startsWith('image/')) {
            throw new Parse.Error(Parse.Error.INCORRECT_TYPE, `It seems that ${filename} is not a image and cannot be processed.`)
        }
    }

    async process<Buffer>(block: (proc: sharp.Sharp) => Buffer): Promise<Buffer>
    async process<Sharp>(block: (proc: sharp.Sharp) => sharp.Sharp): Promise<sharp.Sharp>
    async process(block: (proc: sharp.Sharp) => Buffer | sharp.Sharp): Promise<Buffer | sharp.Sharp> {
        return block(sharp(this.data).withMetadata())
    }

    async edit(block: (proc: sharp.Sharp) => Promise<Buffer>): Promise<Parse.File> {
        const buffer = await block(sharp(this.data).withMetadata())
        return new Parse.File(this.filename, { base64: buffer.toString('base64') })
    }

    async rotate(angle?: number): Promise<Parse.File> {
        const bufferedData = await this.process(proc => proc.rotate(angle).toBuffer())
        return new Parse.File(this.filename, { base64: bufferedData.toString('base64') })
    }

    async resize(width?: number, height?: number): Promise<Parse.File> {
        const bufferedData = await this.process((proc) => proc.resize(width, height).toBuffer())
        return new Parse.File(this.filename, { base64: bufferedData.toString('base64') })
    }

    async scale(width = 1, height = 1): Promise<Parse.File> {
        const bufferedData = await this.process((proc) => proc.metadata().then(metadata => {
            return proc.resize({ width: Math.round(metadata.width * width), height: Math.round(metadata.height * height) }).toBuffer()
        }))

        return new Parse.File(this.filename, { base64: bufferedData.toString('base64') })
    }
}