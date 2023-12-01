# The Photoshop File Format
Specification: http://www.adobe.com/devnet-apps/photoshop/fileformatashtml/PhotoshopFileFormats.htm

Byte Ordering: big endian

Pixel formats:
* Duotone
* Indexed 8
* Grayscale 8, 16, 32
* RGB 8, 16, 32
* CMYK 8, 16

PhotoShop CS3 can't create CMYK 32.
GIMP can read CMYK, but can't operate it and converts to RGB.
