import React, { useState } from "react";
import "./searchBar.css";
import { Link } from "react-router-dom"; // Añade esta línea
import trashIcon from "../../assets/img/trashIcon.svg"; // Añade esta línea
import addIcon from "../../assets/img/addIcon.svg"; // Añade esta línea

export function SearchBar({
  onSearch,
  addCartNumber,
  deleteCartNumber,
  addActive,
  deleteActive,
  onDeleteSelected,
  onAddUser,
}) {
  const [inputText, setInputText] = useState("");

  const handleInputChange = (e) => {
    const searchText = e.target.value;
    setInputText(searchText);
    // Call the onSearch function with the updated search text
    onSearch(searchText);
  };

  return (
    <div className="search-bar">
      <div className="addCart">
        <p className={addCartNumber === 0 ? "hidden" : "addCartNumber"}>
          {addCartNumber}
        </p>
        <button
          className={`icon-button add ${addActive ? "active-add" : ""}`}
          onClick={onAddUser}
        >
          <img className="addIconPhoto" src={addIcon} alt="Add" />
        </button>
      </div>
      <input
        type="text"
        placeholder="Buscar..."
        value={inputText}
        onChange={handleInputChange}
      />
      <div className="deleteCart">
        <p className={deleteCartNumber === 0 ? "hidden" : "deleteCartNumber"}>
          {deleteCartNumber}
        </p>
        <button
          className={`icon-button delete ${
            deleteActive ? "active-delete" : ""
          }`}
          onClick={onDeleteSelected}
          disabled={!deleteActive}
        >
          <img className="trashIconPhoto" src={trashIcon} alt="Delete" />
        </button>
      </div>
    </div>
  );
}
