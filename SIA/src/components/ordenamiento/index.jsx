import React, { useEffect, useState } from "react";
import "./ordenamiento.css";

export function Ordenamiento({ message, options, option, setOptions }) {
  const [circleColor, setCircleColor] = useState(false);

  const handleClick = () => {
    //solo se permite un filtro a la vez junto con un ordenamiento a la vez f1...f4 y o1...o5
    if (option[0] === "f") {
      for (let key in options) {
        if (key[0] === "f" && key !== option) {
          setOptions((prevOptions) => ({ ...prevOptions, [key]: false }));
        }
      }
    } else {
      for (let key in options) {
        if (key[0] === "o" && key !== option) {
          setOptions((prevOptions) => ({ ...prevOptions, [key]: false }));
        }
      }
    }
    setOptions((prevOptions) => ({
      ...prevOptions,
      [option]: !options[option],
    }));

    setCircleColor(!circleColor);
  };

  return (
    <div className="rectangulo-azul">
      <a href="#" className="hipervinculo" onClick={handleClick}>
        {message}
      </a>
      <button
        onClick={handleClick}
        className="circulo"
        style={{
          backgroundColor: options[option] ? "green" : "rgb(190,190,190)",
        }}
      ></button>
    </div>
  );
}
