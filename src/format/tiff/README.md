Number format: both little endian and big endian

Pixel formats (bits per sample):
* Gray 8, 32
* RGB 8, 16, 32, 64

FormatTiff ---> BitmapFormat
 |
 +-(n)-FrameTiff ---> BitmapFrame
       |
       +--Ifd
          |
          +-(n)-IfdEntry