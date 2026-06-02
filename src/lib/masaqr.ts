import { supabase } from "@/lib/supabase";
import type { Lang } from "@/lib/store";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "owner" | "waiter" | "kitchen" | "staff" | "manager" | string;
  restaurant_id: string | null;
  branch_id: string | null;
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
};

export type BranchRow = { id: string; restaurant_id: string; name: string; location: string | null; phone: string | null; is_active: boolean };
export type TableRow = { id: string; restaurant_id: string; branch_id: string; table_number: string; table_name: string | null; qr_token: string; status: string; created_at: string };
export type CategoryRow = { id: string; restaurant_id: string; name: string; name_i18n: Record<string, string> | null; sort_order: number; is_active: boolean };
export type MenuItemRow = { id: string; restaurant_id: string; category_id: string; name: string; name_i18n: Record<string, string> | null; description: string | null; description_i18n: Record<string, string> | null; price: number | string; image_url: string | null; is_available: boolean; is_sold_out: boolean; sort_order: number };
export type OrderRow = { id: string; restaurant_id: string; branch_id: string; table_id: string | null; user_id: string | null; customer_name: string | null; customer_session_id: string | null; status: string; total: number | string; note: string | null; confirmed_by: string | null; prepared_by: string | null; served_by: string | null; created_at: string; updated_at: string };
export type OrderItemRow = { id: string; order_id: string; menu_item_id: string; quantity: number; unit_price: number | string; total_price: number | string; note: string | null; selected_modifiers: any };
export type WaiterRequestRow = { id: string; restaurant_id: string; branch_id: string; table_id: string | null; order_id: string | null; type: string; message: string | null; status: string; assigned_to: string | null; created_at: string; updated_at: string };

export type OrderBundle = OrderRow & { items: OrderItemRow[]; table?: TableRow | null; branch?: BranchRow | null };

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
    .select("id,email,full_name,role,restaurant_id,branch_id,status")
    .eq("id", session.user.id)
    .maybeSingle();
  if (error) throw error;
  return { session, profile: profile as Profile | null };
}

export async function fetchOwnerContext() {
  const { session, profile } = await getCurrentProfile();
  if (!session || !profile) return { session, profile, restaurant: null, branches: [] as BranchRow[] };
  let restaurant: RestaurantRow | null = null;
  let branches: BranchRow[] = [];
  if (profile.restaurant_id) {
    const { data: restaurantData, error: restaurantError } = await supabase
      .from("masaqr_restaurants")
      .select("*")
      .eq("id", profile.restaurant_id)
      .maybeSingle();
    if (restaurantError) throw restaurantError;
    restaurant = restaurantData as RestaurantRow | null;

    const { data: branchData, error: branchError } = await supabase
      .from("masaqr_branches")
      .select("*")
      .eq("restaurant_id", profile.restaurant_id)
      .order("created_at", { ascending: true });
    if (branchError) throw branchError;
    branches = (branchData ?? []) as BranchRow[];
  }
  return { session, profile, restaurant, branches };
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
  const branchIds = [...new Set(rows.map(o => o.branch_id).filter(Boolean))] as string[];
  const [{ data: itemRows, error: itemError }, { data: tableRows }, { data: branchRows }] = await Promise.all([
    supabase.from("masaqr_order_items").select("*").in("order_id", orderIds),
    tableIds.length ? supabase.from("masaqr_tables").select("*").in("id", tableIds) : Promise.resolve({ data: [] as TableRow[], error: null } as any),
    branchIds.length ? supabase.from("masaqr_branches").select("*").in("id", branchIds) : Promise.resolve({ data: [] as BranchRow[], error: null } as any),
  ]);
  if (itemError) throw itemError;
  const items = (itemRows ?? []) as OrderItemRow[];
  const tables = (tableRows ?? []) as TableRow[];
  const branches = (branchRows ?? []) as BranchRow[];
  return rows.map(order => ({
    ...order,
    items: items.filter(i => i.order_id === order.id),
    table: tables.find(t => t.id === order.table_id) ?? null,
    branch: branches.find(b => b.id === order.branch_id) ?? null,
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
      branch_id: order.branch_id,
      table_id: order.table_id,
      order_id: order.id,
      type: "ready_order",
      message: "Order ready",
      status: "open",
    });
  }
}
