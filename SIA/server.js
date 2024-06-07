import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import { connection } from "./db.js";
import crypto from "crypto";

const app = express();

// Middleware para permitir solicitudes desde localhost:5173
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// Middleware para analizar el cuerpo de las solicitudes como JSON
app.use(bodyParser.json());

app.get("/", (req, res) => {
  connection.query("SELECT * FROM Alimento", (err, rows) => {
    if (err) {
      console.error("Error de consulta:", err);
      return res.status(500).send("Error de servidor");
    }
    res.json(rows);
  });
});

app.use(
  session({
    secret: "12345",
    resave: false,
    saveUninitialized: true,
  })
);

app.post("/login", (req, res) => {
  const { id, password } = req.body;

  // Verificar el usuario en la base de datos
  connection.query(
    "SELECT * FROM Usuario WHERE u_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      if (rows.length === 0) {
        return res.status(401).send("Usuario incorrecto");
      }

      const userData = rows[0];
      const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

      if (userData.u_pass === hashedPassword) {
        // Establecer la sesión del usuario
        req.session.userId = userData.u_id;
        res.sendStatus(200);
      } else {
        res.status(401).send("Contraseña incorrecta");
      }
    }
  );
});

// Guardar informacion en la sesion
app.post("/saveMessage", (req, res) => {
  const { message } = req.body;
  req.session.message = message;
  const message2 = req.session.message;
  console.log("Mensaje obtenido de la sesión:", message2);
  res.sendStatus(200);
});

// Obtener informacion de la sesion
app.get("/getMessage", (req, res) => {
  const message = req.session.message || "";
  console.log("Mensaje obtenido de la sesión:", message);
  res.send(message);
});

//-------------------------------------------------------------------------------------------------------
// PRUEBAAAAAAAAAAAAAAAAA
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
    "SELECT a1.a_id, a1.a_fechaCaducidad, a1.a_stock FROM Alimento a1 INNER JOIN ( SELECT a_nombre, a_cantidad, um_id FROM Alimento WHERE a_id = ?) a2 ON a1.a_nombre = a2.a_nombre AND a1.a_cantidad = a2.a_cantidad AND a1.um_id = a2.um_id",
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
  const ids = req.query.ids;

  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).send("No se proporcionaron IDs válidos");
  }

  const placeholders = ids.map((_, i) => "?").join(",");
  connection.query(
    `SELECT * FROM Alimento WHERE a_id IN (${placeholders})`,
    ids,
    (err, rows) => {
      if (err) {
        console.error("Error de consulta:", err);
        return res.status(500).send("Error de servidor");
      }
      res.json(rows);
    }
  );
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
  } = req.body;
  if (m_id === 0) {
    connection.query(
      "INSERT INTO Alimento (a_nombre, a_cantidad, a_stock, a_fechaSalida, a_fechaEntrada, a_fechaCaducidad, um_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        a_nombre,
        a_cantidad,
        a_stock,
        a_fechaSalida,
        a_fechaEntrada,
        a_fechaCaducidad,
        um_id,
      ],
      (err, result) => {
        if (err) {
          console.error("Error al insertar alimento:", err);
          return res.status(500).send("Error de servidor");
        }
        res.status(201).send("Alimento agregado correctamente");
      }
    );
  } else {
    connection.query(
      "INSERT INTO Alimento (a_nombre, a_cantidad, a_stock, a_fechaSalida, a_fechaEntrada, a_fechaCaducidad, um_id, m_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        a_nombre,
        a_cantidad,
        a_stock,
        a_fechaSalida,
        a_fechaEntrada,
        a_fechaCaducidad,
        um_id,
        m_id,
      ],
      (err, result) => {
        if (err) {
          console.error("Error al insertar alimento:", err);
          return res.status(500).send("Error de servidor");
        }
        res.status(201).send("Alimento agregado correctamente");
      }
    );
  }
});

// Actualizar un alimento por ID
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
  const { u_id, u_nombre, u_apellidos, u_email } = req.body;

  // Comprueba si se proporcionó un ID válido en el cuerpo de la solicitud
  if (!u_id) {
    return res
      .status(400)
      .send("Se requiere un ID de usuario válido en el cuerpo de la solicitud");
  }

  // Ejecuta la consulta para actualizar el usuario
  connection.query(
    "UPDATE Usuario SET u_id = ?, u_nombre = ?, u_apellidos = ?, u_email = ? WHERE u_id = ?",
    [u_id, u_nombre, u_apellidos, u_email, id],
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

// Cambiar la contraseña de un usuario por ID
app.put("/usuarios/:id/contraseña", (req, res) => {
  const { id } = req.params;
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
    "UPDATE Usuario SET u_pass = ? WHERE u_id = ?",
    [hashedNuevaContraseña, id],
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
    "SELECT * FROM UsuarioAlimento NATURAL JOIN Usuario NATURAL JOIN Alimento WHERE u_id = ?",
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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Express en funcionamiento en el puerto ${PORT}`);
});
