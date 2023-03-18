type HandledResponse = [Error | null, any];
type Options = {
  skipParse: boolean;
};

export const handleRequest = async (
  url: RequestInfo | URL,
  init?: RequestInit,
  options?: Options
): Promise<HandledResponse> => {
  const { skipParse = false } = options ?? {};
  try {
    const response = await fetch(url, init);
    let output = "Ok";
    if (!skipParse) {
      output = await response.json();
    }
    return [null, output];
  } catch (error) {
    console.error(error);
    return [error as Error, null];
  }
};

export const dataUrlToBlob = (dataUrl: string, mimeType: string) => {
  const binary = atob(dataUrl.split(",")[1]);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: mimeType });
};
