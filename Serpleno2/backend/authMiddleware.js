// authMiddleware.js
// ============================================
// Middleware para verificar JWT y requerir login
// ============================================

import { extractToken, verifySession } from "./auth.js";

/* ============================================================
   authRequired
   → Requiere un token válido para acceder a la ruta
============================================================= */
export function authRequired(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: "No autenticado",
        redirect: "/login"
      });
    }

    const decoded = verifySession(token);

    if (!decoded) {
      return res.status(401).json({
        ok: false,
        error: "Token inválido o expirado",
        redirect: "/login"
      });
    }

    req.user = decoded;
    next();

  } catch (error) {
    console.error("❌ authRequired error:", error);
    return res.status(401).json({
      ok: false,
      error: "Sesión inválida",
      redirect: "/login"
    });
  }
}

/* ============================================================
   optionalAuth
   → No obliga login. Si hay token, asigna req.user.
============================================================= */
export function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = verifySession(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    next();
  } catch (_) {
    req.user = null;
    next();
  }
}

