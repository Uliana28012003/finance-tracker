import { useState } from "react";
import axios from "axios";

const AddTransaction = ({ onAdd }) => {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  // Список предопределённых категорий
  const categories = ["Продукты", "Стипендия", "Одежда", "Здоровье", "Транспорт", "Развлечения", "Зарплата", "Другое"];

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem("token");
  
    const newTransaction = {
      category,
      amount: parseFloat(amount),
      type,
      description,
      date,
    };
  
    console.log("Отправляемая транзакция:", newTransaction);
  
    axios
      .post("http://localhost:5000/transactions", newTransaction, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        onAdd(response.data.transaction);
        setCategory("");
        setAmount("");
        setDescription("");
        setDate("");
      })
      .catch((error) => {
        console.error("Ошибка при добавлении транзакции:", error);
      });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Добавить транзакцию</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="block mb-1">Категория</label>
          <select
            className="border p-2 w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Выберите категорию</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block mb-1">Сумма</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Тип</label>
          <select
            className="border p-2 w-full"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="expense">Расход</option>
            <option value="income">Доход</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="block mb-1">Описание</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Дата</label>
          <input
            type="date"
            className="border p-2 w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded-lg">
          Добавить транзакцию
        </button>
      </form>
    </div>
  );
};

export default AddTransaction;
