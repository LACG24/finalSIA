import express from "express";
import bodyParser from "body-parser";
import { connection } from "./db.js";
import crypto from "crypto";
import axios from "axios";
import cors from "cors";
import xlsx from "xlsx";

const app = express();

const PORT = process.env.API_PORT;
const FRONTEND_PORT = process.env.FRONTEND_PORT;
const API_HOST = process.env.API_HOST;

app.use(
  cors({
    origin: function (origin, callback) {
      const whitelist = [
        `http://${API_HOST}:${FRONTEND_PORT}`,
        `http://localhost:` + FRONTEND_PORT,
      ];
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

app.get("/", (req, res) => {
  connection.query("SELECT * FROM Alimento", (err, rows) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).send("Server error");
    }
    res.json(rows);
  });
});

app.post("/login", (req, res) => {
  const { id, password } = req.body;

  console.log(`Login attempt: id=${id}, password=${password}`);

  if (!id || !password) {
    return res.status(400).send("Missing id or password");
  }

  connection.query(
    "SELECT * FROM Usuario WHERE u_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("Query error:", err);
        return res.status(500).send("Server error");
      }
      if (rows.length === 0) {
        console.log("User not found");
        return res.status(401).send("Invalid username or password");
      }

      const userData = rows[0];
      console.log("Retrieved user data:", userData); // Log the user data for debugging

      const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

      if (userData.u_pass === hashedPassword) {
        console.log("Login successful");
        res.json({ userId: userData.u_id, userRol: userData.u_rol });
      } else {
        console.log("Invalid password", userData.u_pass, hashedPassword);
        res.status(401).send("Invalid username or password");
      }
    }
  );
});

app.post("/validate", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send("Missing id");
  }

  connection.query(
    "SELECT * FROM Usuario WHERE u_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("Query error:", err);
        return res.status(500).send("Server error");
      }

      if (rows.length === 0) {
        console.log("User not found");
        return res.status(401).send("Invalid username");
      }

      // If user is found
      console.log("User found:", rows[0]);
      return res.status(200).send("User validated");
    }
  );
});

//-------------------------------------------------------------------------------------------------------

// xlsx para alimentos

app.get("/alimentos/xlsx", (req, res) => {
  connection.query("SELECT * FROM Alimento", (err, rows) => {
    if (err) {
      console.error("Error de consulta:", err);
      return res.status(500).send("Error de servidor");
    }

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(rows);
    xlsx.utils.book_append_sheet(wb, ws, "Alimentos");

    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=alimentos.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  });
});

// Obtener fechas de caducidad de UN ALIMENTO ESPECÍFICO (Lata de Atún 200 g)
app.get("/alimentos/atun", (req, res) => {
  connection.query(
    "SELECT a_id, a_fechaCaducidad, a_stock FROM Alimento WHERE a_nombre = 'Lata de Atún' AND a_cantidad = 200 AND um_id = 'g'",
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// Obtener todas las fechas de caducidad
app.get("/alimentos/atun/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT a1.* FROM Alimento a1 INNER JOIN ( SELECT a_nombre, a_cantidad, um_id FROM Alimento WHERE a_id = ?) a2 ON a1.a_nombre = a2.a_nombre AND a1.a_cantidad = a2.a_cantidad AND a1.um_id = a2.um_id",
    [id],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      if (rows.length === 0) {
        return res.status(404).send("Alimento no encontrado");
      }
      res.json(rows);
    }
  );
});

// Obtener informacion para la tabla dentro de checkDate
app.get("/alimentos/checkDate", (req, res) => {
  let ids = req.query.ids;

  if (!ids) {
    return res.status(400).send("No se proporcionaron IDs válidos");
  }

  // Asegurarse de que ids sea un array, incluso si solo es un único elemento
  if (!Array.isArray(ids)) {
    ids = [ids];
  }

  if (ids.length === 0) {
    return res.status(400).send("No se proporcionaron IDs válidos");
  }

  const placeholders = ids.map(() => "?").join(",");
  const query = `
    SELECT a.*, (SELECT m.m_nombre FROM Marca m WHERE m.m_id = a.m_id) AS marca_nombre 
    FROM Alimento a 
    WHERE a.a_id IN (${placeholders});
  `;

  connection.query(query, ids, (err, rows) => {
    if (err) {
      console.error("Error de consulta:", err);
      return res.status(500).send("Error de servidor");
    }
    res.json(rows);
  });
});

// Obtener todos los alimentos
app.get("/alimentos", (req, res) => {
  connection.query("SELECT * FROM Alimento", (err, rows) => {
    if (err) {
      console.error("Error de consulta:", err);
      return res.status(500).send("Error de servidor");
    }
    res.json(rows);
  });
});

