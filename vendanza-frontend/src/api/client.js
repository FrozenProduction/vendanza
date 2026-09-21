export function getToken() {
  return localStorage.getItem('token');
}

export async function fetchComToken(url, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : '',
  };
  return fetch(url, { ...options, headers });
}

export async function apiJson(url, options = {}) {
  const response = await fetchComToken(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erro HTTP ${response.status}`);
  }
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  return response.text();
}
