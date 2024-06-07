import React, { useState, useEffect } from "react";
import { Guide } from "../../components/guide";
import { ReturnButton } from "../../components/returnButton";
import { RowAdminPage } from "../../components/rowAdminPage";
import { ConfirmationPopUp } from "../../components/confirmationPopUp";
import { SearchBar } from "../../components/search";
import { SlidingSideBar } from "../../components/slidingSideBar";
import saveIcon from "../../assets/img/saveIcon.svg";
import excelIcon from "../../assets/img/excelIcon.svg";
import "./AdminPage.css";
import { useNavigate } from "react-router-dom";

import { convertAmount } from "../../generalFunctions";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
export const AdminPage = ({ selectedIds, setSelectedIds }) => {
  const userId = localStorage.getItem("userId");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [inputPage, setInputPage] = useState(String(currentPage));
  const [filteredAlimentos, setFilteredAlimentos] = useState([]);
  const [originalAlimentos, setOriginalAlimentos] = useState([]);
  const [originalTotalPages, setOriginalTotalPages] = useState(1);
  const [stockResetId, setStockResetId] = useState(0);
  const navigate = useNavigate();

  const [addCartNumber, setAddCartNumber] = useState(0);
  const [deleteCartNumber, setDeleteCartNumber] = useState(0);

  const [addActive, setAddActive] = useState(false);
  const [deleteActive, setDeleteActive] = useState(false);

  // 0 = Buscar por nombre, 1 = Buscar por cantidad, 2 = Buscar por marca, 3 = Buscar por existencias, 4 = Buscar por caducidad
  const [searchType, setSearchType] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [modificationMap, setModificationMap] = useState({});

  const [modificationConfirmation, setModificationConfirmation] =
    useState(false);

  const [savedChanges, setSavedChanges] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedChangesPopUp, setSavedChangesPopUp] = useState(false);
  const [options, setOptions] = useState({
    f1: false,
    f2: false,
    f3: false,
    f4: false,
    o1: false,
    o2: false,
    o3: false,
    o4: false,
    o5: false,
  });

  const [showWithoutStock, setShowWithoutStock] = useState(true);

  const handleSaveChanges = async () => {
    try {
      for (const key in modificationMap) {
        if (modificationMap.hasOwnProperty(key)) {
          const body =
            modificationMap[key][0] < modificationMap[key][1]
              ? {
                  a_id: key,
                  u_id: userId,
                  actionType: 0,
                  quantity: modificationMap[key][1] - modificationMap[key][0],
                }
              : {
                  a_id: key,
                  u_id: userId,
                  actionType: 1,
                  quantity: modificationMap[key][0] - modificationMap[key][1],
                };

          console.log("body", body);

          await fetch(`http://${API_HOST}:${API_PORT}/usuarios/stock/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });
        }
      }
      setSavedChangesPopUp(true);
      setModificationMap({});
      setSavedChanges(true);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleCreateUser = () => {
    navigate("/addProduct");
  };

  const handleCheckboxChange = (event, id) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setSelectedIds((prevIds) => [...prevIds, id]); // Agregar el ID seleccionado al estado
      //remove element from modificationMap
      const newMap = { ...modificationMap };
      delete newMap[id];
      setModificationMap(newMap);
      setStockResetId(id); // reset stock

      // reset stock
    } else {
      setSelectedIds((prevIds) =>
        prevIds.filter((selectedId) => selectedId !== id)
      ); // Eliminar el ID deseleccionado del estado
    }

    // Actualizar el número de elementos seleccionados por cada id de alimento obtener el stock y sumarlos
    if (isChecked) {
      fetch(`http://${API_HOST}:${API_PORT}/alimentos/` + id)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener el alimento");
        })
        .then((data) => {
          setDeleteCartNumber((prevNumber) => prevNumber + data.a_stock);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });
    } else {
      fetch(`http://${API_HOST}:${API_PORT}/alimentos/` + id)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener el alimento");
        })
        .then((data) => {
          setDeleteCartNumber((prevNumber) => prevNumber - data.a_stock);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });
    }
  };

  useEffect(() => {
    if (deleteCartNumber === 0) {
      setDeleteActive(false);
    } else {
      setDeleteActive(true);
    }
  }, [deleteCartNumber]);

  useEffect(() => {
    if (Object.keys(modificationMap).length <= 0) {
      setModificationConfirmation(true);
    } else {
      setModificationConfirmation(false);
    }
    console.log(
      "modificationMap",
      modificationMap,
      "confirmation",
      modificationConfirmation,
      "length",
      Object.keys(modificationMap).length
    );
  }, [modificationMap]);

  useEffect(() => {
    if (
      !options.f1 &&
      !options.f2 &&
      !options.f3 &&
      !options.f4 &&
      !options.o1 &&
      !options.o2 &&
      !options.o3 &&
      !options.o4 &&
      !options.o5
    ) {
      if (searchTerm === "") {
        fetch(
          `http://${API_HOST}:${API_PORT}/alimentos/join/marca?page=${currentPage}&pageSize=${pageSize}`
        )
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error("Error al obtener los alimentos");
          })
          .then((data) => {
            setOriginalAlimentos(data);
            setFilteredAlimentos(data);
          })
          .catch((error) => {
            console.error("Error:", error.message);
          });

        fetch(`http://${API_HOST}:${API_PORT}/alimentos/count`)
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error("Error al obtener los alimentos");
          })
          .then((data) => {
            setOriginalTotalPages(Math.ceil(data.total / pageSize));
            setTotalPages(Math.ceil(data.total / pageSize));
          })
          .catch((error) => {
            console.error("Error:", error.message);
          });
      } else if (searchType === 0) {
        console.log("searchTerm", searchTerm);
        fetch(
          `http://${API_HOST}:${API_PORT}/alimentos/busqueda/nombre/${searchTerm}?page=${currentPage}&pageSize=${pageSize}`
        )
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error("Error al obtener los alimentos");
          })

          .then((data) => {
            console.log(
              "alimentos",
              data.alimentos,
              "total",
              data.total,
              "data",
              data
            );
            setOriginalAlimentos(data.alimentos);
            setFilteredAlimentos(data.alimentos);
            setOriginalTotalPages(Math.ceil(data.total / pageSize));
            setTotalPages(Math.ceil(data.total / pageSize));
          })
          .catch((error) => {
            console.error("Error:", error.message);
          });
      } else if (searchType === 1) {
        fetch(
          `http://${API_HOST}:${API_PORT}/alimentos/busqueda/cantidad/${searchTerm}?page=${currentPage}&pageSize=${pageSize}`
        )
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error("Error al obtener los alimentos");
          })
          .then((data) => {
            setOriginalAlimentos(data.alimentos);
            setFilteredAlimentos(data.alimentos);
            setOriginalTotalPages(Math.ceil(data.total / pageSize));
            setTotalPages(Math.ceil(data.total / pageSize));
          })
          .catch((error) => {
            console.error("Error:", error.message);
          });
      } else if (searchType === 2) {
        fetch(
          `http://${API_HOST}:${API_PORT}/alimentos/busqueda/marca/${searchTerm}?page=${currentPage}&pageSize=${pageSize}`
        )
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error("Error al obtener los alimentos");
          })
          .then((data) => {
            setOriginalAlimentos(data.alimentos);
            setFilteredAlimentos(data.alimentos);
            setOriginalTotalPages(Math.ceil(data.total / pageSize));
            setTotalPages(Math.ceil(data.total / pageSize));
          })
          .catch((error) => {
            console.error("Error:", error.message);
          });
      } else if (searchType === 3) {
        fetch(
          `http://${API_HOST}:${API_PORT}/alimentos/busqueda/stock/${searchTerm}?page=${currentPage}&pageSize=${pageSize}`
        )
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error("Error al obtener los alimentos");
          })
          .then((data) => {
            setOriginalAlimentos(data.alimentos);
            setFilteredAlimentos(data.alimentos);
            setOriginalTotalPages(Math.ceil(data.total / pageSize));
            setTotalPages(Math.ceil(data.total / pageSize));
          })
          .catch((error) => {
            console.error("Error:", error.message);
          });
      } else if (searchType === 4) {
        // Formatear la fecha de búsqueda para que coincida con el formato aceptado por la API
        var formattedSearchTerm = "sin caducidad";
        if (searchTerm.trim().toLowerCase() !== "sin caducidad") {
          formattedSearchTerm = searchTerm.replace(/\//g, "-");
        } else {
          formattedSearchTerm = "sin caducidad";
        }

        fetch(
          `http://${API_HOST}:${API_PORT}/alimentos/busqueda/caducidad/${formattedSearchTerm}?page=${currentPage}&pageSize=${pageSize}`
        )
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error("Error al obtener los alimentos");
          })
          .then((data) => {
            setOriginalAlimentos(data.alimentos);
            setFilteredAlimentos(data.alimentos);
            setOriginalTotalPages(Math.ceil(data.total / pageSize));
            setTotalPages(Math.ceil(data.total / pageSize));
          })
          .catch((error) => {
            console.error("Error:", error.message);
          });
      }

      //alimentos caducados dCad
    } else if (options.f1 && options.o1) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/caducados/dCad?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); //alimentos proximos a caducar dCad
    } else if (options.f2 && options.o1) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/proximoscaducados/dCad?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos con disponibilidad dCad
    } else if (options.f3 && options.o1) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/disponibles/dCad?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); //alimentos no disponibles dCad
    } else if (options.f4 && options.o1) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/nodisponibles/dCad?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos caducados uCad
    } else if (options.f1 && options.o2) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/caducados/uCad?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos proximos a caducar uCad
    } else if (options.f2 && options.o2) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/proximoscaducados/uCad?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos con disponibilidad dCad
    } else if (options.f3 && options.o2) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/disponibles/uCad?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos sin disponibilidad uCad
    } else if (options.f4 && options.o2) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/nodisponibles/uCad?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos caducados dEnt
    } else if (options.f1 && options.o3) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/caducados/dEnt?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos proximos a caducar dEnt
    } else if (options.f2 && options.o3) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/proximoscaducados/dEnt?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos disponibles dEnt
    } else if (options.f3 && options.o3) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/disponibles/dEnt?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos no disponibles dEnt
    } else if (options.f4 && options.o3) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/nodisponibles/dEnt?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos caducados uEnt
    } else if (options.f1 && options.o4) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/caducados/uEnt?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos proximos a caducar uEnt
    } else if (options.f2 && options.o4) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/proximoscaducados/uEnt?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos disponibles uEnt
    } else if (options.f3 && options.o4) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/disponibles/uEnt?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos nodisponibles uEnt
    } else if (options.f4 && options.o4) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/nodisponibles/uEnt?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos caducados alfaB
    } else if (options.f1 && options.o5) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/caducados/alfaB?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos proximos a caducar alfaB
    } else if (options.f2 && options.o5) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/proximoscaducados/alfaB?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos disponibles alfaB
    } else if (options.f3 && options.o5) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/disponibles/alfaB?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos nodisponibles alfaB
    } else if (options.f4 && options.o5) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/nodisponibles/alfaB?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos caducados sin orden
    } else if (
      options.f1 &&
      !options.o1 &&
      !options.o2 &&
      !options.o3 &&
      !options.o4 &&
      !options.o5
    ) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/caducados?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos proximos a caducar sin orden
    } else if (
      options.f2 &&
      !options.o1 &&
      !options.o2 &&
      !options.o3 &&
      !options.o4 &&
      !options.o5
    ) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/proximoscaducados?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos disponibles sin orden
    } else if (
      options.f3 &&
      !options.o1 &&
      !options.o2 &&
      !options.o3 &&
      !options.o4 &&
      !options.o5
    ) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/disponibles?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar solo alimentos nodisponibles sin orden
    } else if (
      options.f4 &&
      !options.o1 &&
      !options.o2 &&
      !options.o3 &&
      !options.o4 &&
      !options.o5
    ) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/nodisponibles?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar todos los alimentos ordenados por dCad
    } else if (
      !options.f1 &&
      !options.f2 &&
      !options.f3 &&
      !options.f4 &&
      options.o1
    ) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/ordenados/dCad?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar todos los alimentos ordenados por uCad
    } else if (
      !options.f1 &&
      !options.f2 &&
      !options.f3 &&
      !options.f4 &&
      options.o2
    ) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/ordenados/uCad?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar todos los alimentos ordenados por dEnt
    } else if (
      !options.f1 &&
      !options.f2 &&
      !options.f3 &&
      !options.f4 &&
      options.o3
    ) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/ordenados/dEnt?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar todos los alimentos ordenados por uEnt
    } else if (
      !options.f1 &&
      !options.f2 &&
      !options.f3 &&
      !options.f4 &&
      options.o4
    ) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/ordenados/uEnt?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar todos los alimentos ordenados por alfaB
    } else if (
      !options.f1 &&
      !options.f2 &&
      !options.f3 &&
      !options.f4 &&
      options.o5
    ) {
      fetch(
        `http://${API_HOST}:${API_PORT}/alimentos/ordenados/alfaB?page=${currentPage}&pageSize=${pageSize}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalAlimentos(data);
          setFilteredAlimentos(data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        }); // mostrar todos los alimentos ordenados por uEnt
    } else {
      console.log("No hay una combinación de filtros y ordenamiento válida.");
    }

    //set pages according to alimentos

    if (options.f1) {
      fetch(`http://${API_HOST}:${API_PORT}/alimentos/count/caducados`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalTotalPages(Math.ceil(data.total / pageSize));
          setTotalPages(Math.ceil(data.total / pageSize));
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });
    } else if (options.f2) {
      fetch(`http://${API_HOST}:${API_PORT}/alimentos/count/proximoscaducados`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalTotalPages(Math.ceil(data.total / pageSize));
          setTotalPages(Math.ceil(data.total / pageSize));
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });
    } else if (options.f3) {
      fetch(`http://${API_HOST}:${API_PORT}/alimentos/count/disponibles`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalTotalPages(Math.ceil(data.total / pageSize));
          setTotalPages(Math.ceil(data.total / pageSize));
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });
    } else if (options.f4) {
      fetch(`http://${API_HOST}:${API_PORT}/alimentos/count/nodisponibles`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error al obtener los alimentos");
        })
        .then((data) => {
          setOriginalTotalPages(Math.ceil(data.total / pageSize));
          setTotalPages(Math.ceil(data.total / pageSize));
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });
    } else {
      console.log("No hay filtros seleccionados");
    }
  }, [currentPage, options, pageSize, searchType, searchTerm]);

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    setInputPage(String(currentPage - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
    setInputPage(String(currentPage + 1));
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
    setInputPage("1");
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
    setInputPage(String(totalPages));
  };

  const goToPage = () => {
    const pageNumber = parseInt(inputPage, 10);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    } else {
      setIsModalOpen(true);
      setInputPage(String(currentPage));
    }
  };

  const handleInputChange = (event) => {
    setInputPage(event.target.value);
  };

  const handleInputBlur = () => {
    goToPage();
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      goToPage();
    }
  };

  const handleSaveToXLSX = () => {
    fetch(`http://${API_HOST}:${API_PORT}/alimentos/xlsx`, {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) {
          return response.blob();
        } else {
          throw new Error("Error al descargar el archivo");
        }
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "alimentos.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="adminPage">
      <ReturnButton />
      <Guide
        message="Saludos a todos, bienvenidos al sistema de administración del albergue, el día de hoy centrense en comprenderlo :) "
        size={100}
        className="guide"
      />
      <SearchBar
        onSearch={setSearchTerm}
        addCartNumber={addCartNumber}
        deleteCartNumber={deleteCartNumber}
        addActive={addActive}
        deleteActive={deleteActive}
        onAddUser={handleCreateUser}
        searchType={searchType}
        goToFirstPage={goToFirstPage}
        disabled={
          options.f1 ||
          options.f2 ||
          options.f3 ||
          options.f4 ||
          options.o1 ||
          options.o2 ||
          options.o3 ||
          options.o4 ||
          options.o5
        }
      />
      <SlidingSideBar
        options={options}
        setOptions={setOptions}
        showWithoutStock={showWithoutStock}
        setShowWithoutStock={setShowWithoutStock}
      />
      <div className="alimentosBox">
        <div className="divHeaders">
          <button
            className={
              searchType === 0 ? "productoH productoH__active" : "productoH"
            }
            onClick={() => setSearchType(0)}
          >
            Producto
          </button>
          <button
            className={
              searchType === 1 ? "cantidadH cantidadH__active" : "cantidadH"
            }
            onClick={() => setSearchType(1)}
          >
            Cantidad
          </button>
          <button
            className={searchType === 2 ? "marcaH marcaH__active" : "marcaH"}
            onClick={() => setSearchType(2)}
          >
            Marca
          </button>
          <button
            className={searchType === 3 ? "stockH stockH__active" : "stockH"}
            onClick={() => setSearchType(3)}
          >
            Existencias
          </button>
          <button
            className={
              searchType === 4 ? "caducidadH caducidadH__active" : "caducidadH"
            }
            onClick={() => setSearchType(4)}
          >
            Caducidad
          </button>
        </div>
        {filteredAlimentos.map(
          (alimento) => (
            console.log("alimento", alimento.a_cantidad),
            (
              <RowAdminPage
                showWithoutStock={showWithoutStock}
                key={alimento.a_id}
                id={alimento.a_id}
                product={alimento.a_nombre}
                amount={convertAmount(alimento.a_cantidad)}
                unit={alimento.um_id}
                brand={
                  alimento.m_nombre == null ? "Sin marca" : alimento.m_nombre
                }
                stock={alimento.a_stock}
                cadDate={alimento.a_fechaCaducidad}
                onChange={handleCheckboxChange}
                selectedIds={selectedIds}
                modificationMap={modificationMap}
                setModificationMap={setModificationMap}
                savedChanges={savedChanges}
                setSavedChanges={setSavedChanges}
                stockResetId={stockResetId}
              />
            )
          )
        )}
      </div>
      <div className="paginacion">
        <button
          className="anterior"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
        >
          <svg
            width="100"
            height="100"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4l-8 8 8 8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Página Anterior
        </button>
        <button className="bottom" onClick={goToFirstPage}>
          1
        </button>
        <input
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="paginacionField"
        />
        <button className="top" onClick={goToLastPage}>
          {totalPages}
        </button>
        <button
          className="siguiente"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
        >
          Siguiente Página{" "}
          <svg
            width="100"
            height="100"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4l8 8-8 8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      {isModalOpen && (
        <div className="modalOverlayConf">
          <ConfirmationPopUp
            message="La página ingresada no es válida, por favor ingresa un número de página válido."
            answer1="Ok"
            isOpen={isModalOpen}
            closeModal={() => setIsModalOpen(false)}
          />
        </div>
      )}

      {savedChangesPopUp && (
        <div className="modalOverlayConf">
          <ConfirmationPopUp
            message="Se han modificado los alimentos seleccionados."
            answer1="Ok"
            isOpen={savedChangesPopUp}
            closeModal={() => setSavedChangesPopUp(false)}
          />
        </div>
      )}

      <button
        onClick={handleSaveChanges}
        className={
          modificationConfirmation ? "saveButton hidden" : "saveButton"
        }
      >
        <img src={saveIcon}></img>
      </button>

      <button onClick={handleSaveToXLSX} className="saveButtonXLSX">
        <img src={excelIcon}></img>
      </button>
    </div>
  );
};
