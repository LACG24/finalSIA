import React from "react";
import PropTypes from "prop-types";
import "./guide.css";
import humanoIcon from "../../assets/img/humanIcon.svg";

export function Guide({ message }) {
  return (
    <div className="info-banner">
      <img src={humanoIcon} alt="Icono de humano" />
      <div className="info-banner-text">
        <p>{message}</p>
      </div>
    </div>
  );
}
Guide.propTypes = {
  message: PropTypes.string.isRequired,
};
