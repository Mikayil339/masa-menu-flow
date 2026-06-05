import { s as supabase } from "./supabase-C_P_XQd2.mjs";
const money = (value, currency = "AZN") => `${Number(value ?? 0).toFixed(2)} ${currency}`;
const minsAgoIso = (iso) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 6e4));
const localName = (base, i18n, lang) => i18n?.[lang] || base || "";
const shortOrder = (id) => id.slice(0, 6).toUpperCase();
function customerSessionId() {
  const key = "masaqr_customer_session";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    localStorage.setItem(key, id);
  }
  return id;
}
async function getCurrentProfile() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session?.user) return { session: null, profile: null };
  const { data: profile, error } = await supabase.from("masaqr_users").select("id,email,full_name,role,restaurant_id,status").eq("id", session.user.id).maybeSingle();
  if (error) throw error;
  return { session, profile };
}
async function fetchOwnerContext() {
  const { session, profile } = await getCurrentProfile();
  if (!session || !profile) return { session, profile, restaurant: null };
  let restaurant = null;
  if (profile.restaurant_id) {
    const { data: restaurantData, error: restaurantError } = await supabase.from("masaqr_restaurants").select("*").eq("id", profile.restaurant_id).maybeSingle();
    if (restaurantError) throw restaurantError;
    restaurant = restaurantData;
  }
  return { session, profile, restaurant };
}
async function fetchOrders(restaurantId) {
  const { data: orders, error } = await supabase.from("masaqr_orders").select("*").eq("restaurant_id", restaurantId).order("created_at", { ascending: false });
  if (error) throw error;
  const rows = orders ?? [];
  if (!rows.length) return [];
  const orderIds = rows.map((o) => o.id);
  const tableIds = [...new Set(rows.map((o) => o.table_id).filter(Boolean))];
  const [{ data: itemRows, error: itemError }, { data: tableRows }] = await Promise.all([
    supabase.from("masaqr_order_items").select("*").in("order_id", orderIds),
    tableIds.length ? supabase.from("masaqr_tables").select("*").in("id", tableIds) : Promise.resolve({ data: [], error: null })
  ]);
  if (itemError) throw itemError;
  const items = itemRows ?? [];
  const tables = tableRows ?? [];
  return rows.map((order) => ({
    ...order,
    items: items.filter((i) => i.order_id === order.id),
    table: tables.find((t) => t.id === order.table_id) ?? null
  }));
}
async function fetchMenu(restaurantId) {
  const [{ data: categories, error: cError }, { data: items, error: iError }] = await Promise.all([
    supabase.from("masaqr_categories").select("*").eq("restaurant_id", restaurantId).eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("masaqr_menu_items").select("*").eq("restaurant_id", restaurantId).order("sort_order", { ascending: true })
  ]);
  if (cError) throw cError;
  if (iError) throw iError;
  return { categories: categories ?? [], items: items ?? [] };
}
async function updateOrderStatus(order, status, userId) {
  const patch = { status };
  if (status === "confirmed") patch.confirmed_by = userId ?? null;
  if (status === "preparing" || status === "ready") patch.prepared_by = userId ?? null;
  if (status === "served") patch.served_by = userId ?? null;
  const { error } = await supabase.from("masaqr_orders").update(patch).eq("id", order.id);
  if (error) throw error;
  if (status === "ready") {
    await supabase.from("masaqr_waiter_requests").insert({
      restaurant_id: order.restaurant_id,
      table_id: order.table_id,
      order_id: order.id,
      type: "ready_order",
      message: "Order ready",
      status: "open"
    });
  }
}
function priceFor(item, customerType = "local") {
  const fallback = Number(item.price ?? 0);
  if (customerType === "foreign" && item.price_foreign != null) return Number(item.price_foreign);
  if (customerType === "local" && item.price_local != null) return Number(item.price_local);
  return fallback;
}
async function openOrGetSession(params) {
  const { restaurantId, tableId, customerSessionId: customerSessionId2, customerType = "local" } = params;
  const { data: existing, error: findError } = await supabase.from("masaqr_table_sessions").select("*").eq("table_id", tableId).eq("status", "open").order("opened_at", { ascending: false }).limit(1).maybeSingle();
  if (findError) throw findError;
  if (existing) return existing;
  const { data: inserted, error: insertError } = await supabase.from("masaqr_table_sessions").insert({
    restaurant_id: restaurantId,
    table_id: tableId,
    customer_session_id: customerSessionId2,
    customer_type: customerType,
    status: "open"
  }).select("*").single();
  if (insertError) throw insertError;
  await supabase.from("masaqr_tables").update({ status: "occupied" }).eq("id", tableId);
  return inserted;
}
async function closeSession(sessionId, closedBy) {
  const { data: session, error: getError } = await supabase.from("masaqr_table_sessions").select("table_id").eq("id", sessionId).single();
  if (getError) throw getError;
  const { error } = await supabase.from("masaqr_table_sessions").update({ status: "closed", closed_at: (/* @__PURE__ */ new Date()).toISOString(), closed_by: closedBy }).eq("id", sessionId);
  if (error) throw error;
  if (session?.table_id) {
    await supabase.from("masaqr_tables").update({ status: "available" }).eq("id", session.table_id);
  }
}
async function resolveInitialWaiter(params) {
  if (params.mode !== "manual_table_ranges") return null;
  const { data } = await supabase.from("masaqr_waiter_table_assignments").select("waiter_id").eq("table_id", params.tableId).eq("is_active", true).maybeSingle();
  return data?.waiter_id ?? null;
}
async function fetchSuggestionsFor(restaurantId, sourceItemIds) {
  if (!sourceItemIds.length) return [];
  const { data, error } = await supabase.from("masaqr_menu_item_suggestions").select("*").eq("restaurant_id", restaurantId).eq("is_active", true).in("source_item_id", sourceItemIds).order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
async function uploadImage(bucket, file, prefix = "") {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${prefix ? prefix.replace(/\/+$/, "") + "/" : ""}${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
export {
  money as a,
  fetchOrders as b,
  closeSession as c,
  uploadImage as d,
  fetchMenu as e,
  fetchOwnerContext as f,
  customerSessionId as g,
  fetchSuggestionsFor as h,
  localName as l,
  minsAgoIso as m,
  openOrGetSession as o,
  priceFor as p,
  resolveInitialWaiter as r,
  shortOrder as s,
  updateOrderStatus as u
};
