import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Guide } from "../../components/guide";
import { ReturnButton } from "../../components/returnButton";
import { TextInput } from "../../components/textInput";
import { CalendarInput } from "../../components/calendarInput";
import { GeneralButton } from "../../components/button";
import { formatDate, convertAmount } from "../../generalFunctions";
import { DropDown } from "../../components/dropDown";
import { ConfirmationPopUp } from "../../components/confirmationPopUp";
import "./EditProduct.css";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;

export function EditProduct() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { a_id } = useParams();
  const [removeCheck, setRemoveCheck] = useState(false);
  const [checkDate, setCheckDate] = useState(true);
  const [antiBlock, setAntiBlock] = useState(false);
  const [formData, setFormData] = useState({
    a_nombre: "",
    a_cantidad: "",
    a_stock: "",
    a_fechaCaducidad: null,
    um_id: "g",
    m_id: 0,
  });
  const [isModalOpenCRD, setIsModalOpenCRD] = useState(false);
  const [validationMessageCRD, setValidationMessageCRD] = useState("");
  const [showCRD, setShowCRD] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [isModalOpenRemove, setIsModalOpenRemove] = useState(false);
  const [individualValidationMessage, setIndividualValidationMessage] =
    useState({
      productValidationMessage: "",
      stockValidationMessage: "",
      expirationDateValidationMessage: "",
      quantityValidationMessage: "",
    });

  useEffect(() => {
    if (isModalOpenRemove || isModalOpen || isModalOpenCRD) {
      setShowCRD(false);
    }
  }, [isModalOpenRemove, isModalOpen, isModalOpenCRD]);

  useEffect(() => {
    async function fetchProductData() {
      try {
        const response = await fetch(
          `http://${API_HOST}:${API_PORT}/alimentos/${a_id}`
        );
        const productData = await response.json();
        setFormData({
          a_nombre: productData.a_nombre,
          a_cantidad: convertAmount(productData.a_cantidad),
          a_stock: productData.a_stock,
          a_fechaCaducidad: formatDate(productData.a_fechaCaducidad),
          um_id: productData.um_id,
          m_id: productData.m_id,
        });
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    }
    fetchProductData();
  }, [a_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const messages = {
      productValidationMessage: "",
      stockValidationMessage: "",
      expirationDateValidationMessage: "",
      quantityValidationMessage: "",
    };

    if (formData.a_nombre.trim() === "") {
      messages.productValidationMessage =
        "El nombre del producto es obligatorio.";
    } else if (formData.a_nombre.length > 40) {
      messages.productValidationMessage =
        "El nombre del producto es muy largo (máximo 40 caracteres).";
    } else if (formData.a_nombre.length < 2) {
      messages.productValidationMessage =
        "El nombre del producto es muy corto (mínimo 2 caracteres).";
    } else if (!/^[A-Z][a-z]*(\s[A-Z][a-z]*)*$/.test(formData.a_nombre)) {
      let words = formData.a_nombre.split(" ");
      let newWords = words.map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      );
      setFormData((prevData) => ({
        ...prevData,
        a_nombre: newWords.join(" "),
      }));
    }

    if (formData.a_stock === "" || formData.a_stock === null) {
      messages.stockValidationMessage = "El stock es obligatorio.";
    } else if (!Number.isInteger(parseFloat(formData.a_stock))) {
      messages.stockValidationMessage = "El stock debe ser un número entero.";
      setFormData((prevData) => ({ ...prevData, a_stock: 0 }));
    } else if (parseInt(formData.a_stock) < 0) {
      messages.stockValidationMessage = "El stock debe ser un número positivo.";
      setFormData((prevData) => ({ ...prevData, a_stock: 0 }));
    } else if (parseInt(formData.a_stock) > 2147483647) {
      messages.stockValidationMessage = "El stock es muy grande.";
      setFormData((prevData) => ({ ...prevData, a_stock: 0 }));
    }

    if (formData.a_cantidad === "" || formData.a_cantidad === null) {
      messages.quantityValidationMessage = "La cantidad es obligatoria.";
    } else if (!/^\d{1,13}(\.\d{1,3})?$/.test(formData.a_cantidad)) {
      messages.quantityValidationMessage =
        "La cantidad no es válida (máximo 13 enteros y 3 decimales).";
      setFormData((prevData) => ({ ...prevData, a_cantidad: 0 }));
    } else if (parseFloat(formData.a_cantidad) < 0) {
      messages.quantityValidationMessage =
        "La cantidad debe ser un número positivo.";
      setFormData((prevData) => ({ ...prevData, a_cantidad: 0 }));
    } else if (parseFloat(formData.a_cantidad) > 9999999999999.999) {
      messages.quantityValidationMessage = "La cantidad es muy grande.";
      setFormData((prevData) => ({ ...prevData, a_cantidad: 0 }));
    }

    setValidationMessage("");
    setIndividualValidationMessage(messages);

    return Object.values(messages).every((msg) => msg === "");
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/${a_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Error al editar el alimento");
      }

      console.log("Alimento editado correctamente");

      const stockBody = {
        a_id: a_id,
        u_id: userId,
        actionType: 2,
        quantity: formData.a_stock,
      };

      const stockResponse = await fetch(
        `http://${API_HOST}:${API_PORT}/usuarios/stock/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockBody),
        }
      );

      if (!stockResponse.ok) {
        throw new Error("Error al editar el stock");
      }

      setIsModalOpen(true);
    } catch (error) {
      console.error("Error al editar el alimento o el stock:", error);
    }
  };

  return (
    <div className="editProduct">
      <div className="editProductTitle">
        <Guide message="Asegúrate de rellenar todos los campos." />
        <ReturnButton textElement="Editar Producto Existente" />
      </div>

      <div className="editProductContainer">
        <div className="inputContainer">
          <TextInput
            label="Nombre del producto"
            placeholder="Ej. Lata de Atún"
            name="a_nombre"
            value={formData.a_nombre}
            onChange={handleChange}
          />

          <DropDown
            title="Marca (Opcional)"
            name="m_id"
            value={formData.m_id}
            onChange={handleChange}
            tableName="marcas"
            label="m_nombre"
            key={1}
            optional={true}
            cdr={true}
            showCRD={showCRD}
            setShowCRD={setShowCRD}
            removeCheck={removeCheck}
            setIsModalOpenRemove={setIsModalOpenRemove}
            setValidationMessageCRD={setValidationMessageCRD}
            setIsModalOpenCRD={setIsModalOpenCRD}
          />

          <TextInput
            label="Stock"
            placeholder="Ej. 10"
            name="a_stock"
            value={formData.a_stock}
            onChange={handleChange}
          />

          <CalendarInput
            name="a_fechaCaducidad"
            value={formData.a_fechaCaducidad}
            setCheckDate={setCheckDate}
            onChange={handleChange}
            setValidationMessage={setValidationMessage}
            setIndividualValidationMessage={setIndividualValidationMessage}
            errorMessage={
              individualValidationMessage.expirationDateValidationMessage
            }
            antiBlock={antiBlock}
            setAntiBlock={setAntiBlock}
          />

          <TextInput
            label="Cantidad"
            placeholder="Ej. 200"
            name="a_cantidad"
            value={formData.a_cantidad}
            onChange={handleChange}
          />

          <DropDown
            title="Unidad de medida (para cantidad)"
            name="um_id"
            value={formData.um_id}
            cdr={false}
            onChange={handleChange}
            tableName="unidades-medida"
            label="um_nombre"
            key={2}
          />
        </div>

        {validationMessage && (
          <div className="errorMessage">{validationMessage}</div>
        )}

        <br />
        <br />
        <GeneralButton
          textElement="Guardar"
          color="var(--color-button-blue)"
          onClick={handleSubmit}
        />
      </div>

      {isModalOpen && (
        <div className="modalOverlayConf">
          <ConfirmationPopUp
            message="Alimento editado correctamente"
            answer1="Ok"
            isOpen={isModalOpen}
            closeModal={() => {
              setIsModalOpen(false);
              navigate("/adminPage");
            }}
          />
        </div>
      )}
      {isModalOpenCRD && (
        <div className="modalOverlayConf">
          <ConfirmationPopUp
            message={validationMessageCRD}
            answer1="Ok"
            isOpen={isModalOpenCRD}
            closeModal={() => {
              setIsModalOpenCRD(false);
            }}
          />
        </div>
      )}
      {isModalOpenRemove && (
        <div className="modalOverlayConf">
          <ConfirmationPopUp
            message="¿Estás seguro de que deseas eliminar esta opción?"
            answer1="Eliminar"
            answer2="Cancelar"
            color1="#FF6565"
            color2="var(--color-button-blue)"
            funct={() => setRemoveCheck(true)}
            isOpen={isModalOpenRemove}
            closeModal={() => setIsModalOpenRemove(false)}
          />
        </div>
      )}
    </div>
  );
}
