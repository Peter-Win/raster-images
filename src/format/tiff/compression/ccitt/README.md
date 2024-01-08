// The beginning of the encoding for each row of a strip or tile is conducted as if there is an imaginary preceding (0-width) white pixel, that is as if a fresh run of white pixels has just commenced. The completion of each line is encoded as if there are imaginary pixels beyond the end of the current line, and of the preceding line, in effect, of colors chosen such that the line is exactly completable by a codeword, making the imaginary next pixel a changing element that’s not actually used.
// Начало кодирования для каждой строки полосы или фрагмента выполняется так, как если бы существовал воображаемый предшествующий белый пиксель (ширины 0), то есть как если бы только что начался новый набор белых пикселей. Завершение каждой строки кодируется так, как если бы за концом текущей строки и предыдущей строки, по сути, находились воображаемые пиксели, цвета которых выбраны так, что строка точно завершается кодовым словом, что делает следующий воображаемый пиксель изменение элемента, который фактически не используется.

// The encodings of successive lines follow contiguously in the binary T.6-Encoding stream with no special initiation or separation codewords. There are no provisions for fill codes or explicit end-of-line indicators. The encoding of the last line of the pixel array is followed immediately, in place of any additional line encodings, by a 24-bit End-of-Facsimile Block (EOFB).
// Кодировки последовательных строк следуют непрерывно в двоичном потоке кодирования T.6 без каких-либо специальных кодовых слов инициации или разделения. Не предусмотрены коды заполнения или явные индикаторы конца строки. За кодированием последней строки массива пикселей немедленно следует, вместо любых дополнительных кодировок строк, 24-битный блок конца факсимиле (EOFB).
//  000000000001000000000001.B.

// The EOFB sequence is immediately followed by enough 0-bit padding to fit the entire stream into a sequence of 8-bit bytes.
// За последовательностью EOFB сразу следует достаточное количество 0-битных дополнений, чтобы уместить весь поток в последовательность 8-битных байтов.

// General Application. Because of the single uniform encoding procedure, without disruptions by end-of-line codes and shifts into one-dimensional encodings, T.6-encoding is very popular for compression of bi-level images in document imaging systems. T.6-encoding trades off redundancy for minimum encoded size, relying on the underlying storage and transmission systems for reliable retention and communication of the encoded stream.
// TIFF readers will operate most smoothly by always ignoring bits beyond the EOFB. Some writers may produce additional bytes of pad bits beyond the byte containing the final bit of the EOFB. Robust readers will not be disturbed by this prospect.
// Читатели TIFF будут работать наиболее плавно, всегда игнорируя биты за пределами EOFB. Некоторые устройства записи могут создавать дополнительные байты битов заполнения помимо байта, содержащего последний бит EOFB. Настойчивых читателей такая перспектива не смутит.

// It is not possible to correctly decode a T.6-Encoding without knowledge of the exact number of pixels in each line of the pixel array. ImageWidth (or TileWidth, if used) must be stated exactly and accurately. If an image or segment is overscanned, producing extraneous pixels at the beginning or ending of lines, these pixels must be counted. Any cropping must be accomplished by other means. It is not possible to recover from a pixel-count deviation, even when one is detected. Failure of any row to be completed as expected is cause for abandoning further decoding of the entire segment. There is no requirement that ImageWidth be a multiple of eight, of course, and readers must be prepared to pad the final octet bytes of decoded bitmap rows with additional bits.
// If a TIFF reader encounters EOFB before the expected number of lines has been extracted, it is appropriate to assume that the missing rows consist entirely of white pixels. Cautious readers might produce an unobtrusive warning if such an EOFB is followed by anything other than pad bits.
// Если программа чтения TIFF обнаруживает EOFB до того, как ожидаемое количество строк было извлечено, уместно предположить, что недостающие строки полностью состоят из белых пикселей. Осторожные читатели могут выдать ненавязчивое предупреждение, если за таким EOFB следует что-либо, кроме битов заполнения.

// Readers that successfully decode the RowsPerStrip (or TileLength or residual ImageLength) number of lines are not required to verify that an EOFB follows. That is, it is generally appropriate to stop decoding when the expected lines are decoded or the EOFB is detected, whichever occurs first. Whether error indications or warnings are also appropriate depends upon the application and whether more precise troubleshooting of encoding deviations is important.
// Читателям, которые успешно декодируют количество строк RowsPerStrip (или TileLength или остаточное ImageLength), не требуется проверять наличие EOFB. То есть обычно целесообразно остановить декодирование, когда ожидаемые строки декодированы или обнаружен EOFB, в зависимости от того, что произойдет раньше. Уместность индикации ошибок или предупреждений также зависит от приложения и важности более точного устранения отклонений кодирования.

