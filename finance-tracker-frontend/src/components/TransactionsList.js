import { useEffect, useState } from "react";
import axios from "axios";

const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Получаем данные о транзакциях с сервера
    axios.get("http://localhost:5000/transactions")
      .then((response) => {
        setTransactions(response.data.transactions);
      })
      .catch((error) => {
        console.error("Ошибка при получении транзакций:", error);
      });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Список транзакций</h2>
      <ul className="border p-4 rounded-lg">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="mb-2">
            {transaction.category} — {transaction.amount} ₽ ({transaction.type})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionsList;
