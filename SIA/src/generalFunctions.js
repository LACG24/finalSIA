import { useNavigate } from "react-router-dom";

export const formatDate = (date) => {
  // Check if the date is undefined or null
  if (!date) {
    return "";
  }

  // Create a new Date object from the input date string, treating it as UTC
  const fecha = new Date(date);

  // Get the year, month, and day from the date object
  const anio = fecha.getUTCFullYear(); // Get UTC year
  const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, "0"); // Get UTC month
  const dia = fecha.getUTCDate().toString().padStart(2, "0"); // Get UTC day

  // Return the formatted date string "YYYY/MM/DD"
  return `${anio}/${mes}/${dia}`;
};

// Function to format date and time
export const formatDateTime = (date) => {
  // Check if the date is undefined or null
  if (!date) {
    return "";
  }

  // Create a new Date object from the input date string, treating it as UTC
  const dateTime = new Date(date);

  // Get the year, month, day, hours, minutes, and seconds from the date object
  const anio = dateTime.getUTCFullYear(); // Get UTC year
  const mes = (dateTime.getUTCMonth() + 1).toString().padStart(2, "0"); // Get UTC month
  const dia = dateTime.getUTCDate().toString().padStart(2, "0"); // Get UTC day
  const hora = dateTime.getUTCHours().toString().padStart(2, "0"); // Get UTC hours
  const minuto = dateTime.getUTCMinutes().toString().padStart(2, "0"); // Get UTC minutes
  const segundo = dateTime.getUTCSeconds().toString().padStart(2, "0"); // Get UTC seconds

  // Return the formatted date and time string "YYYY/MM/DD HH:MM:SS"
  return `${anio}/${mes}/${dia} ${hora}:${minuto}:${segundo}`;
};

export const logout = (navigate) => {
  return new Promise((resolve, reject) => {
    // Eliminar las cookies del documento
    document.cookie =
      "userCookieSIA=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    localStorage.removeItem("userId");
    localStorage.removeItem("userRol");
    // Redirigir al usuario a la página de inicio de sesión
    navigate("/login");

    resolve(); // Resuelve la promesa cuando se complete la operación
  });
};

export const convertAmount = (amount) => {
  // Verificar si el formato es correcto y luego eliminar los últimos tres caracteres si son ".000"
  if (amount.endsWith(".000")) {
    return parseInt(amount.slice(0, -4), 10);
  }
  return parseFloat(amount); // Conservar cualquier otro decimal
};
