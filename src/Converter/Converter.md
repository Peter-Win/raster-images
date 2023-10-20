Конвертер служит для преобразования и копирования пиесельных данных из идного источника в другой.
Основные ситуации:
1. Получение информации из произвольного источника (обычно чтение из файла) и запись в поверхность.
2. Копирование из поверхности произвольному получателю (обычно запись в файл).

Возможно построение цепочек из нескольких конвертеров, каждый из которых выполняет свою операцию по преобразованию пикселей.

Преобразования обычно происходят построчно, чтобы не создавать промежуточных поверхностей. 
Т.к. это может привести к выделению слишком большого объёма памяти.

Есть три условных уровня конвертирования:
- На самом нижнем уровне находятся операции построчного преобразования пикселей. Они располагаются в папке rowOps.
- Средний уровень - объекты типа Converter, которые позволяют выполнить определённые преобразования для поверхностей. Кроме того, конвертеры могут передавать данные друг другу по цепочке. Эта функциональность находится в папке converters.
- На верхнем уровне находится функция createConverter и механизмы для формирования цепочек конвертеров. Это фабрики конвертеров и алгоритмы поиска путей для преобразования из одного пиксельного формата в другой.