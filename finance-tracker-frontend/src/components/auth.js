// auth.js
const API_URL = "http://localhost:8000"; // Django backend

export async function login(username, password) {
  const response = await fetch(`${API_URL}/api-token-auth/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (response.ok) {
    localStorage.setItem("token", data.token); // сохраняем токен
    return data;
  } else {
    throw new Error("Ошибка входа: Неверные данные");
  }
}

export async function register(username, password) {
  const response = await fetch(`${API_URL}/api/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (response.ok) {
    return data;
  } else {
    throw new Error("Ошибка регистрации: пользователь уже существует");
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
  const response = await fetch(`${API_URL}/api/transactions/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  return response.json();
}
