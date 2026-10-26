const TOKEN_KEY = 'kaveh_battery_token';
let memoryToken = '';

function safeReadStorage() {
  if (memoryToken) return memoryToken;
  try {
    const sVal = window.sessionStorage?.getItem(TOKEN_KEY);
    if (sVal) {
      memoryToken = sVal;
      return sVal;
    }
  } catch {
    // Blocked in strict cross-origin iframe; fallback to memoryToken
  }
  try {
    const lVal = window.localStorage?.getItem(TOKEN_KEY);
    if (lVal) {
      memoryToken = lVal;
      return lVal;
    }
  } catch {
    // Blocked in strict cross-origin iframe; fallback to memoryToken
  }
  return '';
}

export function getStoredToken() {
  return safeReadStorage();
}

export function setStoredToken(token) {
  memoryToken = token ? String(token) : '';
  try {
    if (memoryToken) {
      window.sessionStorage?.setItem(TOKEN_KEY, memoryToken);
    } else {
      window.sessionStorage?.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore iframe storage restrictions
  }
  try {
    if (memoryToken) {
      window.localStorage?.setItem(TOKEN_KEY, memoryToken);
    } else {
      window.localStorage?.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore iframe storage restrictions
  }
}

export async function apiRequest(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  let finalPath = path;
  if (token) {
    headers['X-Kaveh-Token'] = token;
    headers.Authorization = `Bearer ${token}`;
    if (!finalPath.includes('kaveh_token=')) {
      const sep = finalPath.includes('?') ? '&' : '?';
      finalPath = `${finalPath}${sep}kaveh_token=${encodeURIComponent(token)}`;
    }
  }

  const res = await fetch(finalPath, {
    ...options,
    headers,
  });

  if (res.status === 401 && !path.startsWith('/api/auth/login')) {
    setStoredToken('');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `خطای ارتباط با سرور (${res.status})`);
  }
  return data;
}

export function buildCsvDownloadUrl(queryParams = {}) {
  const params = new URLSearchParams();
  const token = getStoredToken();
  if (token) params.set('kaveh_token', token);
  for (const [k, v] of Object.entries(queryParams)) {
    if (v !== undefined && v !== null && v !== '') {
      params.set(k, String(v));
    }
  }
  return `/api/admin/sepidar/export.csv?${params.toString()}`;
}

export function buildBotFileDownloadUrl(fileName) {
  const token = getStoredToken();
  return `/api/admin/bot/download/${encodeURIComponent(fileName)}${
    token ? `?kaveh_token=${encodeURIComponent(token)}` : ''
  }`;
}