// Obtener todos los alimentos unido con tabla marca y unidadmedida.
app.get("/alimentos/join/all", (req, res) => {
  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida ORDER BY Alimento.a_nombre",
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// contar alimentos
app.get("/alimentos/count", (req, res) => {
  connection.query("SELECT COUNT(*) AS total FROM Alimento", (err, rows) => {
    if (err) {
      console.error("Error de consulta:", err);
      return res.status(500).send("Error de servidor");
    }
    res.json(rows[0]);
  });
});

//Filtros para alimentos ordenados por fecha de caducidad u=up(de menos cercana a más cercana) d=down(de más cercana a menos cercana)

// Obtener todos los alimentos unido con tabla marca
app.get("/alimentos/join/marca", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id ORDER BY Alimento.a_nombre LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos caducados dCad
app.get("/alimentos/caducados/dCad", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad < NOW() ORDER BY a_fechaCaducidad LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos por caducar dCad
app.get("/alimentos/proximoscaducados/dCad", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad < DATE_ADD(NOW(), INTERVAL 1 MONTH) AND a_fechaCaducidad > NOW() ORDER BY a_fechaCaducidad LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos con disponibilidad dCad
app.get("/alimentos/disponibles/dCad", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_stock > 0 ORDER BY a_fechaCaducidad LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos sin disponibilidad dCad
app.get("/alimentos/nodisponibles/dCad", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_stock = 0 ORDER BY a_fechaCaducidad LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos caducados uCad
app.get("/alimentos/caducados/uCad", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad < NOW() ORDER BY a_fechaCaducidad DESC LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos por caducar uCad
app.get("/alimentos/proximoscaducados/uCad", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad < DATE_ADD(NOW(), INTERVAL 1 MONTH) AND a_fechaCaducidad > NOW() ORDER BY a_fechaCaducidad DESC LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos con disponibilidad uCad
app.get("/alimentos/disponibles/uCad", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_stock > 0 ORDER BY a_fechaCaducidad DESC LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos sin disponibilidad uCad
app.get("/alimentos/nodisponibles/uCad", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_stock = 0 ORDER BY a_fechaCaducidad DESC LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

//Filtros para alimentos ordenados por fecha de entrada u=up(de menos cercana a más cercana) d=down(de más cercana a menos cercana)

// mostrar solo alimentos caducados dEnt
app.get("/alimentos/caducados/dEnt", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad < NOW() ORDER BY a_fechaEntrada LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos por caducar dEnt
app.get("/alimentos/proximoscaducados/dEnt", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad < DATE_ADD(NOW(), INTERVAL 1 MONTH) AND a_fechaCaducidad > NOW() ORDER BY a_fechaEntrada LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos con disponibilidad dEnt
app.get("/alimentos/disponibles/dEnt", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_stock > 0 ORDER BY a_fechaEntrada LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos sin disponibilidad dEnt
app.get("/alimentos/nodisponibles/dEnt", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_stock = 0 ORDER BY a_fechaEntrada LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos caducados uEnt
app.get("/alimentos/caducados/uEnt", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad < NOW() ORDER BY a_fechaEntrada DESC LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos por caducar uEnt
app.get("/alimentos/proximoscaducados/uEnt", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad < DATE_ADD(NOW(), INTERVAL 1 MONTH) AND a_fechaCaducidad > NOW() ORDER BY a_fechaEntrada DESC LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos con disponibilidad uEnt
app.get("/alimentos/disponibles/uEnt", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_stock > 0 ORDER BY a_fechaEntrada DESC LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos sin disponibilidad uEnt
app.get("/alimentos/nodisponibles/uEnt", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_stock = 0 ORDER BY a_fechaEntrada DESC LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

//Filtros para alimentos ordenados en orden alfabético para nombre producto(de la A a la Z)

// mostrar solo alimentos caducados alfaB
app.get("/alimentos/caducados/alfaB", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad < NOW() ORDER BY a_nombre LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos por caducar alfaB
app.get("/alimentos/proximoscaducados/alfaB", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad < DATE_ADD(NOW(), INTERVAL 1 MONTH) AND a_fechaCaducidad > NOW() ORDER BY a_nombre LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos con disponibilidad alfaB
app.get("/alimentos/disponibles/alfaB", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_stock > 0 ORDER BY a_nombre LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar solo alimentos sin disponibilidad alfaB
app.get("/alimentos/nodisponibles/alfaB", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_stock = 0 ORDER BY a_nombre LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

//mostrar solo alimentos caducados sin orden

app.get("/alimentos/caducados", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento
  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad < NOW() LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

//mostrar solo alimentos por caducar sin orden

app.get("/alimentos/proximoscaducados", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento
  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad < DATE_ADD(NOW(), INTERVAL 1 MONTH) AND a_fechaCaducidad > NOW() LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

//mostrar solo alimentos con disponibilidad sin orden

app.get("/alimentos/disponibles", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento
  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_stock > 0 LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

//mostrar solo alimentos sin disponibilidad sin orden

app.get("/alimentos/nodisponibles", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento
  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_stock = 0 LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

//mostrar todos los alimentos alimentos ordenados por dCad

app.get("/alimentos/ordenados/dCad", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento
  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida ORDER BY a_fechaCaducidad LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

//mostrar todos los alimentos alimentos ordenados por uCad

app.get("/alimentos/ordenados/uCad", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento
  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida ORDER BY a_fechaCaducidad DESC LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

//mostrar todos los alimentos alimentos ordenados por dEnt

app.get("/alimentos/ordenados/dEnt", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento
  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida ORDER BY a_fechaEntrada LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

//mostrar todos los alimentos alimentos ordenados por uEnt

app.get("/alimentos/ordenados/uEnt", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento
  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida ORDER BY a_fechaEntrada DESC LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// mostrar todos los alimentos alimentos ordenados por alfaB

app.get("/alimentos/ordenados/alfaB", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento
  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida ORDER BY a_nombre LIMIT ?, ?",
    [offset, pageSize],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

//count para alimentos caducados

app.get("/alimentos/count/caducados", (req, res) => {
  connection.query(
    "SELECT COUNT(*) AS total FROM Alimento WHERE a_fechaCaducidad < NOW()",
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows[0]);
    }
  );
});

//count para alimentos por caducar

app.get("/alimentos/count/proximoscaducados", (req, res) => {
  connection.query(
    "SELECT COUNT(*) AS total FROM Alimento WHERE a_fechaCaducidad < DATE_ADD(NOW(), INTERVAL 1 MONTH) AND a_fechaCaducidad > NOW()",
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows[0]);
    }
  );
});

//count para alimentos con disponibilidad

app.get("/alimentos/count/disponibles", (req, res) => {
  connection.query(
    "SELECT COUNT(*) AS total FROM Alimento WHERE a_stock > 0",
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows[0]);
    }
  );
});

//count para alimentos sin disponibilidad

app.get("/alimentos/count/nodisponibles", (req, res) => {
  connection.query(
    "SELECT COUNT(*) AS total FROM Alimento WHERE a_stock = 0",
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows[0]);
    }
  );
});

//-----------------------------------------------------------------------------------------------------------------------

// Obtener un alimento por ID
app.get("/alimentos/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      if (rows.length === 0) {
        return res.status(404).send("Alimento no encontrado");
      }
      res.json(rows[0]);
    }
  );
});

// Obtener información de un alimento por su ID
app.get("/alimentos/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      if (rows.length === 0) {
        return res.status(404).send("Alimento no encontrado");
      }
      res.json(rows[0]);
    }
  );
});

// Agregar un nuevo alimento
app.post("/alimentos", (req, res) => {
  const {
    a_nombre,
    a_cantidad,
    a_stock,
    a_fechaSalida,
    a_fechaEntrada,
    a_fechaCaducidad,
    um_id,
    m_id,
    u_id, // Nuevo parámetro: ID del usuario que realiza la acción
  } = req.body;
  console.log(req.body);

  const registrarAccion = (a_id, actionType, quantity) => {
    return axios
      .post(`http://${API_HOST}:${PORT}/usuarios/stock`, {
        a_id,
        u_id,
        actionType,
        quantity,
      })
      .then((response) => {
        console.log("Procedimiento ejecutado correctamente");
      })
      .catch((error) => {
        console.error("Error al ejecutar el procedimiento:", error);
      });
  };

  if (a_fechaCaducidad === null) {
    connection.query(
      "SELECT * FROM Alimento WHERE a_nombre = ? AND a_cantidad = ? AND a_fechaCaducidad IS NULL AND um_id = ? AND (m_id = ? OR (? = 0 AND m_id IS NULL))",
      [a_nombre, a_cantidad, um_id, m_id, m_id],
      (err, results) => {
        if (err) {
          console.error("Error al buscar alimento:", err);
          return res.status(500).send("Error de servidor");
        }

        if (results.length > 0) {
          // Si existe, actualiza el stock
          registrarAccion(results[0].a_id, 0, a_stock); // Actualizar stock
          res.status(201).send("Stock actualizado correctamente");
        } else {
          // Si no existe, inserta un nuevo registro
          const query =
            m_id === 0
              ? "INSERT INTO Alimento (a_nombre, a_cantidad, a_stock, a_fechaSalida, a_fechaEntrada, a_fechaCaducidad, um_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
              : "INSERT INTO Alimento (a_nombre, a_cantidad, a_stock, a_fechaSalida, a_fechaEntrada, a_fechaCaducidad, um_id, m_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
          const params =
            m_id === 0
              ? [
                  a_nombre,
                  a_cantidad,
                  a_stock,
                  a_fechaSalida,
                  a_fechaEntrada,
                  a_fechaCaducidad,
                  um_id,
                ]
              : [
                  a_nombre,
                  a_cantidad,
                  a_stock,
                  a_fechaSalida,
                  a_fechaEntrada,
                  a_fechaCaducidad,
                  um_id,
                  m_id,
                ];

          connection.query(query, params, (err, result) => {
            if (err) {
              console.error("Error al insertar alimento:", err);
              return res.status(500).send("Error de servidor");
            }
            registrarAccion(result.insertId, 2, a_stock); // Nuevo stock
            res.status(201).send("Alimento agregado correctamente");
          });
        }
      }
    );
  } else {
    connection.query(
      "SELECT * FROM Alimento WHERE a_nombre = ? AND a_cantidad = ? AND a_fechaCaducidad = ? AND um_id = ? AND (m_id = ? OR (? = 0 AND m_id IS NULL))",
      [a_nombre, a_cantidad, a_fechaCaducidad, um_id, m_id, m_id],
      (err, results) => {
        if (err) {
          console.error("Error al buscar alimento:", err);
          return res.status(500).send("Error de servidor");
        }

        if (results.length > 0) {
          // Si existe, actualiza el stock

          registrarAccion(results[0].a_id, 0, a_stock); // Actualizar stock
          //response ok

          res.status(201).send("Alimento actualizado correctamente");
        } else {
          // Si no existe, inserta un nuevo registro
          const query =
            m_id === 0
              ? "INSERT INTO Alimento (a_nombre, a_cantidad, a_stock, a_fechaSalida, a_fechaEntrada, a_fechaCaducidad, um_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
              : "INSERT INTO Alimento (a_nombre, a_cantidad, a_stock, a_fechaSalida, a_fechaEntrada, a_fechaCaducidad, um_id, m_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
          const params =
            m_id === 0
              ? [
                  a_nombre,
                  a_cantidad,
                  a_stock,
                  a_fechaSalida,
                  a_fechaEntrada,
                  a_fechaCaducidad,
                  um_id,
                ]
              : [
                  a_nombre,
                  a_cantidad,
                  a_stock,
                  a_fechaSalida,
                  a_fechaEntrada,
                  a_fechaCaducidad,
                  um_id,
                  m_id,
                ];

          connection.query(query, params, (err, result) => {
            if (err) {
              console.error("Error al insertar alimento:", err);
              return res.status(500).send("Error de servidor");
            }
            registrarAccion(result.insertId, 2, a_stock); // Nuevo stock
            res.status(201).send("Alimento agregado correctamente");
          });
        }
      }
    );
  }
});

//actualizar alimento por id
app.put("/alimentos/:id", (req, res) => {
  const { id } = req.params;
  const {
    a_nombre,
    a_cantidad,
    a_stock,
    a_fechaSalida,
    a_fechaEntrada,
    a_fechaCaducidad,
    um_id,
    m_id,
  } = req.body;

  // Primero, busca si existe un alimento con las mismas características
  connection.query(
    "SELECT * FROM Alimento WHERE a_nombre = ? AND a_cantidad = ? AND a_fechaCaducidad = ? AND um_id = ? AND m_id = ?",
    [a_nombre, a_cantidad, a_fechaCaducidad, um_id, m_id],
    (err, results) => {
      if (err) {
        console.error("Error al buscar alimento:", err);
        return res.status(500).send("Error de servidor");
      }

      if (results.length > 0) {
        // Si existe un alimento con las mismas características, suma el stock y elimina el alimento actual
        const existingAlimento = results[0];
        const newStock = existingAlimento.a_stock + a_stock;

        connection.query(
          "UPDATE Alimento SET a_stock = ? WHERE a_id = ?",
          [newStock, existingAlimento.a_id],
          (err, result) => {
            if (err) {
              console.error(
                "Error al actualizar stock del alimento existente:",
                err
              );
              return res.status(500).send("Error de servidor");
            }

            // Elimina el alimento actual
            connection.query(
              "DELETE FROM Alimento WHERE a_id = ?",
              [id],
              (err, result) => {
                if (err) {
                  console.error("Error al eliminar el alimento actual:", err);
                  return res.status(500).send("Error de servidor");
                }

                res
                  .status(200)
                  .send(
                    "Alimento actualizado correctamente, se sumó el stock y se eliminó el alimento duplicado"
                  );
              }
            );
          }
        );
      } else {
        // Si no existe un alimento con las mismas características, actualiza el alimento normalmente
        connection.query(
          "UPDATE Alimento SET a_nombre = ?, a_cantidad = ?, a_stock = ?, a_fechaSalida = ?, a_fechaEntrada = ?, a_fechaCaducidad = ?, um_id = ?, m_id = ? WHERE a_id = ?",
          [
            a_nombre,
            a_cantidad,
            a_stock,
            a_fechaSalida,
            a_fechaEntrada,
            a_fechaCaducidad,
            um_id,
            m_id,
            id,
          ],
          (err, result) => {
            if (err) {
              console.error("Error al actualizar alimento:", err);
              return res.status(500).send("Error de servidor");
            }
            res.status(200).send("Alimento actualizado correctamente");
          }
        );
      }
    }
  );
});

//actualizar alimento solo con stock

app.put("/alimentos/stock/:id", (req, res) => {
  const { id } = req.params;
  const { a_stock } = req.body;
  connection.query(
    "UPDATE Alimento SET a_stock = ? WHERE a_id = ?",
    [a_stock, id],

    (err, result) => {
      if (err) {
        console.error("Error al actualizar alimento:", err);
        return res.status(500).send("Error de servidor");
      }
      res.status(200).send("Alimento actualizado correctamente");
    }
  );
});

//actualizar alimento solo con FECHA DE SALIDA

app.put("/alimentos/out/:id", (req, res) => {
  const { id } = req.params;
  const { a_fechaSalida } = req.body;
  connection.query(
    "UPDATE Alimento SET a_fechaSalida = ? WHERE a_id = ?",
    [a_fechaSalida, id],

    (err, result) => {
      if (err) {
        console.error("Error al actualizar alimento:", err);
        return res.status(500).send("Error de servidor");
      }
      res.status(200).send("Alimento actualizado correctamente");
    }
  );
});

// Eliminar un alimento por ID
app.delete("/alimentos/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "DELETE FROM Alimento WHERE a_id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Error al eliminar alimento:", err);
        return res.status(500).send("Error de servidor");
      }
      res.status(200).send("Alimento eliminado correctamente");
    }
  );
});

//busqueda de alimentos

app.get("/alimentos/busqueda/nombre/:nombre", (req, res) => {
  const { nombre } = req.params;
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  // Consulta para obtener los datos de los alimentos
  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_nombre LIKE ? AND a_stock > 0 LIMIT ?, ?",
    ["%" + nombre + "%", offset, pageSize],
    (err, alimentos) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }

      // Consulta para obtener el conteo total de alimentos
      connection.query(
        "SELECT COUNT(*) AS total FROM Alimento WHERE a_nombre LIKE ?",
        ["%" + nombre + "%"],
        (err, countResult) => {
          if (err) {
            console.error("Error de consulta:", err);
            return res.status(500).send("Error de servidor");
          }

          // Crear un objeto JSON con los datos de los alimentos y el conteo total
          const total = countResult[0].total;
          const response = {
            total,
            alimentos,
          };

          res.json(response);
        }
      );
    }
  );
});

//busqueda por nombre general, sin paginacion, para autocompletar

app.get("/alimentos/busqueda/nombre/total/:nombre", (req, res) => {
  const { nombre } = req.params;
  connection.query(
    "SELECT a_nombre FROM Alimento WHERE a_nombre LIKE ?",
    ["%" + nombre + "%"],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

app.get("/alimentos/busqueda/marca/:marca", (req, res) => {
  const { marca } = req.params;
  let formattedMarca = "";

  // Formatear la entrada del usuario para la consulta SQL
  formattedMarca =
    marca.trim().toLowerCase() === "sin marca" ? null : `%${marca}%`;

  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  // Consulta para obtener los datos de los alimentos
  let sqlQuery;
  let countQuery;

  if (formattedMarca === null) {
    // Si el usuario busca alimentos sin marca
    sqlQuery =
      "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE m_nombre IS NULL AND a_stock > 0 LIMIT ?, ?";
    countQuery =
      "SELECT COUNT(*) AS total FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id WHERE m_nombre IS NULL AND a_stock > 0";
  } else {
    // Si el usuario busca alimentos con una marca específica
    sqlQuery =
      "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE m_nombre LIKE ? AND a_stock > 0 LIMIT ?, ?";
    countQuery =
      "SELECT COUNT(*) AS total FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id WHERE m_nombre LIKE ? AND a_stock > 0";
  }

  // Ejecutar la consulta para obtener los datos de los alimentos
  connection.query(
    sqlQuery,
    formattedMarca === null
      ? [offset, pageSize]
      : [formattedMarca, offset, pageSize],
    (err, alimentos) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }

      // Ejecutar la consulta para obtener el conteo total de alimentos
      connection.query(
        countQuery,
        formattedMarca === null ? [] : [formattedMarca],
        (err, countResult) => {
          if (err) {
            console.error("Error de consulta:", err);
            return res.status(500).send("Error de servidor");
          }

          // Crear un objeto JSON con los datos de los alimentos y el conteo total
          const total = countResult[0].total;
          const response = {
            total,
            alimentos,
          };

          res.json(response);
        }
      );
    }
  );
});

//busqueda por cantidad (cantidad + unidadmedida)
app.get("/alimentos/busqueda/cantidad/:cantidad", (req, res) => {
  const input = req.params.cantidad;
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  // Definir regex para identificar el formato del input
  const regexCantidadUM = /^(\d+(?:\.\d+)?)\s+([a-zA-Z]+)$/;
  const regexCantidad = /^\d+(?:\.\d+)?$/;
  const regexUM = /^[a-zA-Z]+$/;

  let cantidad = "";
  let um_id = "";

  if (regexCantidadUM.test(input)) {
    // Formato: cantidad unidad
    [, cantidad, um_id] = input.match(regexCantidadUM);
  } else if (regexCantidad.test(input)) {
    // Formato: cantidad
    cantidad = input;
  } else if (regexUM.test(input)) {
    // Formato: unidad
    um_id = input;
  } else {
    return res
      .status(400)
      .send(
        "Formato de entrada inválido. Debe ser 'cantidad unidad', 'cantidad' o 'unidad'."
      );
  }

  console.log(
    "Cantidad:",
    cantidad,
    "UM_ID:",
    um_id,
    "Page:",
    page,
    "PageSize:",
    pageSize
  );

  // Construir la consulta SQL y los parámetros dinámicamente
  let sqlQuery =
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_stock > 0";
  let countQuery = "SELECT COUNT(*) AS total FROM Alimento WHERE a_stock > 0";
  let queryParams = [];
  let countParams = [];

  if (cantidad) {
    sqlQuery += " AND a_cantidad LIKE ?";
    countQuery += " AND a_cantidad LIKE ?";
    queryParams.push(`%${cantidad}%`);
    countParams.push(`%${cantidad}%`);
  }

  if (um_id) {
    sqlQuery += " AND um_id LIKE ?";
    countQuery += " AND um_id LIKE ?";
    queryParams.push(`%${um_id}%`);
    countParams.push(`%${um_id}%`);
  }

  sqlQuery += " LIMIT ?, ?";
  queryParams.push(offset, pageSize);

  // Consulta para obtener los datos de los alimentos
  connection.query(sqlQuery, queryParams, (err, alimentos) => {
    if (err) {
      console.error("Error de consulta de alimentos:", err);
      return res.status(500).send("Error de servidor al obtener los alimentos");
    }

    console.log("Alimentos encontrados:", alimentos);

    // Consulta para obtener el conteo total de alimentos
    connection.query(countQuery, countParams, (err, countResult) => {
      if (err) {
        console.error("Error de consulta del conteo total:", err);
        return res
          .status(500)
          .send("Error de servidor al obtener el conteo total");
      }

      console.log("Total de alimentos encontrados:", countResult);

      // Crear un objeto JSON con los datos de los alimentos y el conteo total
      const total = countResult[0].total;
      const response = {
        total,
        alimentos,
      };

      res.json(response);
    });
  });
});

app.get("/alimentos/busqueda/stock/:stock", (req, res) => {
  const { stock } = req.params;
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  // Consulta para obtener los datos de los alimentos
  connection.query(
    "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_stock LIKE ? AND a_stock > 0 LIMIT ?, ?",
    [stock, offset, pageSize],
    (err, alimentos) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }

      // Consulta para obtener el conteo total de alimentos
      connection.query(
        "SELECT COUNT(*) AS total FROM Alimento WHERE a_stock LIKE ? AND a_stock > 0",
        ["%" + stock + "%"],
        (err, countResult) => {
          if (err) {
            console.error("Error de consulta:", err);
            return res.status(500).send("Error de servidor");
          }

          // Crear un objeto JSON con los datos de los alimentos y el conteo total
          const total = countResult[0].total;
          const response = {
            total,
            alimentos,
          };

          res.json(response);
        }
      );
    }
  );
});

app.get("/alimentos/busqueda/caducidad/:caducidad", (req, res) => {
  const { caducidad } = req.params;
  let formattedCaducidad = "";

  // Formatear la entrada del usuario para la consulta SQL
  formattedCaducidad =
    caducidad.trim().toLowerCase() === "sin caducidad" ? null : `${caducidad}%`;

  // Definir el offset
  const page = parseInt(req.query.page) || 1; // Página actual
  const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño de la página
  const offset = (page - 1) * pageSize; // Desplazamiento

  // Consulta SQL para obtener los datos de los alimentos
  let sqlQuery;
  let countQuery;

  if (formattedCaducidad === null) {
    // Si el usuario busca alimentos sin fecha de caducidad
    sqlQuery =
      "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad IS NULL AND a_stock > 0 LIMIT ?, ?";
    countQuery =
      "SELECT COUNT(*) AS total FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad IS NULL AND a_stock > 0";
  } else {
    // Si el usuario busca alimentos con una fecha de caducidad específica
    sqlQuery =
      "SELECT * FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad LIKE ? AND a_stock > 0 LIMIT ?, ?";
    countQuery =
      "SELECT COUNT(*) AS total FROM Alimento LEFT OUTER JOIN Marca ON Alimento.m_id = Marca.m_id NATURAL JOIN UnidadMedida WHERE a_fechaCaducidad LIKE ? AND a_stock > 0";
  }

  // Ejecutar la consulta para obtener los datos de los alimentos
  connection.query(
    sqlQuery,
    formattedCaducidad === null
      ? [offset, pageSize]
      : [formattedCaducidad, offset, pageSize],
    (err, alimentos) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }

      // Ejecutar la consulta para obtener el conteo total de alimentos
      connection.query(
        countQuery,
        formattedCaducidad === null ? [] : [formattedCaducidad],
        (err, countResult) => {
          if (err) {
            console.error("Error de consulta:", err);
            return res.status(500).send("Error de servidor");
          }

          // Crear un objeto JSON con los datos de los alimentos y el conteo total
          const total = countResult[0].total;
          const response = {
            total,
            alimentos,
          };

          res.json(response);
        }
      );
    }
  );
});

//count para busqueda por nombre

//-----------------------------------------------------------------------------------------------------------------------

// Obtener todos los usuarios
app.get("/usuarios", (req, res) => {
  connection.query("SELECT * FROM Usuario", (err, rows) => {
    if (err) {
      console.error("Error de consulta:", err);
      return res.status(500).send("Error de servidor");
    }
    res.json(rows);
  });
});

// Obtener un usuario por ID
app.get("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM Usuario WHERE u_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      if (rows.length === 0) {
        return res.status(404).send("Alimento no encontrado");
      }
      res.json(rows[0]);
    }
  );
});

// Verificar si un correo electrónico existe
app.get("/usuarios/verificar-email/:email", (req, res) => {
  const { email } = req.params;
  connection.query(
    "SELECT 1 FROM Usuario WHERE u_email = ? LIMIT 1",
    [email],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      if (rows.length === 0) {
        return res.status(404).send("Correo no encontrado");
      }
      res.status(200).send("Correo encontrado");
    }
  );
});

// Agregar un nuevo usuario
app.post("/usuarios", (req, res) => {
  const { u_id, u_nombre, u_apellidos, u_email, u_pass } = req.body;

  const hashedContraseña = crypto
    .createHash("sha256")
    .update(u_pass)
    .digest("hex");

  connection.query(
    "INSERT INTO Usuario (u_id, u_nombre, u_apellidos, u_email, u_pass) VALUES (?, ?, ?, ?, ?)",
    [u_id, u_nombre, u_apellidos, u_email, hashedContraseña],
    (err, result) => {
      if (err) {
        console.error("Error al insertar alimento:", err);
        return res.status(500).send("Error de servidor");
      }
      res.status(201).send("Alimento agregado correctamente");
    }
  );
});
// Actualizar un usuario por ID
app.put("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  const { u_nombre, u_apellidos, u_email } = req.body;

  // Comprueba si se proporcionó un ID válido en el cuerpo de la solicitud
  if (!id) {
    return res
      .status(400)
      .send("Se requiere un ID de usuario válido en el cuerpo de la solicitud");
  }

  // Ejecuta la consulta para actualizar el usuario
  connection.query(
    "UPDATE Usuario SET u_id = ?, u_nombre = ?, u_apellidos = ?, u_email = ? WHERE u_id = ?",
    [id, u_nombre, u_apellidos, u_email, id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar usuario:", err);
        return res.status(500).send("Error de servidor");
      }
      // Comprueba si se actualizó correctamente el usuario
      if (result.affectedRows === 0) {
        return res.status(404).send("Usuario no encontrado");
      }
      res.status(200).send("Usuario actualizado correctamente");
    }
  );
});

