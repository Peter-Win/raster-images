import { RAStream } from "./RAStream";

/**
 * Механизм для автоматического вызова lock/unlock для выполнения задач с потоками.
 * @param stream
 * @param onLock функция, внутри которой поток доступен для чтения/записи
 */
export const streamLock = async <Res>(
  stream: RAStream,
  onLock: (stream: RAStream) => Promise<Res>
): Promise<Res> => {
  try {
    await stream.lock();
    return await onLock(stream);
  } finally {
    stream.unlock();
  }
};
