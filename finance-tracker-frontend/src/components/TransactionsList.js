import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const TransactionsList = ({ transactions, onDelete }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("dateDesc");

  const categories = ["all", ...new Set(transactions.map((t) => t.category))];

  const filteredTransactions = transactions.filter((t) =>
    (selectedCategory === "all" || t.category === selectedCategory) &&
    (selectedType === "all" || t.type === selectedType)
  );

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === "dateAsc") return new Date(a.date) - new Date(b.date);
    if (sortBy === "dateDesc") return new Date(b.date) - new Date(a.date);
    if (sortBy === "amountAsc") return a.amount - b.amount;
    if (sortBy === "amountDesc") return b.amount - a.amount;
  });

  const expensesData = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.keys(expensesData).map((key) => ({
    name: key,
    value: expensesData[key],
    percentage: ((expensesData[key] / Object.values(expensesData).reduce((acc, value) => acc + value, 0)) * 100).toFixed(2),
  }));

  // Разделяем данные для доходов и расходов
  const incomeData = filteredTransactions.filter(t => t.type === 'income').map(t => ({
    date: new Date(t.date).toLocaleDateString(),
    amount: t.amount
  }));

  const expenseData = filteredTransactions.filter(t => t.type === 'expense').map(t => ({
    date: new Date(t.date).toLocaleDateString(),
    amount: t.amount
  }));

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Список транзакций</h2>
      <div className="mb-4 flex gap-2">
        <select className="border p-2" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
        <select className="border p-2" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="all">Все</option>
          <option value="income">Доход</option>
          <option value="expense">Расход</option>
        </select>
        <select className="border p-2" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="dateDesc">Дата ↓</option>
          <option value="dateAsc">Дата ↑</option>
          <option value="amountDesc">Сумма ↓</option>
          <option value="amountAsc">Сумма ↑</option>
        </select>
      </div>
      <ul className="border p-4 rounded-lg">
        {sortedTransactions.length ? sortedTransactions.map((t) => (
          <li key={t.id} className="flex justify-between items-center mb-2 p-2 border-b">
            <div className="flex flex-col">
              <span><strong>Категория:</strong> {t.category}</span>
              <span><strong>Сумма:</strong> <span className={t.type === 'expense' ? 'text-red-500' : 'text-green-500'}> {t.amount.toLocaleString()} ₽</span></span>
              <span><strong>Тип:</strong> {t.type === 'expense' ? 'Расход' : 'Доход'}</span>
              <span><strong>Описание:</strong> {t.description || 'Нет описания'}</span>
              <span><strong>Дата:</strong> {new Date(t.date).toLocaleDateString('ru-RU')}</span>
            </div>
            <button className="bg-red-500 text-white p-1 rounded-lg" onClick={() => onDelete(t.id)}>Удалить</button>
          </li>
        )) : <p>Нет транзакций</p>}
      </ul>

      <div className="mt-8">
        <h3 className="text-lg font-bold">График расходов по категориям</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={({ name, percentage }) => `${name}: ${percentage}%`}>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][index % 4]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} ₽`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold">Динамика доходов/расходов</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={incomeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#00C49F" name="Доходы" />
          </LineChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={expenseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#FF8042" name="Расходы" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TransactionsList;
