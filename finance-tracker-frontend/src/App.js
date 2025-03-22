import { useState, useEffect } from "react";
import TransactionsList from "./components/TransactionsList";
import AddTransaction from "./components/AddTransaction";
import axios from "axios";

function App() {
  const [transactions, setTransactions] = useState([]);

  // Загружаем список транзакций при старте
  useEffect(() => {
    axios
      .get("http://localhost:5000/transactions")
      .then((response) => {
        setTransactions(response.data.transactions);
      })
      .catch((error) => {
        console.error("Ошибка при получении транзакций:", error);
      });
  }, []);

  // Добавление транзакции
  const handleAddTransaction = (newTransaction) => {
    setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);
  };

  // Удаление транзакции
  const handleDeleteTransaction = (id) => {
    axios
      .delete(`http://localhost:5000/transaction/${id}`)
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
      <AddTransaction onAdd={handleAddTransaction} />
      <TransactionsList transactions={transactions} onDelete={handleDeleteTransaction} />
    </div>
  );
}

export default App;
