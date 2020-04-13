# Parse Cloud Image

Parse Cloud module for image manipulation using [sharp](https://sharp.pixelplumbing.com/)

## Getting started

Install the module by npm

```
$ npm i -S parse-cloud-image
```

or using yarn

```
$ yarn add parse-cloud-image
```

## Resize image before save

Processing images can be done using the new file triggers on Parse Server introduced in version 4.2.0 All triggers can be found [here](https://docs.parseplatform.org/cloudcode/guide/#beforesavefile-triggers)

Define `beforeSaveFile` trigger:

```ts
import { ParseImage } from 'parse-cloud-image'

Parse.Cloud.beforeSaveFile(async (request: Parse.Cloud.FileTriggerRequest) => {
    const image = ParseImage.from(request.file)
    return image.resize(256)
})
```

Create `ParseImage` to make image manipulations. If the file is not an image file error will be thrown. 

## ParseImage

`ParseImage` wraps a `ParseFile` and provides several basic methods for manipulations:

### Resize

When both a width and height are provided, aspect ratio will be preserve, ensure the image covers both provided dimensions by cropping/clipping to fit. For more options check [sharp's documentation](https://sharp.pixelplumbing.com/api-resize) and use `process` method below

```ts
const image = ParseImage.from(parseFile)
image.resize(256, 128)
```

### Rotate

Rotate the image by specified angle. For more options check [sharp's documentation](https://sharp.pixelplumbing.com/api-operation#rotate) and use `process` method below

```ts
const image = ParseImage.from(parseFile)
image.rotate() // auto-rotated using EXIF Orientation tag
```

### Scale

Scaling the image by specified factor. For more options check [sharp's documentation](https://sharp.pixelplumbing.com/api-resize) and use `process` method below

```ts
const image = ParseImage.from(parseFile)
image.scale(1.0, 0.5)
```

### Edit and process

These methods are the heart of the `ParseImage` because give elegant access to all capabilities of `sharp` over given `ParseFile`. Let's say you need to flip and rotate the image. This can be done like this:

```ts
const image = ParseImage.from(parseFile)
const processedImage = await this.edit(proc => proc.flip().rotate().toBuffer())
}
```

At the end the closure must return `Buffer` from the chain of actions which will be serialized as new `ParseFile`.

## Advanced usage

In some cases you would need option to manipulate in parallel image or create multiple different changes on different `clones` of the image. This can be done with `sharp` and the `process` method of `ParseImae` which can return a `Sharp` instances which can be piped. 