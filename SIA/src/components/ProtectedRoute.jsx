import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../generalFunctions";

export const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const isAuthenticated = document.cookie.includes("userCookieSIA");

      setIsLoading(false);

      if (!isAuthenticated) {
        // Aquí puedes manejar la lógica para cuando el usuario no está autenticado
        navigate("/login");
      } else {
        const userCookieValue = getCookieValue("userCookieSIA");
        localStorage.setItem("userId", userCookieValue);

        try {
          // Verifica si el user_id existe en la base de datos usando fetch
          const response = await fetch(`http://${API_HOST}:${API_PORT}/validate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: userCookieValue }),
          });

          if (response.status === 200) {
            console.log("User validated");
          } else if (response.status === 401) {
            console.log("User not found");
            logout(navigate);
          } else {
            console.error("Server error");
          }
        } catch (error) {
          console.error("An error occurred during validation:", error);
        }
      }
    };

    checkSession();
  }, [navigate]);

  if (isLoading) {
    // Indicador de carga mientras se verifica la sesión
    return <div>Loading...</div>;
  }

  // Si hay una sesión activa, renderizar el contenido protegido
  return children;
};

function getCookieValue(cookieName) {
  // Separamos las cookies por punto y coma para obtener un array de cookies
  const cookies = document.cookie.split(";");

  // Buscamos la cookie específica por su nombre
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    // Si la cookie actual comienza con el nombre deseado, la devolvemos
    if (cookie.startsWith(cookieName + "=")) {
      // Extraemos el valor de la cookie y lo devolvemos
      return cookie.substring(cookieName.length + 1);
    }
  }
  // Si no encontramos la cookie, devolvemos null
  return null;
}
