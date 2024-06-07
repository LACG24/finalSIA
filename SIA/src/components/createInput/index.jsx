import "./createInput.css";

export function CreateInput() {
    return(
        <div className="createInput">
            <p>Nombre de usuario</p>
            <input type="text" />
            <p>Correo</p>
            <input type="email" />
            <p>Contraseña</p>
            <input type="password"/>
        </div>
    );
}