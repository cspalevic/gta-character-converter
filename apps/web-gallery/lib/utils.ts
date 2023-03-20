export const dataUrlToBlob = (dataUrl: string, mimeType: string) => {
  const binary = atob(dataUrl.split(",")[1]);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: mimeType });
};
