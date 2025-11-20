// auth.js
// ============================================
// Manejo de sesiones JWT + helpers de usuario
// ============================================

import jwt from "jsonwebtoken";
import { supabase } from "./supabase.js";
import { dbUpdate } from "./db.js";

const SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY_12345";

/* ============================================================
   createSession(payload)
   → Crea un token JWT con los datos del usuario
============================================================= */
export function createSession(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

/* ============================================================
   verifySession(token)
   → Verifica el token, retorna datos del usuario o null
============================================================= */
export function verifySession(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (_) {
    return null;
  }
}

/* ============================================================
   loginUser(email, password_hash check)
   → NO se usa aquí porque login lo maneja loginController
============================================================= */
// (Se mantiene vacío porque ya migraste login completo a controllers.js)

/* ============================================================
   updateSessionPlan(req, newPlan)
   → Actualiza el plan del usuario y devuelve nuevo token
============================================================= */
export async function updateSessionPlan(req, newPlan) {
  const user = req.user;
  if (!user) return null;

  // Guardar en Supabase
  await dbUpdate("users", { id: user.id }, { plan: newPlan });

  // Crear nuevo token actualizado
  return createSession({
    ...user,
    plan: newPlan,
  });
}

/* ============================================================
   extractToken(req)
   → Obtiene token desde headers o localStorage del cliente
============================================================= */
export function extractToken(req) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "").trim();
  }

  // token enviado directamente en body (fallback)
  if (req.body?.token) return req.body.token;

  return null;
}

/* ============================================================
   attachUserToRequest(req)
   → Analiza token y coloca req.user
============================================================= */
export function attachUserToRequest(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifySession(token);
    req.user = decoded || null;

    next();
  } catch (e) {
    req.user = null;
    next();
  }
}

/* ============================================================
   currentUser(req)
   → Helper para obtener usuario actual
============================================================= */
export function currentUser(req) {
  return req.user || null;
}
