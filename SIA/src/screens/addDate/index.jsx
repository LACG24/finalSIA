import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Guide } from "../../components/guide";
import { ReturnButton } from "../../components/returnButton";
import { TextInputAdd } from "../../components/textInputAdd";
import { CalendarInputDate } from "../../components/calendarInputDate";
import { GeneralButton } from "../../components/button";
import { ButtonCircle } from "../../components/buttonSquare";
import { formatDate } from "../../generalFunctions";
import { SuccessPopupDate } from "../../components/successPopupDate";
import "./AddDate.css";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
export function AddDate() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  let navigate = useNavigate();
  const { a_id } = useParams();
  const [formData, setFormData] = useState({
    a_nombre: "",
    a_cantidad: "",
    a_stock: "",
    a_fechaSalida: null,
    a_fechaEntrada: null,
    a_fechaCaducidad: null,
    um_id: "g",
    m_id: 0,
    u_id: localStorage.getItem("userId"),
  });

  const [marca, setMarca] = useState({
    m_nombre: "",
  });

  const [entries, setEntries] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [inputValues, setInputValues] = useState({
    a_fechaCaducidad: "",
    a_stock: "",
  });
  const [resetKey, setResetKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchProductData() {
      try {
        const response = await fetch(
          `http://${API_HOST}:${API_PORT}/alimentos/${a_id}`
        );
        if (!response.ok) {
          throw new Error("Error fetching product data");
        }
        const productData = await response.json();
        setFormData({
          a_nombre: productData.a_nombre,
          a_cantidad: productData.a_cantidad,
          a_stock: productData.a_stock,
          a_fechaSalida: null,
          a_fechaEntrada: formatDate(new Date()),
          a_fechaCaducidad: productData.a_fechaCaducidad,
          um_id: productData.um_id,
          m_id: productData.m_id,
          u_id: localStorage.getItem("userId"),
        });

        setMarca({
          m_nombre: productData.m_nombre,
        });
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    }
    fetchProductData();
  }, [a_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
    setErrorMessage(""); // Clear error message on valid input
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setInputValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleAddEntry = () => {
    if (!inputValues.a_fechaCaducidad || !inputValues.a_stock) {
      setErrorMessage("Ambos campos son obligatorios");
      return;
    }

    if (isNaN(inputValues.a_stock)) {
      setErrorMessage("El stock debe ser un número.");
      return;
    }

    const formattedDate = inputValues.a_fechaCaducidad;

    // Check if the expiration date already exists in entries
    if (entries.some((entry) => entry.a_fechaCaducidad === formattedDate)) {
      setErrorMessage(
        "La fecha de caducidad ya existe, por favor, ingrese otra fecha"
      );
      return;
    }

    setEntries((prevEntries) => [
      ...prevEntries,
      { a_fechaCaducidad: formattedDate, a_stock: inputValues.a_stock },
    ]);
    setInputValues({ a_fechaCaducidad: "", a_stock: "" });
    setResetKey((prevKey) => prevKey + 1); // Change the resetKey to reset CalendarInputDate
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    if (entries.length > 0) {
      try {
        for (const entry of entries) {
          const updatedFormData = {
            ...formData,
            a_fechaCaducidad: entry.a_fechaCaducidad,
            a_stock: entry.a_stock,
          };

          const response = await fetch(
            `http://${API_HOST}:${API_PORT}/alimentos`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedFormData),
            }
          );

          if (!response.ok) {
            throw new Error("Error al agregar el alimento");
          }
        }

        // Manejar el éxito de la inserción
        console.log("Alimentos agregados correctamente");
        setShowSuccessPopup(true);
      } catch (error) {
        console.error("Error al agregar los alimentos:", error);
      }
    }
  };

  const handlePopupClose = () => {
    setShowSuccessPopup(false); // Ocultar el Popup de éxito
    navigate("/AdminPage");
  };

  return (
    <div className="addDate">
      <div className="mensajeDA">
        <Guide
          message="Estás a punto de agregar una lista de productos. Recuerda verificar la fecha de caducidad de los productos que deseas agregar."
          size={100}
        />
      </div>
      <div className="buttonBackDA">
        <ReturnButton />
        <h1 className="titulo">Agregar Fecha de Caducidad</h1>
      </div>

      <div className="infoDA">
        <h2>Alimento seleccionado: </h2>
        <h3>
          {formData.a_nombre +
            "ㅤㅤ" +
            formData.a_cantidad +
            formData.um_id +
            "ㅤㅤ" +
            (marca.m_nombre == null ? "Sin marca" : marca.m_nombre)}
        </h3>
      </div>

      <div className="tablaGeneral">
        <table className="tabla1">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={index}>
                <td>{entry.a_fechaCaducidad}</td>
                <td>{entry.a_stock}</td>
              </tr>
            ))}
            <tr>
              <td>
                <CalendarInputDate
                  name="a_fechaCaducidad"
                  value={inputValues.a_fechaCaducidad}
                  onChange={handleDateChange}
                  resetKey={resetKey}
                />
              </td>
              <td>
                <TextInputAdd
                  placeholder="Stock. Ej. 10"
                  name="a_stock"
                  value={inputValues.a_stock}
                  onChange={handleChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <div className="button">
          <ButtonCircle
            textElement="+"
            color="var(--color-button-blue)"
            onClick={handleAddEntry}
          />
        </div>
      </div>

      <div className="botonesAddDA">
        <GeneralButton
          textElement="Cancelar"
          onClick={() => {
            navigate("/AdminPage");
          }}
          color="var(--color-red)"
        />
        <GeneralButton
          textElement="Agregar"
          onClick={handleSubmit}
          color={entries.length > 0 ? "#00FF00" : "gray"}
        />
      </div>

      {showSuccessPopup && (
        <div className="modalOverlay">
          <div className="modalContent">
            <SuccessPopupDate onClose={handlePopupClose} />
          </div>
        </div>
      )}
    </div>
  );
}
