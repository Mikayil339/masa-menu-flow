import { supabase } from "@/lib/supabase";
import type { Lang } from "@/lib/store";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "owner" | "waiter" | "kitchen" | "staff" | "manager" | string;
  restaurant_id: string | null;
  status: string | null;
};

export type RestaurantRow = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  logo_url: string | null;
  cover_url: string | null;
  default_language: Lang;
  enabled_languages: Lang[] | null;
  currency: string;
  is_active: boolean;
  phone?: string | null;
  wifi_name?: string | null;
  wifi_password?: string | null;
  description?: string | null;
  description_i18n?: Record<string, string> | null;
  waiter_assignment_mode?: string | null;
  show_phone_on_menu?: boolean | null;
  show_wifi_on_menu?: boolean | null;
};

export type TableRow = { id: string; restaurant_id: string; table_number: string; table_name: string | null; qr_token: string; status: string; created_at: string };
export type CategoryRow = { id: string; restaurant_id: string; name: string; name_i18n: Record<string, string> | null; sort_order: number; is_active: boolean };
export type MenuItemRow = { id: string; restaurant_id: string; category_id: string; name: string; name_i18n: Record<string, string> | null; description: string | null; description_i18n: Record<string, string> | null; price: number | string; price_local?: number | string | null; price_foreign?: number | string | null; image_url: string | null; is_available: boolean; is_sold_out: boolean; sort_order: number };
export type OrderRow = { id: string; restaurant_id: string; table_id: string | null; user_id: string | null; customer_name: string | null; customer_session_id: string | null; status: string; total: number | string; note: string | null; confirmed_by: string | null; prepared_by: string | null; served_by: string | null; created_at: string; updated_at: string };
export type OrderItemRow = { id: string; order_id: string; menu_item_id: string; quantity: number; unit_price: number | string; total_price: number | string; note: string | null; selected_modifiers: any };
export type WaiterRequestRow = { id: string; restaurant_id: string; table_id: string | null; order_id: string | null; type: string; message: string | null; status: string; assigned_to: string | null; created_at: string; updated_at: string };

export type OrderBundle = OrderRow & { items: OrderItemRow[]; table?: TableRow | null };

export const money = (value: number | string | null | undefined, currency = "AZN") => `${Number(value ?? 0).toFixed(2)} ${currency}`;
export const minsAgoIso = (iso: string) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
export const localName = (base: string | null | undefined, i18n: Record<string, string> | null | undefined, lang: Lang) => i18n?.[lang] || base || "";
export const shortOrder = (id: string) => id.slice(0, 6).toUpperCase();

export function customerSessionId() {
  const key = "masaqr_customer_session";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    localStorage.setItem(key, id);
  }
  return id;
}

export async function getCurrentProfile() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session?.user) return { session: null, profile: null as Profile | null };
  const { data: profile, error } = await supabase
    .from("masaqr_users")
    .select("id,email,full_name,role,restaurant_id,status")
    .eq("id", session.user.id)
    .maybeSingle();
  if (error) throw error;
  return { session, profile: profile as Profile | null };
}

export async function fetchOwnerContext() {
  const { session, profile } = await getCurrentProfile();
  if (!session || !profile) return { session, profile, restaurant: null };
  let restaurant: RestaurantRow | null = null;
  if (profile.restaurant_id) {
    const { data: restaurantData, error: restaurantError } = await supabase
      .from("masaqr_restaurants")
      .select("*")
      .eq("id", profile.restaurant_id)
      .maybeSingle();
    if (restaurantError) throw restaurantError;
    restaurant = restaurantData as RestaurantRow | null;
  }
  return { session, profile, restaurant };
}

export async function fetchOrders(restaurantId: string): Promise<OrderBundle[]> {
  const { data: orders, error } = await supabase
    .from("masaqr_orders")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (orders ?? []) as OrderRow[];
  if (!rows.length) return [];
  const orderIds = rows.map(o => o.id);
  const tableIds = [...new Set(rows.map(o => o.table_id).filter(Boolean))] as string[];
  const [{ data: itemRows, error: itemError }, { data: tableRows }] = await Promise.all([
    supabase.from("masaqr_order_items").select("*").in("order_id", orderIds),
    tableIds.length ? supabase.from("masaqr_tables").select("*").in("id", tableIds) : Promise.resolve({ data: [] as TableRow[], error: null } as any),
  ]);
  if (itemError) throw itemError;
  const items = (itemRows ?? []) as OrderItemRow[];
  const tables = (tableRows ?? []) as TableRow[];
  return rows.map(order => ({
    ...order,
    items: items.filter(i => i.order_id === order.id),
    table: tables.find(t => t.id === order.table_id) ?? null,
  }));
}

