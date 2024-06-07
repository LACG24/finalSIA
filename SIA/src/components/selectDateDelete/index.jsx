import React from "react";
import "./selectDateDelete.css";
import { CadCheckCounter } from "../cadCheckCounter";
import { GeneralButton } from "../button";
import { StockBarDate } from "../stockBarDate";

export function SelectDateDelete({ unit, amount, dates, onCancel, onConfirm }) {
  /*
  const dates = [
    {id: 1, caducidad:"01/05/2002", stock:"NA"},
    {id: 2, caducidad:"08/07/2024", stock: 500}
];*/

  return (
    <div className="checkCard_selectDateD">
      <table className="generalTableD">
        <td>
          <tr>
            <CadCheckCounter unit={unit} amount={amount}></CadCheckCounter>
          </tr>
          <tr>
            <GeneralButton
              textElement="Confirmar"
              onClick={onConfirm}
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
        </td>
        <td>
          <table className="productsTableD">
            <thead>
              <th></th>
              <th>Caducidad</th>
              <th>Cantidad</th>
              <th>Cantidad Seleccionada</th>
            </thead>
            <tbody>
              {dates.map((date) => (
                <tr key={date.a_id}>
                  <td>
                    <input type="checkbox" className="checkboxLargeD" />
                  </td>
                  <td>{date.a_fechaCaducidad.substring(0, 10)}</td>
                  <td>{date.a_stock}</td>
                  <td>
                    <StockBarDate stock={date.a_stock}></StockBarDate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </td>
      </table>
    </div>
  );
}
