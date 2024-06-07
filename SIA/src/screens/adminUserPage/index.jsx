import React, { useState, useEffect } from "react";
import "./adminUserPage.css";
import { GeneralButton } from "../../components/button";
import { Guide } from "../../components/guide";
import { ReturnButton } from "../../components/returnButton";
import { SearchBar } from "../../components/searchBar";
import { ConfirmationPopUp } from "../../components/confirmationPopUp";
import { useNavigate } from "react-router-dom";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
export const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [filter, setFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(null);
  const [deleteActive, setDeleteActive] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const navigate = useNavigate();
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  useEffect(() => {
    fetch(`http://${API_HOST}:${API_PORT}/usuarios`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Error al obtener los usuarios");
      })
      .then((data) => {
        setUsers(data.map((user) => ({ id: user.u_id, email: user.u_email })));
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  }, []);

  const handleCheckboxChange = (event, id) => {
    const isChecked = event.target.checked;
    setSelectedUserIds((prev) =>
      isChecked ? [...prev, id] : prev.filter((uid) => uid !== id)
    );
    setDeleteActive(selectedUserIds.length > 0);
  };

  const handleDeleteSelected = () => {
    Promise.all(
      selectedUserIds.map((id) =>
        fetch(`http://${API_HOST}:${API_PORT}/usuarios/${id}`, {
          method: "DELETE",
        })
      )
    )
      .then(() => {
        setUsers(users.filter((user) => !selectedUserIds.includes(user.id)));
        setSelectedUserIds([]);
        setConfirmDeleteOpen(false);
        setDeleteSuccess(true);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleDelete = (userId) => {
    fetch(`http://${API_HOST}:${API_PORT}/usuarios/${userId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        setUsers(users.filter((user) => user.id !== userId));
        setIsModalOpen(null);
        setDeleteSuccess(true);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleSearch = (searchTerm) => {
    setFilter(searchTerm.toLowerCase());
  };

  const handleEditUser = (userId) => {
    navigate(`/editUser/${userId}`);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.id.toLowerCase().includes(filter) ||
      user.email.toLowerCase().includes(filter) ||
      (user.otherField && user.otherField.toLowerCase().includes(filter))
  );

  const handleCreateUser = () => {
    navigate("/createuser");
  };

  const handleViewUser = (userId) => {
    fetch(
      `http://${API_HOST}:${API_PORT}/usuario-alimento/join/all/usuario/${userId}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.length === 0) {
          setDeleteError(true); // Abre el modal indicando que no hay datos
        } else {
          navigate(`/userDetails/${userId}`);
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="userPage">
      <div className="buttonTopLeft">
        <ReturnButton />
      </div>
      <Guide
        message="Bienvenid@ administrador, en esta ventana podrá administrar a los usuarios del sistema, use las cajas al la izquierda del nombre de usuario para eliminar múltiples usuarios."
        size={100}
      />
      <SearchBar
        onSearch={handleSearch}
        addCartNumber={0}
        deleteCartNumber={selectedUserIds.length}
        deleteActive={selectedUserIds.length > 0}
        onDeleteSelected={() => setConfirmDeleteOpen(true)}
        onAddUser={handleCreateUser}
      />
      {confirmDeleteOpen && (
        <ConfirmationPopUp
          message="¿Está seguro que desea eliminar a los usuarios seleccionados permanentemente?"
          answer1="Si"
          answer2="No"
          funct={handleDeleteSelected}
          isOpen={confirmDeleteOpen}
          closeModal={() => setConfirmDeleteOpen(false)}
        />
      )}
      {deleteSuccess && (
        <div className="modalOverlay">
          <ConfirmationPopUp
            message="Usuario eliminado correctamente"
            answer1="Ok"
            isOpen={deleteSuccess}
            closeModal={() => setDeleteSuccess(false)}
          />
        </div>
      )}
      {deleteError && (
        <div className="modalOverlay">
          <ConfirmationPopUp
            message="No existe actividad para este usuario."
            answer1="Ok"
            isOpen={deleteError}
            closeModal={() => setDeleteError(false)}
          />
        </div>
      )}

      <div className="tableContainer">
        <table className="userTable square">
          <thead>
            <tr>
              <th></th> {/* Space for checkboxes */}
              <th>Usuario</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(
              (user) =>
                user.id !== "ManejadorEventos" && (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={(e) => handleCheckboxChange(e, user.id)}
                        className="checkboxLarge"
                      />
                    </td>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>
                      <GeneralButton
                        textElement=" Ver "
                        color="var(--color-green-dark)"
                        className="generalButton"
                        onClick={() => handleViewUser(user.id)}
                      />
                      <GeneralButton
                        textElement=" Editar "
                        color="var(--color-button-blue)"
                        className="generalButton"
                        onClick={() => handleEditUser(user.id)}
                      />

                      {/* Si el usuario es SAdmin, no se puede eliminar */}
                      {user.id !== "SAdmin" && (
                        <GeneralButton
                          textElement=" Eliminar "
                          color="var(--color-red)"
                          className="generalButton"
                          onClick={() => setIsModalOpen(user.id)}
                        />
                      )}
                      {isModalOpen === user.id && (
                        <div className="modalOverlay">
                          <ConfirmationPopUp
                            message="¿Seguro que quieres eliminar al usuario de forma permanente?"
                            answer1="Si"
                            answer2="No"
                            funct={() => handleDelete(user.id)}
                            isOpen={isModalOpen === user.id}
                            closeModal={() => setIsModalOpen(null)}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
