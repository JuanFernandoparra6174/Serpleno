// guard.js
// ============================================
// Middlewares para control de roles
// admin / profesional / cliente
// ============================================

/* ============================================================
   requireAdmin
   → Solo permite accesos con rol admin
============================================================= */
export function requireAdmin(req, res, next) {
  const user = req.user;

  if (!user || user.role !== "admin") {
    return res.status(403).json({
      ok: false,
      error: "Acceso denegado. Solo administradores."
    });
  }

  next();
}

/* ============================================================
   requireProfesional
   → Solo profesionales pueden acceder
============================================================= */
export function requireProfesional(req, res, next) {
  const user = req.user;

  if (!user || user.role !== "profesional") {
    return res.status(403).json({
      ok: false,
      error: "Acceso denegado. Solo profesionales."
    });
  }

  next();
}

/* ============================================================
   requireCliente
   → Aunque pocos módulos lo usan, lo dejamos listo
============================================================= */
export function requireCliente(req, res, next) {
  const user = req.user;

  if (!user || user.role !== "cliente") {
    return res.status(403).json({
      ok: false,
      error: "Acceso denegado. Solo clientes."
    });
  }

  next();
}

/* ============================================================
   requireAdminOrPro
   → Para módulos donde admin y profesional tienen permisos
============================================================= */
export function requireAdminOrPro(req, res, next) {
  const user = req.user;

  if (!user || !["admin", "profesional"].includes(user.role)) {
    return res.status(403).json({
      ok: false,
      error: "Acceso denegado. Solo admin o profesional."
    });
  }

  next();
}

/* ============================================================
   redirectByRoleHome
   → Replica la lógica del PHP original:
       - admin → /admin/dashboard
       - profesional → /pro/dashboard
       - cliente → /home
============================================================= */
export function redirectByRoleHome(req, res) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      ok: false,
      redirect: "/login",
      error: "No autenticado"
    });
  }

  let redirect = "/home";

  if (user.role === "admin") redirect = "/admin/dashboard";
  if (user.role === "profesional") redirect = "/pro/dashboard";

  return res.json({
    ok: true,
    redirect
  });
}
