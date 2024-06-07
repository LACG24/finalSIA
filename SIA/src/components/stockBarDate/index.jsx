import "./stockBarDate.css";
import { useState } from "react";


export function StockBarDate({ productStock, isDisabled, onStockChange }) {
  const [currentStock, setCurrentStock] = useState(productStock);

  const handleChange = (event) => {
    const value = event.target.value;
    if (value === "") {
      setCurrentStock(0);
    } else {
      setCurrentStock(parseInt(value));
    }
    onStockChange(parseInt(value));
  };

  const changeStock = (logic) => {
    if (logic && currentStock + 1 >= 0) {
      setCurrentStock(currentStock + 1);
    } else if (!logic && currentStock - 1 >= 0) {
      setCurrentStock(currentStock - 1);
    }
  };

  return (
    <>
      <div className="stockBar">
        <button onClick={() => changeStock(false)} disabled={isDisabled}>
          -
        </button>
        <input
          type="text"
          value={currentStock}
          onChange={handleChange}
          disabled={isDisabled}
        />
        <button onClick={() => changeStock(true)} disabled={isDisabled}>
          +
        </button>
      </div>
    </>
  );
}