// Cambiar la contraseña de un usuario por email
app.put("/usuarios/:email/pass", (req, res) => {
  const { email } = req.params;
  const { nueva_contraseña } = req.body;

  // Verificar si se proporcionó una nueva contraseña válida en el cuerpo de la solicitud
  if (!nueva_contraseña) {
    return res
      .status(400)
      .send(
        "Se requiere una nueva contraseña válida en el cuerpo de la solicitud"
      );
  }

  // Encriptar la nueva contraseña usando SHA-256
  const hashedNuevaContraseña = crypto
    .createHash("sha256")
    .update(nueva_contraseña)
    .digest("hex");

  // Ejecutar la consulta para actualizar la contraseña del usuario
  connection.query(
    "UPDATE Usuario SET u_pass = ? WHERE u_email = ?",
    [hashedNuevaContraseña, email],
    (err, result) => {
      if (err) {
        console.error("Error al cambiar la contraseña del usuario:", err);
        return res.status(500).send("Error de servidor");
      }
      // Comprobar si se actualizó correctamente la contraseña del usuario
      if (result.affectedRows === 0) {
        return res.status(404).send("Usuario no encontrado");
      }
      res.status(200).send("Contraseña cambiada correctamente");
    }
  );
});

// Eliminar un usuario por ID
app.delete("/usuarios/:id", (req, res) => {
  const { id } = req.params;

  // Ejecuta la consulta para eliminar el usuario
  connection.query(
    "DELETE FROM Usuario WHERE u_id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Error al eliminar usuario:", err);
        return res.status(500).send("Error de servidor");
      }
      // Comprueba si se eliminó correctamente el usuario
      if (result.affectedRows === 0) {
        return res.status(404).send("Usuario no encontrado");
      }
      res.status(200).send("Usuario eliminado correctamente");
    }
  );
});

