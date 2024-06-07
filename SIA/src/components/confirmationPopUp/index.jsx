import React from "react";
import { GeneralButton } from "../button";
import "./confirmationPopUp.css";

export function ConfirmationPopUp({
  isOpen,
  message,
  answer1,
  answer2,
  path1,
  closeModal,
  funct,
  color1,
  color2,
}) {
  if (!isOpen) return null;
  // Verifica si solo se proporcionó una respuesta
  const isSingleAnswer = !answer2;

  const handleFirstAction = () => {
    funct();
    closeModal();
  };

  return (
    <div className="confPopUp">
      <p>{message}</p>
      <div className="buttonContainer">
        {isSingleAnswer ? (
          <GeneralButton textElement={answer1} onClick={closeModal} />
        ) : (
          <>
            <GeneralButton
              textElement={answer1}
              onClick={handleFirstAction}
              path={path1}
              color={color1 ? color1 : "blue"}
            />
            <GeneralButton
              textElement={answer2}
              onClick={closeModal}
              color={color2 ? color2 : "red"}
            />
          </>
        )}
      </div>
    </div>
  );
}
