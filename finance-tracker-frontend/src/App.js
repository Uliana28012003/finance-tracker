import { useState, useEffect } from "react";
import TransactionsList from "./components/TransactionsList";
import AddTransaction from "./components/AddTransaction";
import axios from "axios";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Проверяем токен при загрузке приложения
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/protected", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setIsAuthenticated(true);
          setUser(response.data.user);
        })
        .catch(() => {
          logout(); // Разлогиниваем, если токен невалиден
        });
    }
  }, []);

  // Функция входа
  const login = () => {
    setLoginError("");
    axios
      .post("http://localhost:5000/login", { username, password })
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        setIsAuthenticated(true);
        setUser(response.data.user);
        setUsername("");
        setPassword("");
      })
      .catch((error) => {
        setLoginError("Ошибка входа: Неверное имя пользователя или пароль");
        console.error("Ошибка входа:", error);
      });
  };

  // Функция выхода
  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    setTransactions([]);
  };

  // Загружаем список транзакций, если пользователь авторизован
  useEffect(() => {
    if (isAuthenticated) {
      axios
        .get("http://localhost:5000/transactions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          setTransactions(response.data.transactions);
        })
        .catch((error) => {
          console.error("Ошибка при получении транзакций:", error);
          if (error.response?.status === 401) {
            logout(); // Автоматический выход при просроченном токене
          }
        });
    }
  }, [isAuthenticated]);


// Добавление транзакции
const handleAddTransaction = (newTransaction) => {
  console.log("Данные для отправки на сервер:", newTransaction);  // Логируем перед отправкой

  axios
    .post("http://localhost:5000/transactions", newTransaction, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      "Content-Type": "application/json",
    })
    .then((response) => {
      console.log("Транзакция добавлена:", response.data);  // Логируем успешный ответ сервера
      setTransactions((prevTransactions) => [...prevTransactions, response.data.transaction]);
    })
    .catch((error) => {
      console.error("Ошибка при добавлении транзакции:", error);  // Логируем ошибку
    });
};

  

  // Удаление транзакции
  const handleDeleteTransaction = (id) => {
    axios
      .delete(`http://localhost:5000/transactions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        setTransactions((prevTransactions) => prevTransactions.filter((transaction) => transaction.id !== id));
      })
      .catch((error) => {
        console.error("Ошибка при удалении транзакции:", error);
      });
  };

  return (
    <div className="App">
      <h1 className="text-2xl font-bold text-center mt-4">Finance Tracker</h1>

      {isAuthenticated ? (
        <>
          <p>Добро пожаловать, {user?.username || "пользователь"}!</p>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2">
            Выйти
          </button>
          <AddTransaction onAdd={handleAddTransaction} />
          <TransactionsList transactions={transactions} onDelete={handleDeleteTransaction} />
        </>
      ) : (
        <div className="login-form">
          <h2>Войти в систему</h2>
          {loginError && <p className="text-red-500">{loginError}</p>}
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 mb-2"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 mb-2"
          />
          <button onClick={login} className="bg-blue-500 text-white px-4 py-2">
            Войти
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