//-----------------------------------------------------------------------------------------------------------------------------------

// Obtener todas las marcas
app.get("/marcas", (req, res) => {
  connection.query("SELECT * FROM Marca", (err, rows) => {
    if (err) {
      console.error("Error al obtener las marcas:", err);
      return res.status(500).send("Error de servidor");
    }
    res.json(rows);
  });
});

// Obtener una marca por ID
app.get("/marcas/:id", (req, res) => {
  const { id } = req.params;
  connection.query("SELECT * FROM Marca WHERE m_id = ?", [id], (err, rows) => {
    if (err) {
      console.error("Error al obtener la marca:", err);
      return res.status(500).send("Error de servidor");
    }
    if (rows.length === 0) {
      return res.status(404).send("Marca no encontrada");
    }
    res.json(rows[0]);
  });
});

//busqueda por nombre general, sin paginacion, para autocompletar

app.get("/marcas/busqueda/nombre/total/:nombre", (req, res) => {
  const { nombre } = req.params;
  connection.query(
    "SELECT * FROM Marca WHERE m_nombre LIKE ?",
    ["%" + nombre + "%"],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// Agregar una nueva marca
app.post("/marcas", (req, res) => {
  const { m_nombre } = req.body;
  connection.query(
    "INSERT INTO Marca (m_nombre) VALUES (?)",
    [m_nombre],
    (err, result) => {
      if (err) {
        console.error("Error al agregar la marca:", err);
        return res.status(500).send("Error de servidor");
      }
      res.status(201).send("Marca agregada correctamente");
    }
  );
});

// Actualizar una marca por ID
app.put("/marcas/:id", (req, res) => {
  const { id } = req.params;
  const { m_nombre } = req.body;
  connection.query(
    "UPDATE Marca SET m_nombre = ? WHERE m_id = ?",
    [m_nombre, id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar la marca:", err);
        return res.status(500).send("Error de servidor");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("Marca no encontrada");
      }
      res.status(200).send("Marca actualizada correctamente");
    }
  );
});

// Eliminar una marca por ID
app.delete("/marcas/:id", (req, res) => {
  const { id } = req.params;
  connection.query("DELETE FROM Marca WHERE m_id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar la marca:", err);
      return res.status(500).send("Error de servidor");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Marca no encontrada");
    }
    res.status(200).send("Marca eliminada correctamente");
  });
});

