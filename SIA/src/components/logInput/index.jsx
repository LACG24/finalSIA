import "./logInput.css";

export function LogInput() {
    return (
      <div className="logInput">
        <p>Correo</p>
        <input type="text" />
        <p>Contraseña</p>        
        <input type="password" />
      </div>
    );
}