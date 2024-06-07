import React, { useState } from "react";
import "./returnButton.css";
import returnImage from "../../assets/img/returnImage.png";
import { useNavigate } from "react-router-dom";

export function ReturnButton({ textElement, onClick }) {
  const [color, setColor] = useState("var(--color-gray)");
  let navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    navigate(-1);
  };

  return (
    <div className="returnButtonContainer">
      <button
        className="returnButton"
        onClick={handleClick}
        style={{
          backgroundColor: color,
          color: "white",
          padding: "10px 20px",
          border: "none",
          cursor: "pointer",
        }}
      >
        <img src={returnImage} />
      </button>
      <p className="returnP">{textElement}</p>
    </div>
  );
}