//-----------------------------------------------------------------------------------------------------------------------------------

// Obtener todas las unidades de medida
app.get("/unidades-medida", (req, res) => {
  connection.query("SELECT * FROM UnidadMedida", (err, rows) => {
    if (err) {
      console.error("Error al obtener las unidades de medida:", err);
      return res.status(500).send("Error de servidor");
    }
    res.json(rows);
  });
});

// Obtener una unidad de medida por ID
app.get("/unidades-medida/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM UnidadMedida WHERE um_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("Error al obtener la unidad de medida:", err);
        return res.status(500).send("Error de servidor");
      }
      if (rows.length === 0) {
        return res.status(404).send("Unidad de medida no encontrada");
      }
      res.json(rows[0]);
    }
  );
});

// Agregar una nueva unidad de medida
app.post("/unidades-medida", (req, res) => {
  const { um_id, um_nombre } = req.body;
  connection.query(
    "INSERT INTO UnidadMedida (um_id, um_nombre) VALUES (?, ?)",
    [um_id, um_nombre],
    (err, result) => {
      if (err) {
        console.error("Error al agregar la unidad de medida:", err);
        return res.status(500).send("Error de servidor");
      }
      res.status(201).send("Unidad de medida agregada correctamente");
    }
  );
});

// Actualizar una unidad de medida por ID
app.put("/unidades-medida/:id", (req, res) => {
  const { id } = req.params;
  const { um_nombre } = req.body;
  connection.query(
    "UPDATE UnidadMedida SET um_nombre = ? WHERE um_id = ?",
    [um_nombre, id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar la unidad de medida:", err);
        return res.status(500).send("Error de servidor");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("Unidad de medida no encontrada");
      }
      res.status(200).send("Unidad de medida actualizada correctamente");
    }
  );
});

