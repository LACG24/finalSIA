import React, { useState, useEffect } from "react";
import "./checkDateAdd.css";
import { Guide } from "../../components/guide";
import { ReturnButton } from "../../components/returnButton";
import { ButtonSquare, ButtonCircle } from "../../components/buttonSquare";
import { GeneralButton } from "../../components/button";
import { SelectDate } from "../../components/selectDate";
import { useNavigate } from "react-router-dom";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
export const CheckDateAdd = () => {
  const [showSelectDate, setShowSelectDate] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null); // Nuevo estado para el ID del producto seleccionado
  const [products, setProducts] = useState([]);
  const [dates, setDates] = useState({}); // Estado para guardar las fechas por producto

  const [buttonSquareColor, setButtonSquareColor] =
    useState("var(--color-red)");
  // Mantén un estado para los colores de los botones cuadrados
  const [buttonColors, setButtonColors] = useState({});

  const [productsWithStock, setProductsWithStock] = useState([]);
  let navigate = useNavigate();

  const ids = [1, 44, 2]; // Tu arreglo de IDs

  useEffect(() => {
    const params = new URLSearchParams();
    ids.forEach((id) => {
      params.append("ids", id);
    });

    fetch(
      `http://${API_HOST}:${API_PORT}/alimentos/checkDate?${params.toString()}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener los productos");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  }, [ids]); // Agregué ids como dependencia del efecto

  const updateProductStock = (productId, newStock) => {
    setProductsWithStock((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.a_id === productId) {
          return { ...product, a_stock: newStock };
        }
        return product;
      });
    });
  };

  const updateProductState = (productId, newState) => {
    console.log(
      "Updating product state for product ID:",
      productId,
      "with new state:",
      newState
    );
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.a_id === productId) {
          return { ...product, estado: newState };
        }
        return product;
      });
    });
  };

  // Nuevo efecto para obtener las fechas
  useEffect(() => {
    const fetchDates = async () => {
      const promises = ids.map((id) => {
        return fetch(`http://${API_HOST}:${API_PORT}/alimentos/atun/${id}`)
          .then((response) => response.json())
          .then((data) => ({ [id]: data }));
      });

      const datesByProduct = await Promise.all(promises);
      const datesObject = datesByProduct.reduce(
        (acc, current) => ({ ...acc, ...current }),
        {}
      );

      setDates(datesObject);
    };

    fetchDates();
  }, []); // Dependencia vacía, solo se ejecuta una vez

  const handleButtonClick = (product) => {
    setSelectedProductId(product.a_id);
    setShowSelectDate(true);
  };

  const handleButtonClickSquare = (productId) => {
    // Actualiza el color del botón cuadrado correspondiente al producto seleccionado
    setButtonColors((prevColors) => ({
      ...prevColors,
      [productId]: "#00FF00", // Cambia el color a verde
    }));
  };

  const handleCancelSelectDate = () => {
    setShowSelectDate(false);
  };

  const handleConfirmButtonClick = () => {
    updateProductState(selectedProductId, true);
    setShowSelectDate(false);
  };

  const allProductsVerified = () => {
    // Verifica si todos los ButtonSquare están en verde
    return products.every(
      (product) => buttonColors[product.a_id] === "#00FF00"
    );
  };

  return (
    <div className="dateAdd">
      <div className="mensajeA">
        <Guide
          message="Estás a punto de agregar una lista de productos. Recuerda verificar la fecha de caducidad de los productos que deseas agregar."
          size={100}
        />
      </div>
      <div className="buttonBackAdd">
        <ReturnButton />
        <h1 className="titulo">Agregar Productos</h1>
      </div>
      <div className="cuadrado">
        <p>Estás por agregar los siguientes productos</p>
        <div className="tableContainerAdd">
          <table className="userTableAdd">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Marca</th>
                <th>Stock</th>
                <th>Fecha Caducidad</th>
                <th>Verificación</th>
                <th>Agregar fecha</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.a_id}>
                  <td>{product.a_nombre}</td>
                  <td>{product.a_cantidad + " " + product.um_id}</td>
                  <td>{product.m_id}</td>
                  <td>{product.a_stock}</td>
                  <td>{product.a_fechaCaducidad.substring(0, 10)}</td>
                  <td>
                    <ButtonSquare
                      textElement="v"
                      color={buttonColors[product.a_id] || "var(--color-red)"} // Usa el color del estado o el color predeterminado
                      onClick={() => handleButtonClickSquare(product.a_id)}
                    />
                  </td>
                  <td>
                    <ButtonCircle
                      textElement="+"
                      color="var(--color-button-blue)"
                      onClick={() => handleButtonClick(product)}
                      disabled={product.estado}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="botonesAdd">
            <GeneralButton
              textElement="Cancelar"
              onClick={() => {
                navigate("/AdminPage");
              }}
              color="var(--color-button-blue)"
            />
            <GeneralButton
              textElement="Agregar"
              color={allProductsVerified() ? "#00FF00" : "#8F938D"}
            />
          </div>
        </div>
      </div>
      {showSelectDate && (
        <div className="modalOverlay">
          <div className="modalContent">
            {/* Pasa las fechas al componente SelectDate */}
            <SelectDate
              dates={dates[selectedProductId]}
              onCancel={handleCancelSelectDate}
              onConfirm={handleConfirmButtonClick}
              onUpdateStock={updateProductStock}
              productStock={productsWithStock[selectedProductId]?.a_stock || 0}
            />
          </div>
        </div>
      )}
    </div>
  );
};
