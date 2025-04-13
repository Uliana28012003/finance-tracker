import { useState, useEffect } from "react";
import TransactionsList from "./components/TransactionsList";
import AddTransaction from "./components/AddTransaction";
import axios from "axios";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [refreshTransactions, setRefreshTransactions] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // ✅ уведомление

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
        .then((response) => {
          setTransactions(response.data);
          setRefreshTransactions(false);
        })
        .catch((error) => {
          console.error("Ошибка при получении транзакций:", error);
        });
    }
  }, [isAuthenticated, refreshTransactions]);

  const login = (username, password) => {
    setLoginError("");
    axios
      .post("http://localhost:8000/api-token-auth/", { username, password })
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        setIsAuthenticated(true);
        setUser({ username });
      })
      .catch(() => {
        setLoginError("Ошибка входа: Неверное имя пользователя или пароль");
      });
  };

  const register = (username, password) => {
    setLoginError("");
    axios
      .post("http://localhost:8000/api/register/", { username, password })
      .then(() => {
        alert("Регистрация успешна! Теперь войдите в систему.");
        setIsRegistering(false);
      })
      .catch(() => {
        setLoginError("Ошибка регистрации: Возможно, пользователь уже существует");
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    setTransactions([]);
  };

  const showMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleAddTransaction = (newTransaction) => {
    axios
      .post("http://localhost:8000/api/transactions/", newTransaction, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        setTransactions((prev) => [...prev, response.data]);
        showMessage("✅ Транзакция успешно добавлена");
      })
      .catch((error) => {
        console.error("Ошибка при добавлении транзакции:", error);
      });
  };

  const handleDeleteTransaction = (id) => {
    axios
      .delete(`http://localhost:8000/api/transactions/${id}/`, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      })
      .then(() => {
        setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
        showMessage("🗑️ Транзакция удалена");
      })
      .catch((error) => {
        console.error("Ошибка при удалении транзакции:", error);
      });
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
            <p className="text-center text-lg">Добро пожаловать, {user?.username || "гость"}!</p>
            <button onClick={logout} className="bg-red-500 text-white w-full py-2 mt-4 rounded-lg">
              Выйти
            </button>

            <div className="mt-6">
              <AddTransaction onAdd={handleAddTransaction} />
            </div>
            <div className="mt-6">
              <TransactionsList transactions={transactions} onDelete={handleDeleteTransaction} />
            </div>
          </>
        ) : (
          <div className="auth-container">
            <h2 className="text-xl font-semibold text-center mb-4">
              {isRegistering ? "Регистрация" : "Вход в систему"}
            </h2>
            {loginError && <p className="text-red-500 text-center mb-4">{loginError}</p>}

            {!isRegistering ? (
              <div className="space-y-3">
                <input type="text" placeholder="Логин" id="login-username" className="w-full p-2 border border-gray-300 rounded-lg" />
                <input type="password" placeholder="Пароль" id="login-password" className="w-full p-2 border border-gray-300 rounded-lg" />
                <button
                  onClick={() =>
                    login(
                      document.getElementById("login-username").value,
                      document.getElementById("login-password").value
                    )
                  }
                  className="w-full bg-blue-500 text-white py-2 rounded-lg mt-3"
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
                <input type="text" placeholder="Логин" id="register-username" className="w-full p-2 border border-gray-300 rounded-lg" />
                <input type="password" placeholder="Пароль" id="register-password" className="w-full p-2 border border-gray-300 rounded-lg" />
                <button
                  onClick={() =>
                    register(
                      document.getElementById("register-username").value,
                      document.getElementById("register-password").value
                    )
                  }
                  className="w-full bg-green-500 text-white py-2 rounded-lg mt-3"
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
