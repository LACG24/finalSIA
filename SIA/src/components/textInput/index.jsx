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
      <label>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        list={list}
      />
      {<p className="errorMessage">{errorMessage}</p>}
    </div>
  );
}
