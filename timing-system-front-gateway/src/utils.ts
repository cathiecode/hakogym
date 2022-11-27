export function promisify<T, E = any>(
  runner: (callback: (error: E, response: T) => void) => void
): Promise<T> {
  return new Promise((resolve, reject) =>
    runner((error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    })
  );
}
