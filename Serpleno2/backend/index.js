import express from "express";
import cors from "cors";
import path from "path";
import router from "./routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// servir frontend (HTML, CSS, JS)
app.use(express.static(path.join(process.cwd(), "public")));

// API backend
app.use("/", router);

// ruta raíz → mostrar splash.html (igual que index.php=r splash)
app.get("/", (req, res) => {
  return res.sendFile(path.join(process.cwd(), "public", "splash.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor listo en puerto", PORT));
