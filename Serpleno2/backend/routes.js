// routes.js
import express from "express";
const router = express.Router();

/* ================================
   IMPORTS
================================ */

// AUTH
import {
  loginController,
  registerController,
  resetController,
  validateStudentController,
  updateSessionPlan
} from "./controllers.js";

import { authRequired } from "./authMiddleware.js";
import {
  requireProfesional,
  requireAdmin,
  requireAdminOrPro,
  redirectByRoleHome
} from "./guard.js";

// USER / CONTENT
import {
  homeController,
  portalController,
  contentController,
  proContentController,
  notificationsController
} from "./controllers.js";

// PLANS
import {
  plansController,
  planDetailController
} from "./controllers.js";

// PAYMENTS
import {
  payController,
  payResultController
} from "./controllers.js";

// SCHEDULE (CLIENT)
import {
  scheduleTypesController,
  scheduleProfessionalsController,
  scheduleSlotsController,
  scheduleBookController
} from "./controllers.js";

// PROFESSIONAL SECTION
import {
  proDashboardController,
  proUploadController,
  proUploadListController,
  proUploadDeleteController,
  proUploadUpdateController,
  proNotificationsController,
  proNotificationMarkRead,
  proNotificationMarkUnread,
  proCalendarController,
  proCalendarAddSlot,
  proCalendarDeleteSlot,
  proCalendarUpdateSlot
} from "./controllers.js";

// ADMIN
import {
  adminDashboardController,
  adminUsersListController,
  adminUserUpdateRoleController,
  adminUserDeleteController,
  adminContentListController,
  adminContentCreateController,
  adminContentDeleteController,
  adminContentUpdateController,
  adminStatsController
} from "./controllers.js";

// MEETING
import { meetingController } from "./controllers.js";

// Uploads
import multer from "multer";
const upload = multer();

/* ================================
   AUTH (PUBLIC)
================================ */

router.post("/auth/login", loginController);
router.post("/auth/register", registerController);
router.post("/auth/reset", resetController);

// Validación de estudiante
router.post("/validate-student", authRequired, validateStudentController);

// Actualizar plan
router.post("/update-plan", authRequired, async (req, res) => {
  const { plan } = req.body;
  const token = await updateSessionPlan(req, plan);
  res.json({ ok: true, token });
});

// Redirección según rol
router.get("/redirect-home", authRequired, redirectByRoleHome);

/* ================================
   USER
================================ */

router.get("/home", authRequired, homeController);
router.get("/portal", authRequired, portalController);
router.get("/content", authRequired, contentController);
router.get("/notifications", authRequired, notificationsController);

/* ================================
   PLANS
================================ */

router.get("/plans", plansController);
router.get("/plan/detail", planDetailController);

/* ================================
   PAYMENTS
================================ */

router.get("/pay", authRequired, payController);
router.get("/pay/result", authRequired, payResultController);

/* ================================
   SCHEDULE (CLIENT)
================================ */

router.get("/schedule/types", authRequired, scheduleTypesController);
router.get("/schedule/professionals", authRequired, scheduleProfessionalsController);
router.get("/schedule/slots", authRequired, scheduleSlotsController);
router.post("/schedule/book", authRequired, scheduleBookController);

/* ================================
   PROFESSIONAL
================================ */

// Dashboard profesional
router.get("/pro/dashboard", authRequired, requireProfesional, proDashboardController);

/* ---- CONTENIDO PROFESIONAL (CRUD COMPLETO) ---- */

// Crear contenido
router.post(
  "/pro/upload",
  authRequired,
  requireProfesional,
  upload.array("files"),
  proUploadController
);

// Listar contenido
router.get("/pro/upload/list", authRequired, requireProfesional, proUploadListController);

// Actualizar contenido
router.put(
  "/pro/upload/:id",
  authRequired,
  requireProfesional,
  upload.single("file"),
  proUploadUpdateController
);

// Eliminar contenido
router.delete(
  "/pro/upload/:id",
  authRequired,
  requireProfesional,
  proUploadDeleteController
);

// Contenido visible
router.get("/pro/content", authRequired, requireProfesional, proContentController);

/* ---- NOTIFICACIONES PROFESIONAL ---- */

router.get("/pro/notifications", authRequired, requireProfesional, proNotificationsController);
router.post("/pro/notifications/:id/read", authRequired, requireProfesional, proNotificationMarkRead);
router.post("/pro/notifications/:id/unread", authRequired, requireProfesional, proNotificationMarkUnread);

/* ---- CALENDARIO PROFESIONAL (CRUD COMPLETO) ---- */

router.get("/pro/calendar", authRequired, requireProfesional, proCalendarController);

// Crear slot
router.post("/pro/calendar/slot", authRequired, requireProfesional, proCalendarAddSlot);

// Actualizar slot
router.put("/pro/calendar/slot/:id", authRequired, requireProfesional, proCalendarUpdateSlot);

// Eliminar slot
router.delete("/pro/calendar/slot/:id", authRequired, requireProfesional, proCalendarDeleteSlot);

/* ================================
   ADMIN
================================ */

router.get("/admin/dashboard", authRequired, requireAdmin, adminDashboardController);

/* ---- CRUD USUARIOS ---- */
router.get("/admin/users", authRequired, requireAdmin, adminUsersListController);
router.post("/admin/users/update-role", authRequired, requireAdmin, adminUserUpdateRoleController);
router.delete("/admin/users/:id", authRequired, requireAdmin, adminUserDeleteController);

/* ---- CRUD CONTENIDO GENERAL ---- */
router.get("/admin/content", authRequired, requireAdminOrPro, adminContentListController);
router.post("/admin/content", authRequired, requireAdminOrPro, upload.single("file"), adminContentCreateController);
router.put("/admin/content/:id", authRequired, requireAdminOrPro, upload.single("file"), adminContentUpdateController);
router.delete("/admin/content/:id", authRequired, requireAdminOrPro, adminContentDeleteController);

/* ---- STATS ---- */
router.get("/admin/stats", authRequired, requireAdmin, adminStatsController);

/* ================================
   MEETING
================================ */

router.get("/meeting", authRequired, meetingController);

/* ================================
   EXPORT
================================ */

export default router;







