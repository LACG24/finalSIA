import React from "react";
import "./TextInputAdd.css";

export function TextInputAdd({ label, placeholder, onChange, name, value, list }) {
  // Función de cambio con validación para solo números
  const handleChange = (e) => {
    const { value } = e.target;
    // Permitir solo números
    if (/^\d*$/.test(value)) {
      onChange(e); // Llama a onChange con el evento
    }
  };

  return (
    <div className="textInputAdd">
      <label>{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        list={list}
      />
    </div>
  );
}
