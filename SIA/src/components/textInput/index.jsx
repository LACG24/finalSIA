import React from "react";
import "./TextInput.css";

export function TextInput({
  label,
  placeholder,
  onChange,
  name,
  value,
  list,
  errorMessage,
  type = "text",
}) {
  return (
    <div className="textInput">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        list={list}
      />
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}
    </div>
  );
}
