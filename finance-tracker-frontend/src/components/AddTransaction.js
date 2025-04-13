import { useState, useEffect } from "react";
import axios from "axios";
import AddCategory from "./AddCategory";

const AddTransaction = ({ onAdd }) => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  // Загружаем категории
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8000/api/categories/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Ошибка загрузки категорий:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    const newTransaction = {
      category_id: parseInt(categoryId), // 💥 обязательно число
      amount: parseFloat(amount),
      type,
      description,
      date,
    };
  
    console.log("🚀 Отправляем транзакцию:", newTransaction); // ✅ лог перед отправкой
  
    axios
      .post("http://localhost:8000/api/transactions/", newTransaction, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((response) => {
        console.log("✅ Ответ от сервера:", response.data);
        onAdd(newTransaction);
        setCategoryId("");
        setAmount("");
        setDescription("");
        setDate("");
      })
      .catch((error) => {
        console.error("❌ Ошибка при добавлении транзакции:", error);
        console.log("🔍 Ответ от сервера:", error.response?.data);
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
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Выберите категорию</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
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
            required
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

        <div className="mb-4">
          <label className="block mb-1">Дата</label>
          <input
            type="date"
            className="border p-2 w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded-lg"
        >
          Добавить транзакцию
        </button>
      </form>

      <div className="mt-6">
        <AddCategory
          onCategoryAdded={(newCat) => setCategories((prev) => [...prev, newCat])}
        />
      </div>
    </div>
  );
};

export default AddTransaction;
