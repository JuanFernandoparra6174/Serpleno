// db.js
// ============================================
// Helper universal para CRUD simples en Supabase
// ============================================

import { supabase } from "./supabase.js";

/* ============================================================
   dbOne(table, filters)
   → Obtiene un solo registro según filtros exactos
============================================================= */
export async function dbOne(table, filters = {}) {
  const query = supabase.from(table).select("*").limit(1);

  Object.entries(filters).forEach(([key, value]) => {
    query.eq(key, value);
  });

  const { data, error } = await query.single();

  if (error) throw error;
  return data;
}

/* ============================================================
   dbAll(table, filters)
   → Lista todos los registros que cumplen con filtros
============================================================= */
export async function dbAll(table, filters = {}) {
  const query = supabase.from(table).select("*");

  Object.entries(filters).forEach(([key, value]) => {
    query.eq(key, value);
  });

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/* ============================================================
   dbInsert(table, data)
   → Inserta nuevo registro y retorna el creado
============================================================= */
export async function dbInsert(table, data) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select("*")
    .single();

  if (error) throw error;
  return result;
}

/* ============================================================
   dbUpdate(table, filters, updates)
   → Actualiza registros y retorna los modificados
============================================================= */
export async function dbUpdate(table, filters, updates) {
  let query = supabase.from(table).update(updates);

  Object.entries(filters).forEach(([key, value]) => {
    query.eq(key, value);
  });

  const { data, error } = await query.select("*");

  if (error) throw error;
  return data;
}

/* ============================================================
   dbDelete(table, filters)
   → Elimina registros y retorna los afectados
============================================================= */
export async function dbDelete(table, filters) {
  let query = supabase.from(table).delete();

  Object.entries(filters).forEach(([key, value]) => {
    query.eq(key, value);
  });

  const { data, error } = await query;

  if (error) throw error;
  return data;
}