// TIFF writers should always encode the full, prescribed number of rows, with a proper EOFB immediately following in the encoding. Padding should be by the least number of 0-bits needed for the T.6-encoding to exactly occupy a multiple of 8 bits. Only 0-bits should be used for padding, and StripByteCount (or TileByteCount) should not extend to any bytes not containing properly-formed T.6-encoding. In addition, even though not required by T.6-encoding rules, successful interchange with a large variety of readers and applications will be enhanced if writers can arrange for the number of pixels per line and the number of lines per strip to be multiples of eight.
// Средства записи TIFF всегда должны кодировать полное заданное количество строк с правильным EOFB, следующим сразу за кодировкой. Заполнение должно осуществляться наименьшее количество нулевых битов, необходимое для того, чтобы кодировка T.6 точно занимала кратное 8 битам. Для заполнения следует использовать только 0-бит, а StripByteCount (или TileByteCount) не должен распространяться на байты, не содержащие правильно сформированную кодировку T.6. Кроме того, хотя это и не требуется правилами кодирования T.6, успешный обмен данными с большим количеством устройств чтения и приложений будет улучшен, если устройства записи смогут обеспечить кратность числа пикселей в строке и количества строк в полосе. восемь.

// Uncompressed Mode. Although T.6-encodings of simple bi-level images result in data compressions of 10:1 and better, some pixel-array patterns have T.6- encodings that require more bits than their simple bi-level bitmaps. When such cases are detected by encoding procedures, there is an optional extension for shifting to a form of uncompressed coding within the T.6-encoding string.
// Несжатый режим. Хотя кодирование T.6 простых двухуровневых изображений приводит к сжатию данных 10:1 и лучше, некоторые шаблоны пиксельных массивов имеют кодировки T.6, которые требуют больше битов, чем их простые двухуровневые растровые изображения. Когда такие случаи обнаруживаются процедурами кодирования, существует дополнительное расширение для перехода к форме несжатого кодирования внутри строки кодирования T.6.

// Uncompressed mode is not well-specified and many applications discourage its usage, prefering alternatives such as different compressions on a segment-bysegment (strip or tile) basis, or by simply leaving the image uncompressed in its entirety. The main complication for readers is in properly restoring T.6-encoding after the uncompressed sequence is laid down in the current row.
// Несжатый режим не очень четко определен, и многие приложения не рекомендуют его использовать, предпочитая такие альтернативы, как различные сжатия по сегментам (полоса или плитка) или просто оставляя изображение несжатым целиком. Основная сложность для читателей заключается в правильном восстановлении кодировки T.6 после укладки несжатой последовательности в текущую строку.

// Uncompressed mode is signalled by the occurence of the 10-bit extension code string
// Несжатый режим сигнализируется появлением 10-битной строки кода расширения.
// 0000001111.B
// outside of any run-length make-up code or extension. Original unencoded image information follows. In this unencoded information, a 0-bit evidently signifies a white pixel, a 1-bit signifies a black pixel, and the TIFF PhotometricInterpretation will influence how these bits are mapped into any final uncompressed bitmap for use. The only modification made to the unencoded information is insertion of a 1-bit after every block of five consecutive 0-bits from the original image information. This is a transparency device that allows longer sequencences of 0-bits to be reserved for control conditions, especially ending the uncompressed-mode sequence. When it is time to return to compressed mode, the 8-bit exit sequence
// вне какого-либо кода или расширения длины серии. Далее следует исходная незакодированная информация об изображении. В этой некодированной информации 0-бит, очевидно, означает белый пиксель, 1-бит означает черный пиксель, и фотометрическая интерпретация TIFF будет влиять на то, как эти биты отображаются в любое окончательное несжатое растровое изображение для использования. Единственная модификация, вносимая в некодированную информацию, — это вставка 1 бита после каждого блока из пяти последовательных нулевых битов исходной информации изображения. Это устройство прозрачности, которое позволяет зарезервировать более длинные последовательности нулевых битов для условий управления, особенно для завершения последовательности в несжатом режиме. Когда придет время вернуться в режим сжатия, 8-битная последовательность выхода
//   0000001t.B

// 400x300
// Пустая строка: 00 13 50 34 05 C0 04 D4 0D 01     0001:0011 0101:0000,0011:0100,0000:0101
// 012345678
// ..X.....XXXX____
// 00 13 5C 73 B0 34 60 02 6A 06                              0101:1100,0111:0011,1011:0000
// 001, W0,B2,W1


//  00 11 D4 21 CC 75 8B 9C 27 43
//  0001.0001;1101.0100;0010.0001;1100.1100
//       <-----><--><---><-> <-----><--->
// .X...X.XXXXX.X.....X
// .X...X.X.....X.....X
// 
// W1,     B1,  W3,   B1,  W1,     B5,  W1,    B1
// 000111, 010, 1000, 010, 000111, 0011 000111 010


00 11 D4 21 CC 75 8B 9C 27 43 A1 C0 04 75 08
00        11        D4        21        CC        75
0000.0000 0001.0001 1101.0100 0010.0001 1100.1100 0111.0101
0000.0000.0001 EOL
000111 W1
010 B1