import { useState } from "react";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";

const TransactionsList = ({ transactions, onDelete }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const categories = [
    "all",
    ...new Set(transactions.map((transaction) => transaction.category)),
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    return (
      (selectedCategory === "all" || transaction.category === selectedCategory) &&
      (selectedType === "all" || transaction.type === selectedType)
    );
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortField === "date") {
      return sortOrder === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    } else if (sortField === "amount") {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
    }
    return 0;
  });

  const toggleSortOrder = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Список транзакций</h2>

      <div className="flex gap-4 mb-4">
        <select
          className="border p-2 rounded"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="all">Все</option>
          <option value="income">Доход</option>
          <option value="expense">Расход</option>
        </select>

        <button
          className="border p-2 rounded flex items-center"
          onClick={() => toggleSortOrder("date")}
        >
          Дата {sortField === "date" && (sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />)}
        </button>

        <button
          className="border p-2 rounded flex items-center"
          onClick={() => toggleSortOrder("amount")}
        >
          Сумма {sortField === "amount" && (sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />)}
        </button>
      </div>

      <ul className="border p-4 rounded-lg">
        {sortedTransactions.length > 0 ? (
          sortedTransactions.map((transaction) => (
            <li
              key={transaction.id}
              className="flex justify-between items-center mb-2 p-2 border-b"
            >
              <div className="flex flex-col">
                <span>
                  <strong>Категория:</strong> {transaction.category}
                </span>
                <span>
                  <strong>Сумма:</strong>
                  <span
                    className={
                      transaction.type === "expense" ? "text-red-500" : "text-green-500"
                    }
                  >
                    {' '}
                    {transaction.amount.toLocaleString()} ₽
                  </span>
                </span>
                <span>
                  <strong>Тип:</strong> {transaction.type === "expense" ? "Расход" : "Доход"}
                </span>
                <span>
                  <strong>Описание:</strong> {transaction.description || "Нет описания"}
                </span>
                <span>
                  <strong>Дата:</strong> {new Date(transaction.date).toLocaleDateString("ru-RU")}
                </span>
              </div>
              <button
                className="bg-red-500 text-white p-1 rounded-lg"
                onClick={() => onDelete(transaction.id)}
              >
                Удалить
              </button>
            </li>
          ))
        ) : (
          <p>Нет транзакций</p>
        )}
      </ul>
    </div>
  );
};

export default TransactionsList;
