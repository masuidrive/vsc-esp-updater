// delay with await
export function delay(duration: number): Promise<void> {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}
