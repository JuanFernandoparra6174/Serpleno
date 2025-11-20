// /public/session.js
async function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const r = await fetch("/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const j = await r.json();
    return j.ok ? j.user : null;
  } catch (e) {
    return null;
  }
}
