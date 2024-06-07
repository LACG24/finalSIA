import "./DropDown.css";
import React, { useEffect, useState } from "react";
import editIcon from "../../assets/img/editIcon.svg";
import addIcon from "../../assets/img/addIcon.svg";
import trashIcon from "../../assets/img/trashIcon.svg";
import { ConfirmationPopUp } from "../confirmationPopUp";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
export function DropDown({
  value,
  onChange,
  name,
  tableName,
  label,
  title,
  optional,
  cdr,
  removeCheck,
  setIsModalOpenRemove,
  showCRD,
  setShowCRD,
  setIsModalOpenCRD,
  setValidationMessageCRD,
}) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [optionToRemove, setOptionToRemove] = useState({});

  useEffect(() => {
    fetch(`http://${API_HOST}:${API_PORT}/${tableName}`)
      .then((response) => response.json())
      .then((data) => {
        if (optional) {
          setOptions([{ [name]: 0, [label]: "Sin marca" }, ...data]);
        } else {
          setOptions(data);
        }
      });
  }, [tableName, optional, label, name]);

  useEffect(() => {
    if (removeCheck) {
      handleRemoveOption(optionToRemove);
    }
  }, [removeCheck, optionToRemove]);

  useEffect(() => {
    if (options.length > 0 && value === undefined) {
      onChange({ target: { name, value: options[0][name] } });
    }
  }, [options, value, onChange, name]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    onChange({ target: { name, value: selectedValue } });
  };

  const handleAddOption = () => {
    //validacion de campos vacios y 30 caracteres maximo, todas las palabras empezando con mayuscula, para las mayuculas el sistema hace el formato en automatico

    if (inputValue === "") {
      setValidationMessageCRD("El campo no puede estar vacío");
      setIsModalOpenCRD(true);
      return;
    }
    if (inputValue.length > 30) {
      setValidationMessageCRD("El campo no puede tener más de 30 caracteres");
      setIsModalOpenCRD(true);
      return;
    }
    //formato, cada palabra empieza con mayuscula, si no lo cumple cambiar a mayusculas el input antes de enviarlo
    const words = inputValue.split(" ");
    const formattedWords = words.map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    const formattedInputValue = formattedWords.join(" ");
    //validacion de que no exista la opcion en la lista
    const optionExists = options.some(
      (option) =>
        option[label].toLowerCase() === formattedInputValue.toLowerCase()
    );
    if (optionExists) {
      setValidationMessageCRD("La opción ya existe");
      setIsModalOpenCRD(true);
      return;
    }

    const newOption = {
      [name]: formattedInputValue,
      [label]: formattedInputValue,
    };
    setOptions([...options, newOption]);
    fetch(`http://${API_HOST}:${API_PORT}/${tableName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newOption),
    }).then((response) => {
      if (response.ok) {
        console.log("New option added successfully");
        fetch(`http://${API_HOST}:${API_PORT}/${tableName}`)
          .then((response) => response.json())
          .then((data) => {
            if (optional) {
              setOptions([{ [name]: 0, [label]: "Sin marca" }, ...data]);
            } else {
              setOptions(data);
            }
          });
      }
    });
  };

  const handleRemoveOption = (optionToRemove) => {
    setOptions(
      options.filter((option) => option[name] !== optionToRemove[name])
    );
    fetch(
      `http://${API_HOST}:${API_PORT}/${tableName}/${optionToRemove[name]}`,
      {
        method: "DELETE",
      }
    ).then((response) => {
      if (response.ok) {
        console.log("Option removed successfully");
      }
    });
  };

  const filteredOptions = options.filter((option) =>
    option[label].toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleEditButton = () => {
    setShowCRD(!showCRD);
    setInputValue("");
  };

  const handleSpanClick = (option) => {
    onChange({ target: { name, value: option[name] } });
    setShowCRD(false);
  };

  return (
    <div className="dropDownContainer">
      <div className="headerDropDownContainer">
        <label>{title}</label>
        {cdr && (
          <button className="editButtonCRD" onClick={handleEditButton}>
            <img src={editIcon} alt="editIcon"></img>
          </button>
        )}
      </div>

      {cdr && showCRD && (
        <div className="dropdown-crd">
          <div className="dropdown-crd-header">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Buscar o agregar..."
            />
            <button onClick={handleAddOption}>
              <img src={addIcon} alt="addIcon"></img>
            </button>
          </div>

          <div className="dropdownCRD-options">
            {[...filteredOptions]
              .sort((a, b) => a[label].localeCompare(b[label]))
              .map((option) => (
                <div
                  key={option[name]}
                  className="dropdownCRD-option"
                  onClick={() => handleSpanClick(option)}
                >
                  <span className="option-span">{option[label]}</span>
                  {option[name] !== 0 ? (
                    <button
                      className="remove-button"
                      onClick={(e) => {
                        e.stopPropagation(); // Evitar que el evento de clic se propague al contenedor
                        setIsModalOpenRemove(true);
                        setOptionToRemove(option);
                      }}
                    >
                      <img src={trashIcon} alt="trashIcon" />
                    </button>
                  ) : (
                    <span className="placeholder-button" />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
      <select name={name} value={value} onChange={handleSelectChange}>
        {options.map((option) => (
          <option key={option[name]} value={option[name]}>
            {cdr ? option[label] : option[label] + " (" + option[name] + ")"}
          </option>
        ))}
      </select>
    </div>
  );
}
