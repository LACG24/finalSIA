import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Guide } from '../../components/guide';
import { GeneralButton } from '../../components/button';
import { CodeInput } from "../../components/codeInput";
import './CodePage.css';

export const CodePage = () => {
  const [inputCode, setInputCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 300 segundos = 5 minutos
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setVerificationError("El tiempo ha expirado. Por favor, solicite un nuevo código.");
    }
  }, [timeLeft]);

  const getCookieValue = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  const handleSubmitCode = () => {
    const storedCode = getCookieValue("passCookieSIA");
    if (inputCode === storedCode) {
      navigate("/newPass");
    } else {
      setVerificationError("El código ingresado es incorrecto.");
    }
  };

  const handleCodeChange = (newValue) => {
    setInputCode(newValue);
    setVerificationError(""); // Limpiar cualquier error previo al cambiar el código
  };

  return (
    <div className="code">
      <div className="mensaje">
        <Guide message="Ingresa el código de verificación. Revisa el apartado de 'Spam' o 'No deseados' en tu correo electrónico." size={130} />
      </div>
      <div className="code-container">
        <CodeInput onComplete={handleCodeChange} />
        {verificationError && <p className="error-message">{verificationError}</p>}
        <p>Tiempo restante: {Math.floor(timeLeft / 60)}:{("0" + (timeLeft % 60)).slice(-2)}</p>
        <GeneralButton textElement="Verificar" onClick={handleSubmitCode} />
      </div>
    </div>
  );
};
