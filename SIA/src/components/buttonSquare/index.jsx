import React from "react";
import "./buttonSquare.css";

export function ButtonSquare({
  textElement,
  onClick,
  color = "var(--color-button-blue)",
}) {
  const buttonStyle = {
    backgroundColor: color,
  };

  return (
    <button className="acc" style={buttonStyle} onClick={onClick}>
      {textElement}
    </button>
  );
}

export function ButtonCircle({
  textElement,
  onClick,
  color = "var(--color-button-blue)",
}) {
  const buttonStyle = {
    backgroundColor: color,
  };

  return (
    <button className="accC" onClick={onClick}>
      {textElement}
    </button>
  );
}
