import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState(""); // Используем username вместо email
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }), // Отправляем username, а не email
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Ошибка входа");

      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard"; // Переход на главную страницу
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Вход в систему</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <input
          type="text" // Теперь это поле для имени пользователя (username)
          placeholder="Имя пользователя"
          value={username} // Используем username
          onChange={(e) => setUsername(e.target.value)} // Обновляем username
          className="w-full p-2 border rounded mb-2"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Войти
        </button>
      </form>
    </div>
  );
}
