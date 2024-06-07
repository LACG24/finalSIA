import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { formatDate } from "../../generalFunctions";
import "react-calendar/dist/Calendar.css";
import "./CalendarInputDate.css";

export function CalendarInputDate({ name, value, onChange, resetKey }) {
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [inputText, setInputText] = useState(value ? formatDate(new Date(value)) : "");

  useEffect(() => {
    if (value) {
      setDate(new Date(value));
      setInputText(formatDate(new Date(value)));
    }
  }, [value]);

  useEffect(() => {
    if (resetKey) {
      setDate(new Date());
      setInputText("");
    }
  }, [resetKey]);

  const handleDateChange = (date) => {
    const formattedDate = formatDate(date);
    setDate(date);
    setInputText(formattedDate);
    setShowCalendar(false);
    if (onChange) {
      onChange({ target: { name, value: formattedDate } });
    }
  };

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setInputText(inputValue);
    if (isValidDate(inputValue)) {
      setDate(new Date(inputValue));
      if (onChange) {
        onChange({ target: { name, value: inputValue } });
      }
    }
  };

  const handleBlur = () => {
    if (isValidDate(inputText) && inputText !== formatDate(date)) {
      const newDate = new Date(inputText);
      setDate(newDate);
      if (onChange) {
        onChange({ target: { name, value: formatDate(newDate) } });
      }
    }
  };

  const isValidDate = (inputValue) => {
    return /^\d{4}\/\d{2}\/\d{2}$/.test(inputValue);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  return (
    <div className="calendarD-inputD-containerD">
      <input
        value={inputText}
        name={name}
        type="text"
        className="calendarD-inputD"
        placeholder="aaaa-mm-dd"
        onChange={handleInputChange}
        onBlur={handleBlur}
        onClick={toggleCalendar}
      />

      {showCalendar && (
        <div className="calendarD-popupD-containerD">
          <Calendar
            locale="es"
            onChange={handleDateChange}
            value={date}
            className="calendarD-popupD"
          />
        </div>
      )}
    </div>
  );
}
