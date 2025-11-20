// controllers.js
import bcrypt from "bcrypt";
import { supabase } from "./supabase.js";
import { createSession } from "./auth.js";
import { dbOne, dbInsert, dbUpdate } from "./db.js";

/* =======================================================
   LOGIN
======================================================= */
export async function loginController(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ ok: false, error: "Email y contraseña requeridos" });

    let user = null;
    try { user = await dbOne("users", { email }); }
    catch { user = null; }

    if (!user)
      return res.status(401).json({ ok: false, error: "Email o contraseña incorrectos" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ ok: false, error: "Email o contraseña incorrectos" });

    const token = createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan
    });

    let redirect = "/home";
    if (user.role === "admin") redirect = "/admin/dashboard";
    if (user.role === "profesional") redirect = "/pro/dashboard";

    return res.json({
      ok: true,
      token,
      redirect,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ ok: false, error: "Error interno" });
  }
}

/* =======================================================
   REGISTER
======================================================= */
export async function registerController(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ ok: false, error: "Todos los campos son obligatorios." });

    let exists = null;
    try { exists = await dbOne("users", { email }); }
    catch { exists = null; }

    if (exists)
      return res.status(400).json({ ok: false, error: "Este email ya está registrado." });

    const hash = await bcrypt.hash(password, 10);

    const newUser = await dbInsert("users", {
      name,
      email,
      password_hash: hash,
      role: "cliente",
      plan: "gratuito",
    });

    return res.json({
      ok: true,
      message: "Registro exitoso.",
      user: {
        id: newUser.id,
        name,
        email,
        role: "cliente",
        plan: "gratuito"
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ ok: false, error: "No se pudo registrar" });
  }
}

/* =======================================================
   VALIDAR ESTUDIANTE
======================================================= */
function isInstitutionalEmail(email) {
  return /@[\w.-]+\.(edu(\.[a-z]{2})?)$/i.test(email);
}

export async function validateStudentController(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ ok: false, redirect: "/login" });

    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ ok: false, error: "Email y código requeridos" });

    if (!isInstitutionalEmail(email))
      return res.status(400).json({ ok: false, error: "Correo no institucional" });

    await dbUpdate("users", { id: user.id }, { plan: "estudiantil" });

    const newToken = createSession({ ...user, plan: "estudiantil" });

    return res.json({
      ok: true,
      redirect: "/pay?plan=estudiantil",
      token: newToken
    });

  } catch (err) {
    return res.status(500).json({ ok: false, error: "Error validando estudiante" });
  }
}