// Eliminar una unidad de medida por ID
app.delete("/unidades-medida/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "DELETE FROM UnidadMedida WHERE um_id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Error al eliminar la unidad de medida:", err);
        return res.status(500).send("Error de servidor");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("Unidad de medida no encontrada");
      }
      res.status(200).send("Unidad de medida eliminada correctamente");
    }
  );
});

//-----------------------------------------------------------------------------------------------------------------------------------

// Obtener todos los registros de UsuarioAlimento
app.get("/usuario-alimento", (req, res) => {
  connection.query("SELECT * FROM UsuarioAlimento", (err, rows) => {
    if (err) {
      console.error("Error al obtener los registros de UsuarioAlimento:", err);
      return res.status(500).send("Error de servidor");
    }
    res.json(rows);
  });
});

//Obtener todos los registros de UsuarioAlimento unido con tabla Usuario y Alimento
app.get("/usuario-alimento/join/all", (req, res) => {
  connection.query(
    "SELECT * FROM UsuarioAlimento NATURAL JOIN Usuario NATURAL JOIN Alimento",
    (err, rows) => {
      if (err) {
        console.error(
          "Error al obtener los registros de UsuarioAlimento unido con tabla Usuario y Alimento:",
          err
        );
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

//Obtener todos los registros de UsuarioAlimento unido con tabla Usuario y Alimento por ID de usuario
app.get("/usuario-alimento/join/all/usuario/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM UsuarioAlimento NATURAL JOIN Usuario NATURAL JOIN Alimento LEFT OUTER JOIN Marca ON Marca.m_id = Alimento.m_id WHERE u_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error(
          "Error al obtener los registros de UsuarioAlimento unido con tabla Usuario y Alimento por ID de usuario:",
          err
        );
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

//Obtener todos los registros de UsuarioAlimento unido con tabla Usuario y Alimento por ID de alimento
app.get("/usuario-alimento/join/all/alimento/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM UsuarioAlimento NATURAL JOIN Usuario NATURAL JOIN Alimento WHERE a_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error(
          "Error al obtener los registros de UsuarioAlimento unido con tabla Usuario y Alimento por ID de alimento:",
          err
        );
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// Obtener registros de UsuarioAlimento join alimento, incluyendo a_id = null

app.get("/usuario-alimento/alimento/null", (req, res) => {
  connection.query(
    "SELECT * FROM UsuarioAlimento as ua LEFT OUTER JOIN Alimento as a ON ua.a_id = a.a_id",
    (err, rows) => {
      if (err) {
        console.error(
          "Error al obtener los registros de UsuarioAlimento a_id = null:",
          err
        );
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// Obtener registros de UsuarioAlimento join usuario, incluyendo u_id = null

app.get("/usuario-alimento/usuario/null", (req, res) => {
  connection.query(
    "SELECT * FROM UsuarioAlimento as ua LEFT OUTER JOIN Usuario as u ON ua.u_id = u.u_id",
    (err, rows) => {
      if (err) {
        console.error(
          "Error al obtener los registros de UsuarioAlimento u_id = null:",
          err
        );
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// Obtener los registros de UsuarioAlimento por ID de usuario
app.get("/usuario-alimento/usuario/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM UsuarioAlimento WHERE u_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error(
          "Error al obtener los registros de UsuarioAlimento por ID de usuario:",
          err
        );
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// Obtener los registros de UsuarioAlimento por ID de alimento
app.get("/usuario-alimento/alimento/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM UsuarioAlimento WHERE a_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error(
          "Error al obtener los registros de UsuarioAlimento por ID de alimento:",
          err
        );
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
});

// Agregar un nuevo registro a UsuarioAlimento
app.post("/usuario-alimento", (req, res) => {
  const { u_id, a_id, ua_cantidad, ua_accion } = req.body;
  connection.query(
    "INSERT INTO UsuarioAlimento (u_id, a_id, ua_cantidad, ua_accion, ua_fecha) VALUES (?, ?, ?, ?, NOW())",
    [u_id, a_id, ua_cantidad, ua_accion],
    (err, result) => {
      if (err) {
        console.error(
          "Error al agregar un nuevo registro a UsuarioAlimento:",
          err
        );
        return res.status(500).send("Error de servidor");
      }
      res
        .status(201)
        .send("Nuevo registro agregado correctamente a UsuarioAlimento");
    }
  );
});

// Eliminar un registro de UsuarioAlimento por ID
app.delete("/usuario-alimento/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "DELETE FROM UsuarioAlimento WHERE ua_id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Error al eliminar un registro de UsuarioAlimento:", err);
        return res.status(500).send("Error de servidor");
      }
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .send("Registro de UsuarioAlimento no encontrado");
      }
      res
        .status(200)
        .send("Registro de UsuarioAlimento eliminado correctamente");
    }
  );
});

//-----------------------------------------------------------------------------------------------------------------------------------
// FUNCTION contarRegistrosUsuario(usuario_id VARCHAR(20))

app.get("/usuarios/registro/:id", (req, res) => {
  const { id } = req.params;
  connection.query("SELECT contarRegistrosUsuario(?)", [id], (err, rows) => {
    if (err) {
      console.error("Error de consulta:", err);
      return res.status(500).send("Error de servidor");
    }
    res.json(rows[0]);
  });
});

// PROCEDURE stockAlimentos (IN alimento_id INT, IN usuario_id VARCHAR(20), IN actionType INT, IN quantity INT)
// Actions: Add Reduce Update = 0 1 2
app.post("/usuarios/stock", (req, res) => {
  const { a_id, u_id, actionType, quantity } = req.body;
  connection.query(
    "CALL stockAlimentos(?, ?, ?, ?)",
    [a_id, u_id, actionType, quantity],
    (err, rows) => {
      if (err) {
        console.error("Error al ejecutar el procedimiento:", err);
        return res.status(500).send("Error de servidor");
      }
      res.status(200).send("Procedimiento ejecutado correctamente");
    }
  );
  console.log(
    "a_id: ",
    a_id,
    "u_id: ",
    u_id,
    "actionType: ",
    actionType,
    "quantity: ",
    quantity
  );
});

app.get("/usuarios/:id/transacciones", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM Transacciones WHERE usuario_id = ? ORDER BY fecha DESC",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error al obtener transacciones:", err);
        return res.status(500).send("Error del servidor");
      }
      res.json(results);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor Express en funcionamiento en el puerto ${PORT}`);
});
