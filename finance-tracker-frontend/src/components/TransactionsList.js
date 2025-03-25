const TransactionsList = ({ transactions, onDelete }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Список транзакций</h2>
      <ul className="border p-4 rounded-lg">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <li key={transaction.id} className="flex justify-between items-center mb-2 p-2 border-b">
              <div className="flex flex-col">
                <span>
                  <strong>Категория:</strong> {transaction.category}
                </span>
                <span>
                  <strong>Сумма:</strong> {transaction.amount} ₽
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
