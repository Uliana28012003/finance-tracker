import { useState } from "react";
import axios from "axios";

const AddCategory = ({ onAdd }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    axios
      .post("http://localhost:8000/api/categories/", { name }, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((response) => {
        onAdd(response.data); // добавим новую категорию в список
        setName("");
      })
      .catch((error) => {
        console.error("Ошибка при добавлении категории:", error);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <h3 className="text-lg font-bold mb-2">Добавить категорию</h3>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Название категории"
          className="border p-2 flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit" className="bg-green-500 text-white px-4 rounded-lg">
          Добавить
        </button>
      </div>
    </form>
  );
};

export default AddCategory;
