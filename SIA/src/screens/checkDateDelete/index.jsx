import React, { useState, useEffect } from "react";
import "./checkDateDelete.css";
import { Guide } from "../../components/guide";
import { ReturnButton } from "../../components/returnButton";
import { ButtonSquare, ButtonCircle } from "../../components/buttonSquare";
import { GeneralButton } from "../../components/button";
import { SelectDateDelete } from "../../components/selectDateDelete";
import { ConfirmationPopUp } from "../../components/confirmationPopUp";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../generalFunctions";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
export const CheckDateDelete = ({ selectedIds, setSelectedIds }) => {
  const [showSelectDate, setShowSelectDate] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [dates, setDates] = useState({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);
  const [buttonSquareColor, setButtonSquareColor] =
    useState("var(--color-red)");
  const [buttonColors, setButtonColors] = useState({});
  const [ids, setIds] = useState([]);
  let navigate = useNavigate();

  useEffect(() => {
    setIds(selectedIds);
  }, [selectedIds]);

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
        const updatedData = data.map((product) => ({
          ...product,
          marca_nombre: product.m_id ? product.marca_nombre : "Sin marca",
        }));
        setProducts(updatedData);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  }, [ids]);

  const updateProductState = (productId, newState) => {
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.a_id === productId) {
          return { ...product, estado: newState };
        }
        return product;
      });
    });
  };

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
  }, [ids]);

  const handleButtonClick = (product) => {
    setSelectedProductId(product.a_id);
    setShowSelectDate(true);
  };

  const handleButtonClickSquare = (productId) => {
    setButtonColors((prevColors) => ({
      ...prevColors,
      [productId]: "#00FF00",
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
    return products.every(
      (product) => buttonColors[product.a_id] === "#00FF00"
    );
  };

  const handleDeleteSelected = async () => {
    try {
      const updateStockPromises = selectedIds.map((id) =>
        fetch(`http://${API_HOST}:${API_PORT}/usuarios/stock/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            a_id: id,
            u_id: localStorage.getItem("userId"),
            actionType: 1,
            quantity: products.find((product) => product.a_id === id).a_stock,
          }),
        })
      );

      const deleteProductPromises = selectedIds.map((id) =>
        fetch(`http://${API_HOST}:${API_PORT}/alimentos/stock/${id}`, {
          method: "DELETE",
        })
      );

      const logDeleteActionPromises = selectedIds.map((id) =>
        fetch(`http://${API_HOST}:${API_PORT}/alimentos/out/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ a_fechaSalida: formatDate(new Date()) }),
        })
      );

      const deleteProductPromises2 = selectedIds.map((id) =>
        fetch(`http://${API_HOST}:${API_PORT}/alimentos/out/${id}`, {
          method: "DELETE",
        })
      );

      await Promise.all([
        ...updateStockPromises,
        ...deleteProductPromises,
        ...logDeleteActionPromises,
        ...deleteProductPromises2,
      ]);

      setConfirmDeleteOpen(false);
      setDeleteSuccessOpen(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSuccessClose = () => {
    setDeleteSuccessOpen(false);
    setSelectedIds([]); // Vaciar el arreglo selectedIds
    navigate("/AdminPage");
  };

  const handleReturn = () => {
    setSelectedIds([]); // Vaciar el arreglo selectedIds
  };

  return (
    <div className="dateDelete">
      <div className="mensajeD">
        <Guide
          message="Estas a punto de eliminar una lista de productos, recuerda verificar la fecha de caducidad de los productos que deseas eliminar."
          size={100}
        />
      </div>
      <div className="buttonBackDelete">
        <ReturnButton onClick={handleReturn} />
        <h1 className="tituloD">Eliminar Productos</h1>
      </div>
      <div className="cuadradoD">
        <p>Estas por agregar los siguientes productos</p>
        <div className="tableContainerDelete">
          <table className="userTableDelete">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Marca</th>
                <th>Stock</th>
                <th>Fecha Caducidad</th>
                <th>Verificación</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.a_id}>
                  <td>{product.a_nombre}</td>
                  <td>{product.a_cantidad + " " + product.um_id}</td>
                  <td>{product.marca_nombre}</td>
                  <td>{product.a_stock}</td>
                  <td>
                    {product.a_fechaCaducidad
                      ? product.a_fechaCaducidad.substring(0, 10)
                      : "Sin caducidad"}
                  </td>
                  <td>
                    <ButtonSquare
                      textElement="v"
                      color={buttonColors[product.a_id] || "var(--color-red)"}
                      onClick={() => handleButtonClickSquare(product.a_id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="botonesDelete">
            <GeneralButton
              textElement="Cancelar"
              path=""
              color="var(--color-button-blue)"
              onClick={() => {
                setSelectedIds([]); // Vaciar el arreglo selectedIds
                navigate(-1);
              }}
            />
            <GeneralButton
              textElement="Eliminar"
              onClick={() =>
                allProductsVerified() && setConfirmDeleteOpen(true)
              }
              color={allProductsVerified() ? "var(--color-red)" : "#8F938D"}
              disabled={!allProductsVerified()} // Añadir esta línea para deshabilitar el botón si no todos los productos están verificados
            />
            {confirmDeleteOpen && (
              <ConfirmationPopUp
                message="¿Está seguro que desea eliminar a los alimentos seleccionados?"
                answer1="Si"
                answer2="No"
                funct={handleDeleteSelected}
                isOpen={confirmDeleteOpen}
                closeModal={() => setConfirmDeleteOpen(false)}
              />
            )}
            {deleteSuccessOpen && (
              <ConfirmationPopUp
                message="Los alimentos se eliminaron correctamente."
                answer1="OK"
                funct={handleSuccessClose}
                isOpen={deleteSuccessOpen}
                closeModal={handleSuccessClose}
              />
            )}
          </div>
        </div>
      </div>
      {showSelectDate && (
        <div className="modalOverlay">
          <div className="modalContent">
            <SelectDateDelete
              dates={dates[selectedProductId]}
              onCancel={handleCancelSelectDate}
              onConfirm={handleConfirmButtonClick}
            />
          </div>
        </div>
      )}
    </div>
  );
};
