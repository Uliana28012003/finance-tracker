import { useState } from "react";

const TransactionsList = ({ transactions, onDelete }) => {
  // Состояние для фильтрации по категориям и типу (доход/расход)
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Получаем уникальные категории из списка транзакций
  const categories = [
    "all",
    ...new Set(transactions.map((transaction) => transaction.category)),
  ];

  // Фильтруем транзакции по выбранной категории и типу
  const filteredTransactions = transactions.filter((transaction) => {
    const categoryMatch = selectedCategory === "all" || transaction.category === selectedCategory;
    const typeMatch = selectedType === "all" || transaction.type === selectedType;
    return categoryMatch && typeMatch;
  });

  // Сортировка транзакций по дате (от новых к старым)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Список транзакций</h2>

      {/* Фильтр по категориям */}
      <div className="mb-4">
        <label className="block mb-1">Фильтр по категории:</label>
        <select
          className="border p-2 w-full"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Фильтр по типу (доход/расход) */}
      <div className="mb-4">
        <label className="block mb-1">Фильтр по типу:</label>
        <select
          className="border p-2 w-full"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="all">Все</option>
          <option value="income">Доход</option>
          <option value="expense">Расход</option>
        </select>
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
                      transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'
                    }
                  >
                    {' '}
                    {transaction.amount} ₽
                  </span>
                </span>
                <span>
                  <strong>Тип:</strong> {transaction.type === 'expense' ? 'Расход' : 'Доход'}
                </span>
                <span>
                  <strong>Описание:</strong> {transaction.description || 'Нет описания'}
                </span>
                <span>
                  <strong>Дата:</strong> {new Date(transaction.date).toLocaleDateString()}
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
