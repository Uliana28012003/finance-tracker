import { useState, useEffect } from "react";
import TransactionsList from "./components/TransactionsList";
import AddTransaction from "./components/AddTransaction";
import AddCategory from "./components/AddCategory";
import axios from "axios";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (isAuthenticated && token) {
      axios
        .get("http://localhost:8000/api/transactions/", {
          headers: { Authorization: `Token ${token}` },
        })
        .then((res) => setTransactions(res.data))
        .catch((err) => console.error("Ошибка загрузки транзакций:", err));

      axios
        .get("http://localhost:8000/api/categories/", {
          headers: { Authorization: `Token ${token}` },
        })
        .then((res) => setCategories(res.data))
        .catch((err) => console.error("Ошибка загрузки категорий:", err));
    }
  }, [isAuthenticated]);

  const login = (username, password) => {
    setLoginError("");
    axios
      .post("http://localhost:8000/api-token-auth/", { username, password })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        setIsAuthenticated(true);
        setUser({ username });
      })
      .catch(() => setLoginError("Ошибка входа: неверный логин или пароль"));
  };

  const register = (username, password) => {
    setLoginError("");
    axios
      .post("http://localhost:8000/api/register/", { username, password })
      .then(() => {
        alert("Регистрация прошла успешно. Теперь войдите.");
        setIsRegistering(false);
      })
      .catch(() => setLoginError("Ошибка регистрации: имя занято"));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    setTransactions([]);
  };

  const showMessage = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleAddTransaction = (transaction) => {
    axios
      .post("http://localhost:8000/api/transactions/", transaction, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setTransactions((prev) => [...prev, res.data]);
        showMessage("✅ Транзакция добавлена");
      })
      .catch((error) => {
        console.error("Ошибка при добавлении транзакции:", error);
        console.log("Ответ от сервера:", JSON.stringify(error.response?.data, null, 2));
      });
  };

  const handleDeleteTransaction = (id) => {
    axios
      .delete(`http://localhost:8000/api/transactions/${id}/`, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      })
      .then(() => {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        showMessage("🗑️ Транзакция удалена");
      })
      .catch((err) => console.error("Ошибка удаления транзакции:", err));
  };

  const handleAddCategory = (category) => {
    setCategories((prev) => [...prev, category]);
    showMessage("📁 Категория добавлена");
  };

  return (
    <div className="App min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Finance Tracker</h1>

        {successMessage && (
          <div className="bg-green-100 text-green-700 p-3 mb-4 rounded text-center shadow">
            {successMessage}
          </div>
        )}

        {isAuthenticated ? (
          <>
            <p className="text-center text-lg">Добро пожаловать, {user?.username}!</p>
            <button onClick={logout} className="bg-red-500 text-white w-full py-2 mt-4 rounded-lg">
              Выйти
            </button>

            <div className="mt-6">
              {/* Только один раз отображаем AddCategory и AddTransaction */}
              <AddCategory onAdd={handleAddCategory} />
              <AddTransaction onAdd={handleAddTransaction} categories={categories} />
            </div>

            <div className="mt-6">
              <TransactionsList transactions={transactions} onDelete={handleDeleteTransaction} />
            </div>
          </>
        ) : (
          <div className="auth-container">
            <h2 className="text-xl font-semibold text-center mb-4">
              {isRegistering ? "Регистрация" : "Вход"}
            </h2>
            {loginError && <p className="text-red-500 text-center mb-4">{loginError}</p>}

            {!isRegistering ? (
              <div className="space-y-3">
                <input id="login-username" type="text" placeholder="Логин" className="w-full p-2 border rounded-lg" />
                <input id="login-password" type="password" placeholder="Пароль" className="w-full p-2 border rounded-lg" />
                <button
                  onClick={() =>
                    login(
                      document.getElementById("login-username").value,
                      document.getElementById("login-password").value
                    )
                  }
                  className="w-full bg-blue-500 text-white py-2 rounded-lg"
                >
                  Войти
                </button>
                <p className="text-center text-sm">
                  Нет аккаунта?{" "}
                  <button className="text-blue-500 underline" onClick={() => setIsRegistering(true)}>
                    Зарегистрироваться
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <input id="register-username" type="text" placeholder="Логин" className="w-full p-2 border rounded-lg" />
                <input id="register-password" type="password" placeholder="Пароль" className="w-full p-2 border rounded-lg" />
                <button
                  onClick={() =>
                    register(
                      document.getElementById("register-username").value,
                      document.getElementById("register-password").value
                    )
                  }
                  className="w-full bg-green-500 text-white py-2 rounded-lg"
                >
                  Зарегистрироваться
                </button>
                <p className="text-center text-sm">
                  Уже зарегистрированы?{" "}
                  <button className="text-blue-500 underline" onClick={() => setIsRegistering(false)}>
                    Войти
                  </button>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
