export function arrayBufferToString(buffer: ArrayBuffer): string {
  const view = new Int8Array(buffer);
  let result = "";
  for (let i = 0; i < view.length; i += 1) {
    result += String.fromCharCode(view[i]);
  }
  return result;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function showEl(el: HTMLElement) {
  el.style.display = "block";
}

export function hideEl(el: HTMLElement) {
  el.style.display = "none";
}
