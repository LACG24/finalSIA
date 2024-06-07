import "./StockBar.css";
import { useState, useEffect } from "react";
import cloudIcon from "../../assets/img/cloudIcon.png";

export function StockBar({
  stock,
  isDisabled,
  modificationMap,
  setModificationMap,
  savedChanges,
  setSavedChanges,
  id,
  stockResetId,
  color,
  setColor,
}) {
  const [currentStock, setCurrentStock] = useState(parseInt(stock));
  const [stockChanged, setStockChanged] = useState(false);
  const [initialStock, setInitialStock] = useState(parseInt(stock));

  useEffect(() => {
    // Cargar datos guardados al montar el componente
    const savedModificationMap = localStorage.getItem("modificationMap");
    if (savedModificationMap) {
      setModificationMap(JSON.parse(savedModificationMap));
    }
  }, [setModificationMap]);

  useEffect(() => {
    stockCheck();
  }, [currentStock]);

  useEffect(() => {
    if (stockResetId === id) {
      setCurrentStock(parseInt(stock));
      setStockChanged(false);
    }
  }, [stockResetId, stock, id]);

  //cuando se recargue el componente se asigna modificacionMap[id][0] a initialStock y modificacionMap[id][1] a currentStock

  useEffect(() => {
    if (modificationMap[id]) {
      setInitialStock(modificationMap[id][0]);
      setCurrentStock(modificationMap[id][1]);
    }
  }, [modificationMap, id]);

  useEffect(() => {
    if (savedChanges) {
      setInitialStock(currentStock); // Guardar el stock actual como el nuevo stock inicial
      setStockChanged(false);
      setSavedChanges(false);
    }
  }, [savedChanges, currentStock, setSavedChanges]);

  useEffect(() => {
    // Guardar modificationMap en localStorage cada vez que cambie
    localStorage.setItem("modificationMap", JSON.stringify(modificationMap));
    if (modificationMap[id]) {
      setColor(
        modificationMap[id][0] > modificationMap[id][1] ? "red" : "green"
      );
    } else {
      setColor("black");
      console.log("No hay cambios en el stock");
    }
  }, [modificationMap, id, setColor]);

  useEffect(() => {
    // Cuando el componente se monta o el stock inicial cambia
    setCurrentStock(parseInt(stock));
    setInitialStock(parseInt(stock));
  }, [stock]);

  useEffect(() => {
    if (stockChanged && currentStock === parseInt(initialStock)) {
      setStockChanged(false);
      setColor("black");
      // Eliminar la entrada del modificationMap si el stock ha vuelto al inicial
      setModificationMap((prevMap) => {
        const { [id]: _, ...rest } = prevMap;
        return rest;
      });
    }
  }, [currentStock, initialStock, id, setModificationMap, setColor]);

  const handleChange = (event) => {
    const value = event.target.value;
    if (value === "") {
      setCurrentStock(0);
    } else if (value.length > 4) {
      setCurrentStock(9999);
    } else if (isNaN(value)) {
      setCurrentStock(parseInt(initialStock));
    } else {
      setCurrentStock(parseInt(value));
    }
    setStockChanged(true);
  };

  const changeStock = (increment) => {
    if (increment) {
      setCurrentStock((prev) => Math.max(0, prev + 1));
    } else {
      setCurrentStock((prev) => Math.max(0, prev - 1));
    }
    setStockChanged(true);
  };

  const stockCheck = () => {
    if (currentStock === parseInt(initialStock)) {
      setStockChanged(false);
      // Eliminar la entrada del modificationMap si el stock ha vuelto al inicial
      setModificationMap((prevMap) => {
        const { [id]: _, ...rest } = prevMap;
        return rest;
      });
    } else {
      setStockChanged(true);
      setModificationMap((prevMap) => ({
        ...prevMap,
        [id]: [parseInt(initialStock), parseInt(currentStock)],
      }));
    }
  };

  return (
    <div className="stockBar">
      <div
        onClick={() => {
          setCurrentStock(parseInt(initialStock));
          setStockChanged(false);
          setColor("black");
        }}
        className={"cloud" + (currentStock !== initialStock ? "" : " hide")}
      >
        <img
          className="cloudIcon"
          src={cloudIcon}
          alt="cloudIcon"
          disabled={isDisabled}
        />
        <p className="cloudText" disabled={isDisabled}>
          {modificationMap[id] ? modificationMap[id][0] : initialStock}
        </p>
      </div>
      <button onClick={() => changeStock(false)} disabled={isDisabled}>
        -
      </button>
      <input
        style={{ color: color }}
        type="text"
        value={currentStock}
        onChange={handleChange}
        disabled={isDisabled}
      />
      <button onClick={() => changeStock(true)} disabled={isDisabled}>
        +
      </button>
    </div>
  );
}
