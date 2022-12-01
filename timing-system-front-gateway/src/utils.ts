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

export async function retry<T, E = any>(
  runner: () => Promise<T>,
  option?: {
    retryCount?: number,
    onRetry: () => Promise<any>
  }
): Promise<T> {
  const defaultOption = {
    retryCount: 2
  };

  const defaultedOption = {
    ...defaultOption,
    option
  }

  let error: E | undefined = undefined;
  for (let i = 0; i < defaultOption.retryCount; i++) {
    try {
      return await runner();
    } catch(e) {
      option?.onRetry && option.onRetry();
      error = e;
    }
  }
  throw error;
}
