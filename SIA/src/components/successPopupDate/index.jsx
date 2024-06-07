// SuccessPopup.jsx
import React from "react";

export function SuccessPopupDate({ onClose }) {
  return (
    <div className="popup">
      <div className="popup-content">
        <p>¡Producto agregado exitosamente!</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
