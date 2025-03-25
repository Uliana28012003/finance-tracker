import { useState, useEffect } from "react";
import TransactionsList from "./components/TransactionsList";
import AddTransaction from "./components/AddTransaction";
import axios from "axios";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");  // Для отображения ошибок входа

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
          setIsAuthenticated(false);
          setUser(null);
        });
    }
  }, []);

  // Функция входа
  const login = (username, password) => {
    setLoginError(""); // Сбрасываем ошибку перед новым запросом
    axios
      .post("http://localhost:5000/login", { username, password })
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        setIsAuthenticated(true);
        setUser(response.data.user);
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
        });
    }
  }, [isAuthenticated]);

  // Добавление транзакции
  const handleAddTransaction = (newTransaction) => {
    axios
      .post(
        "http://localhost:5000/transactions", // Используем тот же маршрут для добавления транзакции
        newTransaction,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((response) => {
        setTransactions((prevTransactions) => [...prevTransactions, response.data]);
      })
      .catch((error) => {
        console.error("Ошибка при добавлении транзакции:", error);
      });
  };

  // Удаление транзакции
  const handleDeleteTransaction = (id) => {
    axios
      .delete(`http://localhost:5000/transactions/${id}`, {  // Исправили путь на /transactions/:id
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        setTransactions((prevTransactions) =>
          prevTransactions.filter((transaction) => transaction.id !== id)
        );
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
          <p>Добро пожаловать, {user?.username}!</p>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2">
            Выйти
          </button>
          <AddTransaction onAdd={handleAddTransaction} />
          <TransactionsList transactions={transactions} onDelete={handleDeleteTransaction} />
        </>
      ) : (
        <div>
          <h2>Войти в систему</h2>
          {loginError && <p className="text-red-500">{loginError}</p>} {/* Отображение ошибки */}
          <button
            onClick={() => login("newuser", "123456")}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Войти (тестовый)
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
