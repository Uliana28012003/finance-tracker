// auth.js
const API_URL = "http://localhost:5000"; // Адрес бэкенда

export async function login(username, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem("token", data.token); // Сохраняем токен
    return data;
  } else {
    throw new Error(data.message);
  }
}

export async function register(username, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (response.ok) {
    return data; // Возвращаем данные, но токен пока не сохраняем
  } else {
    throw new Error(data.message);
  }
}

export function logout() {
  localStorage.removeItem("token");
}

export function getToken() {
  return localStorage.getItem("token");
}

export async function fetchProtectedData() {
  const token = getToken();
  const response = await fetch(`${API_URL}/protected`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}
