/**
 * Механизм отображения прогресса обработки изображений.
 * А так же через него можно сделать, чтобы алгоритм не забирал всё процессорное время, а отдавал его другим задачам.
 * См. interrupter
 */
export interface ProgressInfo {
  init?: boolean; // Этот флажок используется для регистрации всех возможных шагов преобразования.
  step: "read" | "write" | string; // Обработка может выполняться в несколько шагов. Например, если формируется палитра.
  maxValue: number; // Всегда соответствует высоте изображения.
  value: number; // Всегда меняется от 0 до maxValue (включительно). То есть на 1 больше, чем количество строк.
  // Причём, 0 появляется 2 раза. Сначала с флажком init. Так что общее число вызовов одного шага = maxValue+2
  y: number; // Алгоритмы могут обрабатывать строки в любом порядке. Это реальный индекс обрабатываемой строки.
}

export type OnProgressInfo = (info: ProgressInfo) => Promise<void>;

export const createProgressTracker =
  (progress: OnProgressInfo | undefined, step: string, maxValue: number) =>
  async (value: number, y: number, init?: boolean) => {
    if (progress) await progress({ step, maxValue, value, y, init });
  };