/* =======================================================
   HOME
======================================================= */
export async function homeController(req, res) {
  try {
    const user = req.user;
    return res.json({
      ok: true,
      user,
      slides: ["slide1.png", "slide2.png", "slide3.png", "slide4.png"]
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Error al cargar home" });
  }
}

/* =======================================================
   PORTAL
======================================================= */
export async function portalController(req, res) {
  const user = req.user;
  const plan = user.plan;

  if (!["estudiantil", "premium"].includes(plan))
    return res.status(403).json({
      ok: false,
      restricted: true,
      redirect: "/plans"
    });

  return res.json({
    ok: true,
    user,
    dashboard: {
      schedule: true,
      notifications: true,
      content: true,
      payments: true
    }
  });
}

/* =======================================================
   CONTENT CLIENTE
======================================================= */
export async function contentController(req, res) {
  try {
    const plan = req.user.plan.toLowerCase();
    let query = supabase
      .from("contents")
      .select("*")
      .order("category")
      .order("day");

    if (plan === "gratuito") query = query.eq("is_free", true);

    const { data, error } = await query;
    if (error) throw error;

    return res.json({ ok: true, content: data });

  } catch (err) {
    return res.status(500).json({ ok: false, error: "Error cargando contenido" });
  }
}

/* =======================================================
   CONTENT PROFESIONAL
======================================================= */
export async function proContentController(req, res) {
  try {
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .eq("created_by", req.user.id);

    if (error) throw error;
    return res.json({ ok: true, content: data });

  } catch (err) {
    return res.status(500).json({ ok: false, error: "No se pudo cargar contenido pro" });
  }
}

/* =======================================================
   SUBIR CONTENIDO PROFESIONAL
======================================================= */
export async function proUploadController(req, res) {
  try {
    const user = req.user;
    const { title, category } = req.body;

    if (!req.files?.length)
      return res.json({ ok: false, error: "Debe subir archivos" });

    const allowed = ["video/mp4", "image/jpeg", "image/png", "image/webp", "application/pdf"];
    let uploaded = [];

    for (const file of req.files) {
      if (!allowed.includes(file.mimetype))
        return res.json({ ok: false, error: "Tipo de archivo no permitido" });

      const filename = Date.now() + "_" + file.originalname;
      const { error: uploadErr } = await supabase.storage
        .from("uploads")
        .upload(filename, file.buffer, { contentType: file.mimetype });

      if (uploadErr) continue;

      const url = supabase.storage.from("uploads").getPublicUrl(filename).data.publicUrl;

      const record = await dbInsert("pro_uploads", {
        pro_id: user.id,
        title,
        category,
        filepath: url,
        mime: file.mimetype
      });

      uploaded.push(record);
    }

    return res.json({ ok: true, items: uploaded });

  } catch (err) {
    return res.status(500).json({ ok: false, error: "No se pudo subir contenido" });
  }
}

/* =======================================================
   DASHBOARD PROFESIONAL
======================================================= */
export function proDashboardController(req, res) {
  return res.json({
    ok: true,
    user: req.user,
    tools: {
      calendar: true,
      upload: true,
      content: true,
      notifications: true,
      clients: true
    }
  });
}

/* =======================================================
   NOTIFICACIONES PROFESIONAL
======================================================= */
export async function proNotificationsController(req, res) {
  try {
    const unread = req.query.filter === "unread";

    let query = supabase
      .from("pro_notifications")
      .select("*")
      .eq("pro_id", req.user.id)
      .order("created_at", { ascending: false });

    if (unread) query = query.eq("is_read", false);

    const { data, error } = await query;
    if (error) throw error;

    return res.json({ ok: true, notifications: data });

  } catch (err) {
    return res.status(500).json({ ok: false, error: "Error cargando notificaciones" });
  }
}

export async function proNotificationMarkRead(req, res) {
  await supabase
    .from("pro_notifications")
    .update({ is_read: true })
    .eq("id", req.params.id)
    .eq("pro_id", req.user.id);

  return res.json({ ok: true });
}

export async function proNotificationMarkUnread(req, res) {
  await supabase
    .from("pro_notifications")
    .update({ is_read: false })
    .eq("id", req.params.id)
    .eq("pro_id", req.user.id);

  return res.json({ ok: true });
}

/* =======================================================
   CALENDARIO PROFESIONAL
======================================================= */
export async function proCalendarController(req, res) {
  try {
    const { month, year } = req.query;

    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const to   = `${year}-${String(month).padStart(2, "0")}-31`;

    const slots = await supabase
      .from("pro_calendar_slots")
      .select("*")
      .eq("pro_id", req.user.id)
      .gte("date", from)
      .lte("date", to);

    const reservations = await supabase
      .from("appointments")
      .select("*")
      .eq("pro_id", req.user.id);

    return res.json({
      ok: true,
      slots: slots.data,
      reservations: reservations.data
    });

  } catch (err) {
    return res.status(500).json({ ok: false, error: "Error cargando calendario" });
  }
}

export async function proCalendarAddSlot(req, res) {
  const { date, hour } = req.body;
  const { data, error } = await supabase
    .from("pro_calendar_slots")
    .insert({
      pro_id: req.user.id,
      date,
      hour,
      status: "free"
    })
    .select("*")
    .single();

  if (error) return res.json({ ok: false });
  return res.json({ ok: true, slot: data });
}

export async function proCalendarDeleteSlot(req, res) {
  const { id } = req.params;

  await supabase
    .from("pro_calendar_slots")
    .delete()
    .eq("id", id)
    .eq("pro_id", req.user.id);

  return res.json({ ok: true });
}

/* =======================================================
   SCHEDULE (CLIENTES)
======================================================= */
export async function scheduleTypesController(req, res) {
  const { data } = await supabase
    .from("users")
    .select("role_profesional")
    .eq("role", "profesional");

  const types = [...new Set(data.map(x => x.role_profesional))];
  return res.json({ ok: true, types });
}

export async function scheduleProfessionalsController(req, res) {
  const { type } = req.query;
  const { data } = await supabase
    .from("users")
    .select("id, name, role_profesional")
    .eq("role", "profesional")
    .eq("role_profesional", type);

  return res.json({ ok: true, professionals: data });
}

export async function scheduleSlotsController(req, res) {
  const { pro_id, date } = req.query;

  const { data } = await supabase
    .from("pro_calendar_slots")
    .select("*")
    .eq("pro_id", pro_id)
    .eq("date", date)
    .eq("status", "free");

  return res.json({ ok: true, slots: data });
}

export async function scheduleBookController(req, res) {
  const user = req.user;
  const allowed = ["premium", "silver", "estudiantil"];
  if (!allowed.includes(user.plan))
    return res.json({ ok: false, error: "Tu plan no permite agendar citas" });

  const { pro_id, date, hour } = req.body;

  const slot = await supabase
    .from("pro_calendar_slots")
    .select("*")
    .eq("pro_id", pro_id)
    .eq("date", date)
    .eq("hour", hour)
    .single();

  if (!slot.data || slot.data.status === "reserved")
    return res.json({ ok: false, error: "Ya reservado" });

  await supabase
    .from("appointments")
    .insert({ client_id: user.id, pro_id, date, hour });

  await supabase
    .from("pro_calendar_slots")
    .update({ status: "reserved" })
    .eq("id", slot.data.id);

  return res.json({ ok: true });
}

/* =======================================================
   MEETING
======================================================= */
export async function meetingController(req, res) {
  try {
    const plan = req.user.plan;
    const allowed = ["premium", "silver", "estudiantil"];
    if (!allowed.includes(plan))
      return res.json({ ok: false, redirect: "/plans" });

    const appointment = await supabase
      .from("appointments")
      .select("*, users!appointments_pro_id_fkey(name, role_profesional)")
      .eq("client_id", req.user.id)
      .limit(1)
      .single();

    if (!appointment.data)
      return res.json({ ok: false, error: "No tienes reuniones" });

    return res.json({
      ok: true,
      meeting: appointment.data
    });

  } catch (err) {
    return res.json({ ok: false, error: "Error cargando reunión" });
  }
}

/* =======================================================
   PLANES
======================================================= */
export async function plansController(req, res) {
  return res.json({
    ok: true,
    plans: {
      gratuito: {
        name: "Plan Gratis",
        features: ["Contenido básico", "Acceso limitado"]
      },
      silver: {
        name: "Plan Silver",
        monthly: 15000,
        yearly: 150000,
        features: ["Contenido completo", "1 cita mensual"]
      },
      premium: {
        name: "Plan Premium",
        monthly: 25000,
        yearly: 250000,
        features: ["Citas ilimitadas", "Material avanzado"]
      }
    }
  });
}

/* =======================================================
   ADMIN DASHBOARD
======================================================= */
export async function adminDashboardController(req, res) {
  try {
    const users = await supabase.from("users").select("id, role, plan");
    const contents = await supabase.from("contents").select("id");

    return res.json({
      ok: true,
      stats: {
        users: users.data.length,
        content: contents.data.length
      }
    });

  } catch (err) {
    return res.status(500).json({ ok: false, error: "Error admin dashboard" });
  }
}

/* =======================================================
   NOTIFICACIONES CLIENTE
======================================================= */
export async function notificationsController(req, res) {
  try {
    const plan = req.user.plan;

    const notices = [
      { msg: `Hola ${req.user.name}` },
      { msg: "Revisa tu contenido disponible" }
    ];

    if (plan === "silver")
      notices.push({ msg: "Tienes acceso a más contenido premium" });

    if (plan === "premium")
      notices.push({ msg: "Acceso completo a todo el contenido" });

    return res.json({ ok: true, notices });

  } catch (err) {
    return res.json({ ok: false });
  }
}
