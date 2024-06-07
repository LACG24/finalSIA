import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { formatDate } from "../../generalFunctions";
import "react-calendar/dist/Calendar.css";
import "./CalendarInput.css";

export function CalendarInput({
  name,
  value,
  onChange,
  errorMessage,
  setValidationMessage,
  antiBlock,
  setAntiBlock,
  setIndividualValidationMessage,
  setCheckDate,
}) {
  const [date, setDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (value) {
      setDate(new Date(value));
      setInputText(formatDate(new Date(value)));
    } else {
      setDate(null);
      setInputText("");
    }
  }, [value]);

  useEffect(() => {
    if (antiBlock) {
      handleInputChange({ target: { value: inputText } });
      setAntiBlock(false);
    }
  }, [antiBlock]);

  const handleDateChange = (date) => {
    setDate(date);
    const formattedDate = formatDate(date);
    setInputText(formattedDate);
    setShowCalendar(false);
    if (onChange) {
      onChange({ target: { name, value: formattedDate } });
    }
    clearValidationMessages();
    setCheckDate(true); // Reset checkDate when a valid date is selected
    setAntiBlock(false); // Reset antiBlock when a valid date is selected
  };

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setInputText(inputValue);
    if (inputValue === "") {
      setDate(null);
      setCheckDate(true);
      if (onChange) {
        onChange({ target: { name, value: "" } });
      }
      clearValidationMessages();
    } else if (isValidDate(inputValue)) {
      setDate(new Date(inputValue));
      setCheckDate(true);
      if (onChange) {
        onChange({ target: { name, value: inputValue } });
      }
      clearValidationMessages();
    } else {
      setCheckDate(false);
    }
  };

  const handleBlur = () => {
    if (inputText === "") {
      setDate(null);
      clearValidationMessages();
      if (onChange) {
        onChange({ target: { name, value: "" } });
      }
    } else if (isValidDate(inputText)) {
      const newDate = new Date(inputText);
      if (inputText !== formatDate(date)) {
        setDate(newDate);
        if (onChange) {
          onChange({ target: { name, value: inputText } });
        }
      }
      clearValidationMessages();
      setCheckDate(true); // Reset checkDate when the input is valid
      setAntiBlock(false); // Reset antiBlock when the input is valid
    } else {
      setValidationMessage("La fecha de caducidad no es válida (aaaa/mm/dd).");
      setIndividualValidationMessage({
        productValidationMessage: "",
        stockValidationMessage: "",
        expirationDateValidationMessage:
          "La fecha de caducidad no es válida (aaaa/mm/dd).",
        quantityValidationMessage: "",
      });
    }
  };

  const isValidDate = (inputValue) => {
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(inputValue)) {
      return false;
    }
    const [year, month, day] = inputValue.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    if (year < 1) {
      setValidationMessage(
        "El año de la fecha de caducidad no es válido (mayor a 0)."
      );
      setIndividualValidationMessage({
        productValidationMessage: "",
        stockValidationMessage: "",
        expirationDateValidationMessage:
          "El año de la fecha de caducidad no es válido (mayor a 0).",
        quantityValidationMessage: "",
      });
      return false;
    }

    if (month < 1 || month > 12) {
      setValidationMessage(
        "El mes de la fecha de caducidad no es válido (1-12)."
      );
      setIndividualValidationMessage({
        productValidationMessage: "",
        stockValidationMessage: "",
        expirationDateValidationMessage:
          "El mes de la fecha de caducidad no es válido (1-12).",
        quantityValidationMessage: "",
      });
      return false;
    }

    if (day < 1 || day > 31) {
      setValidationMessage(
        "El día de la fecha de caducidad no es válido (1-31)."
      );
      setIndividualValidationMessage({
        productValidationMessage: "",
        stockValidationMessage: "",
        expirationDateValidationMessage:
          "El día de la fecha de caducidad no es válido (1-31).",
        quantityValidationMessage: "",
      });
      return false;
    }

    if (
      date.getFullYear() !== year ||
      date.getMonth() + 1 !== month ||
      date.getDate() !== day
    ) {
      setValidationMessage("La fecha de caducidad no es válida (aaaa/mm/dd).");
      setIndividualValidationMessage({
        productValidationMessage: "",
        stockValidationMessage: "",
        expirationDateValidationMessage:
          "La fecha de caducidad no es válida (aaaa/mm/dd).",
        quantityValidationMessage: "",
      });
      return false;
    }

    return true;
  };

  const clearValidationMessages = () => {
    setIndividualValidationMessage({
      productValidationMessage: "",
      stockValidationMessage: "",
      expirationDateValidationMessage: "",
      quantityValidationMessage: "",
    });
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  return (
    <div className="calendar-input-container">
      <label>Fecha de Caducidad</label>
      <input
        value={inputText}
        name={name}
        type="text"
        className="calendar-input"
        placeholder="aaaa/mm/dd"
        onChange={handleInputChange}
        onBlur={handleBlur}
        onClick={toggleCalendar}
      />
      <p className="errorMessage">{errorMessage}</p>

      {showCalendar && (
        <div className="calendar-popup-container">
          <Calendar
            locale="es"
            onChange={handleDateChange}
            value={date || new Date()}
            className="calendar-popup"
          />
        </div>
      )}
    </div>
  );
}
