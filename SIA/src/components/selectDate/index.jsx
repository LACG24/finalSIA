import React, { useState } from "react";
import "./selectDate.css";
import { SuccessPopupDate } from "../../components/successPopupDate";
import { CadCheckCounter } from "../cadCheckCounter";
import { GeneralButton } from "../button";
import { CalendarInputDate } from "../../components/calendarInputDate";
import { StockBarDate } from "../stockBarDate";
import { formatDate } from "../../generalFunctions";
import { ReturnButton } from "../../components/returnButton";
import { TextInput } from "../../components/textInput";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
export function SelectDate({
  unit,
  amount,
  dates,
  onCancel,
  onConfirm,
  onUpdateStock,
  productStock,
}) {
  const [formData, setFormData] = useState({
    a_nombre: dates[0].a_nombre,
    a_cantidad: dates[0].a_cantidad,
    a_stock: "",
    a_fechaSalida: null,
    a_fechaEntrada: formatDate(new Date()),
    a_fechaCaducidad: null,
    um_id: dates[0].um_id,
    m_id: dates[0].m_id,
  });

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [updatedStock, setUpdatedStock] = useState(productStock);
  const [error, setError] = useState("");

  const handleStockChange = (newStock) => {
    setFormData((prevFormData) => ({ ...prevFormData, a_stock: newStock }));
    onUpdateStock(newStock);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "a_fechaCaducidad" && !value) {
      setError(
        <span style={{ color: "red" }}>
          Debe seleccionar una fecha de caducidad
        </span>
      );
    } else if (name === "a_stock" && !value) {
      setError(
        <span style={{ color: "red" }}>
          Debe ingresar el stock del producto
        </span>
      );
    } else {
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!formData.a_fechaCaducidad || !formData.a_stock) {
      setError(
        <span style={{ color: "red" }}>Debe rellenar todos los campos</span>
      );
      return;
    }

    try {
      console.log(formData);
      const response = await fetch(`http://${API_HOST}:${API_PORT}/alimentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Error al agregar el alimento");
      }
      // Manejar el éxito de la inserción
      setShowSuccessPopup(true); // Mostrar el Popup de éxito
      console.log("Alimento agregado correctamente");
    } catch (error) {
      console.error("Error al agregar el alimento:", error);
    }
  };

  const handlePopupClose = () => {
    setShowSuccessPopup(false); // Ocultar el Popup de éxito
    window.location.reload(); // Actualizar la página
  };

  // Modify the onConfirm function to include the updated stock value as a token
  const handleConfirm = () => {
    onConfirm({ ...formData, a_stock: updatedStock }); // include the updated stock value as a token
  };

  return (
    <div className="checkCard_selectDate">
      <table className="generalTable">
        <td>
          <tr>
            <CadCheckCounter unit={unit} amount={amount}></CadCheckCounter>
          </tr>
          <tr>
            <GeneralButton
              textElement="Confirmar"
              onClick={handleConfirm}
              color="var(--color-green-dark)"
            ></GeneralButton>
          </tr>
          <tr>
            <GeneralButton
              textElement="Cancelar"
              onClick={onCancel}
              color="var(--color-red)"
            ></GeneralButton>
          </tr>
          <tr>
            <div className="calendarID">
              <CalendarInputDate
                name="a_fechaCaducidad"
                value={formData.a_fechaCaducidad}
                onChange={handleChange}
              />
            </div>
            <div className="textID">
              <TextInput
                placeholder="Stock. Ej. 10"
                name="a_stock"
                value={formData.a_stock}
                onChange={handleChange}
              />
            </div>
          </tr>
          {error && <p className="error">{error}</p>}
          <tr>
            <GeneralButton
              textElement="Agregar Caducidad"
              onClick={handleSubmit}
              color="var(--color-button-blue)"
            ></GeneralButton>
          </tr>
        </td>
        <td>
          <table className="productsTable">
            <thead>
              <th>Caducidad</th>
              <th>Cantidad Seleccionada</th>
            </thead>
            <tbody>
              {dates.map((date) => (
                <tr key={date.a_id}>
                  <td>{date.a_fechaCaducidad.substring(0, 10)}</td>
                  <td>
                    <StockBarDate
                      productStock={date.a_stock} // Replace with the correct a_stock value for the selected date
                      isDisabled={!dates.length}
                      onStockChange={handleStockChange}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </td>
      </table>

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

export function SelectDateAddDate({
  unit,
  amount,
  dates,
  onCancel,
  onConfirm,
  onUpdateStock,
  productStock,
}) {
  const [formData, setFormData] = useState({
    a_nombre: dates[0].a_nombre,
    a_cantidad: dates[0].a_cantidad,
    a_stock: "",
    a_fechaSalida: null,
    a_fechaEntrada: formatDate(new Date()),
    a_fechaCaducidad: null,
    um_id: dates[0].um_id,
    m_id: dates[0].m_id,
  });

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [updatedStock, setUpdatedStock] = useState(productStock);
  const [error, setError] = useState("");

  const handleStockChange = (newStock) => {
    setFormData((prevFormData) => ({ ...prevFormData, a_stock: newStock }));
    onUpdateStock(newStock);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "a_fechaCaducidad" && !value) {
      setError(
        <span style={{ color: "red" }}>
          Debe seleccionar una fecha de caducidad
        </span>
      );
    } else if (name === "a_stock" && !value) {
      setError(
        <span style={{ color: "red" }}>
          Debe ingresar el stock del producto
        </span>
      );
    } else {
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!formData.a_fechaCaducidad || !formData.a_stock) {
      setError(
        <span style={{ color: "red" }}>Debe rellenar todos los campos</span>
      );
      return;
    }

    try {
      console.log(formData);
      const response = await fetch(`http://${API_HOST}:${API_PORT}/alimentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Error al agregar el alimento");
      }
      // Manejar el éxito de la inserción
      setShowSuccessPopup(true); // Mostrar el Popup de éxito
      console.log("Alimento agregado correctamente");
    } catch (error) {
      console.error("Error al agregar el alimento:", error);
    }
  };

  const handlePopupClose = () => {
    setShowSuccessPopup(false); // Ocultar el Popup de éxito
    window.location.reload(); // Actualizar la página
  };

  // Modify the onConfirm function to include the updated stock value as a token
  const handleConfirm = () => {
    onConfirm({ ...formData, a_stock: updatedStock }); // include the updated stock value as a token
  };

  return (
    <div className="checkCard_selectDate">
      <table className="generalTable">
        <td>
          <tr>
            <CadCheckCounter unit={unit} amount={amount}></CadCheckCounter>
          </tr>
          <tr>
            <GeneralButton
              textElement="Confirmar"
              onClick={handleConfirm}
              color="var(--color-green-dark)"
            ></GeneralButton>
          </tr>
          <tr>
            <GeneralButton
              textElement="Cancelar"
              onClick={onCancel}
              color="var(--color-red)"
            ></GeneralButton>
          </tr>
          <tr>
            <div className="calendarID">
              <CalendarInputDate
                name="a_fechaCaducidad"
                value={formData.a_fechaCaducidad}
                onChange={handleChange}
              />
            </div>
            <div className="textID">
              <TextInput
                placeholder="Stock. Ej. 10"
                name="a_stock"
                value={formData.a_stock}
                onChange={handleChange}
              />
            </div>
          </tr>
          {error && <p className="error">{error}</p>}
          <tr>
            <GeneralButton
              textElement="Agregar Caducidad"
              onClick={handleSubmit}
              color="var(--color-button-blue)"
            ></GeneralButton>
          </tr>
        </td>
        <td>
          <table className="productsTable">
            <thead>
              <th>Caducidad</th>
              <th>Cantidad Seleccionada</th>
            </thead>
            <tbody>
              {dates.map((date) => (
                <tr key={date.a_id}>
                  <td>{date.a_fechaCaducidad.substring(0, 10)}</td>
                  <td>
                    <StockBarDate
                      productStock={date.a_stock} // Replace with the correct a_stock value for the selected date
                      isDisabled={!dates.length}
                      onStockChange={handleStockChange}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </td>
      </table>

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
