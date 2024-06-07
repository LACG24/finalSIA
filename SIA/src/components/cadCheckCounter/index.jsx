import "./cadCheckCounter.css";

export function CadCheckCounter({ unit, amount }) {
  return (
    <div className="checkCard">
      <p>Unidad: {unit}</p>
      <p>Cantidad restante: {amount}</p>
    </div>
  );
}
