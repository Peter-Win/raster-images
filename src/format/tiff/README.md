TIFF - Tagged Image File Format

Number format: both little endian and big endian

Pixel formats (bits per sample):
* Gray 8, 32, ext, +Alpha
* RGB 8, 16, 32, 64, ext, +Alpha
* CMYK 8, 16, +Alpha
* Indexed
ext: Non-standard formats with an arbitrary number of bits per sample.

Compression methods:
* Without compression
* CCITT Huffman
* Group3 Fax (T4)
* Group4 Fax (T6)
* PackBits
* LZW
* ZIP

FormatTiff ---> BitmapFormat
 |
 +-(n)-FrameTiff ---> BitmapFrame
       |
       +--Ifd
          |
          +-(n)-IfdEntry