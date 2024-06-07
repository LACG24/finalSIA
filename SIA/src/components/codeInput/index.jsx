import React, { useState, useRef } from 'react';
import './CodeInput.css';

export function CodeInput({ onComplete }) {
  const [codes, setCodes] = useState(['', '', '', '', '']);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);
    if (value !== '' && index < 4) {
      inputRefs[index + 1].current.focus();
    }
    if (index === 4 && newCodes.join('').length === 5) {
      onComplete(newCodes.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && index > 0 && codes[index] === '') {
      inputRefs[index - 1].current.focus();
    }
  };

  return (
    <div className="code-input-container">
      {codes.map((code, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={code}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={inputRefs[index]}
          className="code-input"
        />
      ))}
    </div>
  );
}
