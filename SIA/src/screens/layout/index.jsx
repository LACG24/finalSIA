import React from "react";
import "./layout.css";
import { CadCheckCounter } from "../../components/cadCheckCounter";
import { ReturnButton } from "../../components/returnButton";
import { ConfirmationPopUp } from "../../components/confirmationPopUp";
import { GeneralButton } from "../../components/button";
import { LogInput } from "../../components/logInput";
import { Ordenamiento } from "../../components/ordenamiento";
import { CalendarInput } from "../../components/calendarInput";
import { ButtonSquare } from "../../components/buttonSquare";
import { SelectDate } from "../../components/selectDate";
import { SelectDateDelete } from "../../components/selectDateDelete";
// import { SearchBar } from "../../components/search";

export const Layout = () => {
  return (
    <div className="layOut">
      <CadCheckCounter unit="test" amount="1" />
      <CadCheckCounter unit="test2" amount="21323" />
      <ReturnButton textElement="" />
      <ReturnButton textElement="Agregar Producto Existente" />
      <ConfirmationPopUp
        message="¿Está seguro de que quiere eliminar estos alimentos?"
        answer1="Cancelar"
        answer2="Eliminar"
        path1="/layout"
        path2="/layout"
      />
      <Ordenamiento />
      <LogInput></LogInput>
      <CalendarInput></CalendarInput>
      <ButtonSquare></ButtonSquare>
      <SelectDate></SelectDate>
      <SelectDateDelete></SelectDateDelete>
      {/* <SearchBar></SearchBar> */}
    </div>
  );
};