export async function fetchMenu(restaurantId: string) {
  const [{ data: categories, error: cError }, { data: items, error: iError }] = await Promise.all([
    supabase.from("masaqr_categories").select("*").eq("restaurant_id", restaurantId).eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("masaqr_menu_items").select("*").eq("restaurant_id", restaurantId).order("sort_order", { ascending: true }),
  ]);
  if (cError) throw cError;
  if (iError) throw iError;
  return { categories: (categories ?? []) as CategoryRow[], items: (items ?? []) as MenuItemRow[] };
}

export async function updateOrderStatus(order: OrderRow, status: string, userId?: string | null) {
  const patch: Record<string, any> = { status };
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
      status: "open",
    });
  }
}

// =====================================================================
// Phase 1 additions — sessions, pricing, suggestions, assignments, uploads.
// Requires migration db/migrations/20260603105753_masaqr_session_pivot.sql
// =====================================================================

export type CustomerType = "local" | "foreign";
export type WaiterAssignmentMode = "manual_table_ranges" | "first_confirming_waiter" | "disabled";

export type TableSessionRow = {
  id: string;
  restaurant_id: string;
  table_id: string;
  assigned_waiter_id: string | null;
  customer_session_id: string | null;
  customer_type: CustomerType;
  status: "open" | "closed" | "cancelled";
  total: number | string;
  opened_at: string;
  closed_at: string | null;
  closed_by: string | null;
};

export type SuggestionRow = {
  id: string;
  restaurant_id: string;
  source_item_id: string;
  suggested_item_id: string;
  sort_order: number;
  is_active: boolean;
};

export type WaiterAssignmentRow = {
  id: string;
  restaurant_id: string;
  waiter_id: string;
  table_id: string;
  is_active: boolean;
};

/** Resolve menu item price for a given customer type. Falls back to default `price`. */
export function priceFor(item: Pick<MenuItemRow, "price"> & { price_local?: number | string | null; price_foreign?: number | string | null }, customerType: CustomerType = "local"): number {
  const fallback = Number(item.price ?? 0);
  if (customerType === "foreign" && item.price_foreign != null) return Number(item.price_foreign);
  if (customerType === "local" && item.price_local != null) return Number(item.price_local);
  return fallback;
}

/** Find an open session for the table, or create one. Used by customer flow on first order. */
export async function openOrGetSession(params: {
  restaurantId: string;
  tableId: string;
  customerSessionId: string;
  customerType?: CustomerType;
}): Promise<TableSessionRow> {
  const { restaurantId, tableId, customerSessionId, customerType = "local" } = params;
  const { data: existing, error: findError } = await supabase
    .from("masaqr_table_sessions")
    .select("*")
    .eq("table_id", tableId)
    .eq("status", "open")
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing as TableSessionRow;

  const { data: inserted, error: insertError } = await supabase
    .from("masaqr_table_sessions")
    .insert({
      restaurant_id: restaurantId,
      table_id: tableId,
      customer_session_id: customerSessionId,
      customer_type: customerType,
      status: "open",
    })
    .select("*")
    .single();
  if (insertError) throw insertError;

  // Mark table as occupied (best-effort; ignore RLS denial silently — manager view recomputes from sessions).
  await supabase.from("masaqr_tables").update({ status: "occupied" }).eq("id", tableId);
  return inserted as TableSessionRow;
}

export async function closeSession(sessionId: string, closedBy: string | null) {
  const { data: session, error: getError } = await supabase
    .from("masaqr_table_sessions")
    .select("table_id")
    .eq("id", sessionId)
    .single();
  if (getError) throw getError;
  const { error } = await supabase
    .from("masaqr_table_sessions")
    .update({ status: "closed", closed_at: new Date().toISOString(), closed_by: closedBy })
    .eq("id", sessionId);
  if (error) throw error;
  if (session?.table_id) {
    await supabase.from("masaqr_tables").update({ status: "available" }).eq("id", session.table_id);
  }
}

/** Determine which waiter (if any) should be the initial assignee for a new order. */
export async function resolveInitialWaiter(params: {
  restaurantId: string;
  tableId: string;
  mode: WaiterAssignmentMode;
}): Promise<string | null> {
  if (params.mode !== "manual_table_ranges") return null;
  const { data } = await supabase
    .from("masaqr_waiter_table_assignments")
    .select("waiter_id")
    .eq("table_id", params.tableId)
    .eq("is_active", true)
    .maybeSingle();
  return (data?.waiter_id as string) ?? null;
}

export async function fetchSuggestionsFor(restaurantId: string, sourceItemIds: string[]) {
  if (!sourceItemIds.length) return [] as SuggestionRow[];
  const { data, error } = await supabase
    .from("masaqr_menu_item_suggestions")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .in("source_item_id", sourceItemIds)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SuggestionRow[];
}

/** Upload a local image to a Supabase Storage bucket and return the public URL. */
export async function uploadImage(bucket: "masaqr-logos" | "masaqr-covers" | "masaqr-menu-images", file: File, prefix = ""): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${prefix ? prefix.replace(/\/+$/, "") + "/" : ""}${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

