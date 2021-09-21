export function arrayBufferToString(buffer: ArrayBuffer): string {
  const view = new Int8Array(buffer);
  let result = "";
  for (let i = 0; i < view.length; i += 1) {
    result += String.fromCharCode(view[i]);
  }
  return result;
}

export function _arrayBufferToString(buffer: ArrayBuffer): string {
  let tmp = [];
  const len = 1024;
  for (var p = 0; p < buffer.byteLength; p += len) {
    tmp.push(
      String.fromCharCode.apply(
        "",
        new Uint8Array(buffer.slice(p, p + len)) as any
      )
    );
  }
  return tmp.join("");
}
