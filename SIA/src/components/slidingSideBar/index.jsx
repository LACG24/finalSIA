import React, { useState, useRef } from "react";
import { Guide } from "../guide";
import "./SlidingSideBar.css";
import returnImage from "../../assets/img/returnImage.png";
import { Ordenamiento } from "../ordenamiento";

export function SlidingSideBar({
  options,
  setOptions,
  showWithoutStock,
  setShowWithoutStock,
}) {
  const [expanded, setExpanded] = useState(false);

  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const handleClick = (event) => {
    if (
      !expanded &&
      sidebarRef.current &&
      sidebarRef.current.contains(event.target)
    ) {
      setExpanded(true);
    } else if (expanded) {
      event.stopPropagation();
    }
  };

  const handleClickStock = () => {
    setShowWithoutStock(!showWithoutStock);
    console.log(showWithoutStock);
  };

  return (
    <div
      className={`sidebar ${expanded ? "expanded" : ""}`}
      onClick={toggleSidebar}
    >
      <div className="bar" ref={sidebarRef}></div>
      <img
        className="sidebar-image"
        src={returnImage}
        alt="Return"
        style={{
          transform: expanded ? "rotate(0deg)" : "rotate(180deg)",
          paddingLeft: expanded ? "0px" : "12%",
          paddingRight: expanded ? "2%" : "0px",
        }}
        onClick={toggleSidebar}
      />
      <div
        className={`additional-content ${expanded ? "expanded" : ""}`}
        onClick={handleClick}
      >
        <div className="headerSlider">
          <Guide message="Selecciona un filtro para ver solo un tipo de alimentos u ordenalos como gustes" />
          <button
            className={
              showWithoutStock ? "showWithoutStock" : "hideWithoutStock"
            }
            onClick={handleClickStock}
          >
            <p>Mostrar alimentos sin stock</p>
          </button>
        </div>
        <div className="title-container">
          <p className="title">FILTRAR ALIMENTOS</p>
          <p className="title">ESTADO</p>
        </div>
        <Ordenamiento
          message="Mostrar solo alimentos caducados"
          options={options}
          option="f1"
          setOptions={setOptions}
        ></Ordenamiento>
        <Ordenamiento
          message="Mostrar solo alimentos próximos a caducar"
          options={options}
          option="f2"
          setOptions={setOptions}
        ></Ordenamiento>
        <Ordenamiento
          message="Mostrar solo alimentos con disponibilidad"
          options={options}
          option="f3"
          setOptions={setOptions}
        ></Ordenamiento>
        <Ordenamiento
          message="Mostrar solo alimentos sin disponibilidad"
          options={options}
          option="f4"
          setOptions={setOptions}
        ></Ordenamiento>
        <div className="title-container">
          <p className="title">ORDENAR ALIMENTOS</p>
          <p className="title">ESTADO</p>
        </div>
        <Ordenamiento
          message="Fecha de caducidad (de más cercana a menos cercana)"
          options={options}
          option="o1"
          setOptions={setOptions}
        ></Ordenamiento>
        <Ordenamiento
          message="Fecha de caducidad (de menos cercana a más cercana)"
          options={options}
          option="o2"
          setOptions={setOptions}
        ></Ordenamiento>
        <Ordenamiento
          message="Fecha de registro (de más cercana a menos cercana)"
          options={options}
          option="o3"
          setOptions={setOptions}
        ></Ordenamiento>
        <Ordenamiento
          message="Fecha de registro (de menos cercana a más cercana)"
          options={options}
          option="o4"
          setOptions={setOptions}
        ></Ordenamiento>
        <Ordenamiento
          message="Orden alfabético"
          options={options}
          option="o5"
          setOptions={setOptions}
        ></Ordenamiento>
      </div>
    </div>
  );
}
