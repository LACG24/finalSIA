import React, { useState } from "react";
import "./search.css";
import { Link } from "react-router-dom";
import trashIcon from "../../assets/img/trashIcon.svg";
import addIcon from "../../assets/img/addIcon.svg";

export function SearchBar({
  onSearch,
  addCartNumber,
  deleteCartNumber,
  addActive,
  deleteActive,
  onDeleteSelected,
  onAddUser,
  searchType,
  goToFirstPage,
  disabled,
}) {
  const [inputText, setInputText] = useState("");

  const handleInputChange = (e) => {
    const searchText = e.target.value;
    setInputText(searchText);
    if (searchText === "") {
      onSearch(searchText);
      goToFirstPage();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch(inputText);
      goToFirstPage();
    }
  };

  return (
    <div className="search-bar-2">
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
        disabled={disabled}
        type="text"
        placeholder={
          disabled
            ? "Busqueda deshabilitada... (desactive los filtros de la barra lateral para habilitar la busqueda.)"
            : searchType === 0
            ? "Buscando por producto..."
            : searchType === 1
            ? "Buscando por cantidad..."
            : searchType === 2
            ? "Buscando por marca..."
            : searchType === 3
            ? "Buscando por existencia..."
            : searchType === 4
            ? "Buscando por caducidad..."
            : "Buscando..."
        }
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={
          searchType === 0
            ? "search-bar-producto-2"
            : searchType === 1
            ? "search-bar-cantidad-2"
            : searchType === 2
            ? "search-bar-marca-2"
            : searchType === 3
            ? "search-bar-stock-2"
            : searchType === 4
            ? "search-bar-caducidad-2"
            : "search-bar-2"
        }
      />
      <div className="deleteCart">
        <p className={deleteCartNumber === 0 ? "hidden" : "deleteCartNumber"}>
          {deleteCartNumber}
        </p>
        <Link to="/CheckDateDelete">
          <button
            className={`icon-button delete ${
              deleteActive ? "active-delete" : ""
            }`}
            onClick={onDeleteSelected}
            disabled={!deleteActive}
          >
            <img className="trashIconPhoto" src={trashIcon} alt="Add" />
          </button>
        </Link>
      </div>
    </div>
  );
}
