enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

const defaultOptions: RequestOptions = {
  method: HttpMethod.GET,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const httpClient = async <T>(
  url: string,
  options: RequestOptions = defaultOptions
): Promise<T> => {
  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return await response.json();
};
