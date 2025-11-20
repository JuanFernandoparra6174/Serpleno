import express from "express";
import cors from "cors";
import path from "path";
import router from "./routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Servir frontend estático
app.use(express.static(path.join(process.cwd(), "public")));

// Backend API
app.use("/", router);

// Ruta raíz → splash
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "splash.html"));
});

// Fallback para cualquier ruta no encontrada → frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Servidor en puerto", PORT));
