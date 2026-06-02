import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "az" | "en" | "ru";
export type Role = "owner" | "manager" | "kitchen" | "waiter" | "staff";

export interface Translated { az: string; en: string; ru: string }

export interface ModifierOption {
  id: string;
  name: Translated;
  priceDelta: number;
  available: boolean;
}
export interface ModifierGroup {
  id: string;
  name: Translated;
  required: boolean;
  min: number;
  max: number;
  options: ModifierOption[];
}
export interface MenuItem {
  id: string;
  categoryId: string;
  name: Translated;
  description: Translated;
  price: number;
  image: string;
  allergens: string[];
  station: "grill" | "cold" | "bar" | "pastry";
  prepTime: number;
  available: boolean;
  soldOut: boolean;
  hidden: boolean;
  badges: ("new" | "spicy" | "vegan" | "chef" | "popular")[];
  featured: boolean;
  showOnQr: boolean;
  showOnPdf: boolean;
  modifierGroupIds: string[];
}
export interface Category {
  id: string;
  name: Translated;
  description: Translated;
  order: number;
}

export type TableStatus =
  | "available" | "seated" | "ordering" | "preparing"
  | "ready" | "served" | "bill_requested" | "paid" | "cleaning";
export interface Table {
  id: string;
  label: string;
  branchId: string;
  seats: number;
  status: TableStatus;
  qrEnabled: boolean;
}

export type OrderStatus = "new" | "accepted" | "preparing" | "ready" | "served" | "closed";
export interface OrderItem {
  id: string;
  menuItemId: string;
  qty: number;
  note?: string;
  modifiers: { groupId: string; optionIds: string[] }[];
  done?: boolean;
}
export interface Order {
  id: string;
  shortCode: string;
  tableId: string;
  branchId: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: number;
  acceptedAt?: number;
  readyAt?: number;
  servedAt?: number;
  notes?: string;
  language: Lang;
  billRequested?: boolean;
}

export type AlertKind = "ready" | "help" | "bill" | "water" | "longwait";
export interface WaiterAlert {
  id: string;
  kind: AlertKind;
  tableId: string;
  orderId?: string;
  createdAt: number;
  resolved: boolean;
}

export interface Branch { id: string; name: string; address: string; active: boolean }
export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchIds: string[];
  active: boolean;
  lastActive: number;
}
export interface Invite {
  id: string;
  email: string;
  role: Role;
  branchIds: string[];
  code: string;
  expiresAt: number;
  status: "pending" | "accepted" | "cancelled";
}

export interface SupportTicket {
  id: string;
  subject: string;
  type: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: number;
}

export type PdfTemplate = "elegant" | "bistro" | "luxury" | "casual";

export interface Restaurant {
  name: string;
  slug: string;
  logo?: string;
  cover?: string;
  primaryLang: Lang;
  langs: Lang[];
  currency: string;
  serviceMode: "dine_in" | "qr_only" | "hybrid";
}

export interface Plan {
  tier: "trial" | "starter" | "pro" | "business";
  trialEndsAt: number;
  limits: { branches: number; tables: number; staff: number };
}

export interface EtaSettings {
  defaultPrep: number;
  lateThreshold: number;
  rushMultiplier: number;
  learning: boolean;
}

export interface Auth {
  loggedIn: boolean;
  role: Role | null;
  email: string | null;
  name: string | null;
  branchId: string | null;
  setupComplete: boolean;
}

export interface PdfSettings {
  template: PdfTemplate;
  language: Lang | "multi";
  showImages: boolean;
  showAllergens: boolean;
  showSoldOut: boolean;
  showPrices: boolean;
}

interface State {
  auth: Auth;
  restaurant: Restaurant;
  plan: Plan;
  eta: EtaSettings;
  branches: Branch[];
  activeBranchId: string;
  categories: Category[];
  items: MenuItem[];
  modifiers: ModifierGroup[];
  tables: Table[];
  orders: Order[];
  alerts: WaiterAlert[];
  staff: StaffMember[];
  invites: Invite[];
  tickets: SupportTicket[];
  pdf: PdfSettings;
  customerLang: Lang;
  scans: number;

  // actions
  login: (profile: { email: string; role: Role; name: string; branchId?: string | null }) => void;
  loginWithGoogle: (role?: Role) => { isNew: boolean; role: Role };
  logout: () => void;
  register: (email: string, name: string, restaurantName: string, slug: string) => void;
  registerWithGoogle: () => void;
  completeSetup: () => void;
  setActiveBranch: (id: string) => void;
  setCustomerLang: (l: Lang) => void;

  upsertCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  upsertItem: (i: MenuItem) => void;
  deleteItem: (id: string) => void;
  toggleSoldOut: (id: string) => void;
  upsertModifier: (g: ModifierGroup) => void;

  upsertTable: (t: Table) => void;
  deleteTable: (id: string) => void;
  setTableStatus: (id: string, s: TableStatus) => void;

  placeOrder: (tableId: string, items: OrderItem[], lang: Lang) => Order;
  setOrderStatus: (id: string, s: OrderStatus) => void;
  toggleOrderItemDone: (orderId: string, itemId: string) => void;
  requestBill: (tableId: string) => void;
  callWaiter: (tableId: string, kind: AlertKind) => void;
  resolveAlert: (id: string) => void;

  inviteStaff: (email: string, role: Role, branchIds: string[]) => Invite;
  acceptInvite: (code: string, name: string) => StaffMember | null;
  removeStaff: (id: string) => void;
  cancelInvite: (id: string) => void;

  addBranch: (name: string, address: string) => void;
  toggleBranch: (id: string) => void;

  setPdf: (p: Partial<PdfSettings>) => void;
  setPlan: (tier: Plan["tier"]) => void;
  setEta: (p: Partial<EtaSettings>) => void;
  setRestaurant: (p: Partial<Restaurant>) => void;

  openTicket: (subject: string, type: string, message: string) => void;
  trackScan: () => void;
  resetDemo: () => void;
}

const T = (az: string, en?: string, ru?: string): Translated => ({ az, en: en ?? az, ru: ru ?? az });
const rid = () => Math.random().toString(36).slice(2, 10);
const now = () => Date.now();

// ---- Seed data ----
const seed = () => {
  const branchId = "br1";
  const cats: Category[] = [
    { id: "c1", order: 1, name: T("Başlanğıclar", "Starters", "Закуски"), description: T("Yüngül başlanğıclar", "Light bites to begin", "Лёгкие закуски") },
    { id: "c2", order: 2, name: T("Əsas Yeməklər", "Mains", "Основные блюда"), description: T("İmza yeməklərimiz", "Our signature dishes", "Наши фирменные блюда") },
    { id: "c3", order: 3, name: T("İçkilər", "Drinks", "Напитки"), description: T("Sərinləşdirici içkilər", "Refreshing drinks", "Освежающие напитки") },
    { id: "c4", order: 4, name: T("Desertlər", "Desserts", "Десерты"), description: T("Şirin sonluq", "Sweet endings", "Сладкий финал") },
  ];

  const mod1: ModifierGroup = {
    id: "m1", required: true, min: 1, max: 1, name: T("Bişmə dərəcəsi", "Doneness", "Прожарка"),
    options: [
      { id: "m1a", name: T("Orta", "Medium", "Средняя"), priceDelta: 0, available: true },
      { id: "m1b", name: T("Yaxşı bişmiş", "Well done", "Прожаренная"), priceDelta: 0, available: true },
      { id: "m1c", name: T("Az bişmiş", "Rare", "С кровью"), priceDelta: 0, available: true },
    ],
  };
  const mod2: ModifierGroup = {
    id: "m2", required: false, min: 0, max: 3, name: T("Əlavələr", "Add-ons", "Добавки"),
    options: [
      { id: "m2a", name: T("Pendir", "Extra cheese", "Сыр"), priceDelta: 2, available: true },
      { id: "m2b", name: T("Avokado", "Avocado", "Авокадо"), priceDelta: 3, available: true },
      { id: "m2c", name: T("Bekon", "Bacon", "Бекон"), priceDelta: 2.5, available: true },
    ],
  };

  const img = (q: string, seed: number) =>
    `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=800&q=70&sig=${seed}`;

  const items: MenuItem[] = [
    {
      id: "i1", categoryId: "c1",
      name: T("Burrata Salatı", "Burrata Salad", "Салат с буратой"),
      description: T("Heirloom pomidor, bazilik, balzamik", "Heirloom tomato, basil, balsamic", "Помидоры, базилик, бальзамик"),
      price: 16, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
      allergens: ["dairy"], station: "cold", prepTime: 7, available: true, soldOut: false, hidden: false,
      badges: ["chef"], featured: true, showOnQr: true, showOnPdf: true, modifierGroupIds: [],
    },
    {
      id: "i2", categoryId: "c1",
      name: T("Mərcimək Şorbası", "Lentil Soup", "Чечевичный суп"),
      description: T("Tüstülənmiş paprika ilə", "With smoked paprika", "С копчёной паприкой"),
      price: 9, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800",
      allergens: [], station: "cold", prepTime: 5, available: true, soldOut: false, hidden: false,
      badges: ["vegan"], featured: false, showOnQr: true, showOnPdf: true, modifierGroupIds: [],
    },
    {
      id: "i3", categoryId: "c2",
      name: T("Wagyu Burger", "Wagyu Burger", "Бургер Вагю"),
      description: T("Brioche bulka, çedar, karamelizə soğan", "Brioche, cheddar, caramelized onion", "Бриошь, чеддер, лук"),
      price: 24, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
      allergens: ["gluten", "dairy"], station: "grill", prepTime: 14, available: true, soldOut: false, hidden: false,
      badges: ["popular"], featured: true, showOnQr: true, showOnPdf: true, modifierGroupIds: ["m1", "m2"],
    },
    {
      id: "i4", categoryId: "c2",
      name: T("Qızardılmış Qızılbalıq", "Pan-seared Salmon", "Лосось на сковороде"),
      description: T("Limon-kərə yağı, mövsümi tərəvəz", "Lemon-butter, seasonal veg", "Лимон-масло, овощи"),
      price: 28, image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800",
      allergens: ["fish", "dairy"], station: "grill", prepTime: 16, available: true, soldOut: false, hidden: false,
      badges: ["new"], featured: false, showOnQr: true, showOnPdf: true, modifierGroupIds: [],
    },
    {
      id: "i5", categoryId: "c3",
      name: T("Ev limonadı", "House Lemonade", "Домашний лимонад"),
      description: T("Sərin, təzə sıxılmış", "Fresh-pressed, chilled", "Свежевыжатый"),
      price: 6, image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800",
      allergens: [], station: "bar", prepTime: 3, available: true, soldOut: false, hidden: false,
      badges: [], featured: false, showOnQr: true, showOnPdf: true, modifierGroupIds: [],
    },
    {
      id: "i6", categoryId: "c3",
      name: T("Espresso", "Espresso", "Эспрессо"),
      description: T("İmza qarışığımız", "Our signature blend", "Наша смесь"),
      price: 4, image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=800",
      allergens: [], station: "bar", prepTime: 2, available: true, soldOut: false, hidden: false,
      badges: [], featured: false, showOnQr: true, showOnPdf: true, modifierGroupIds: [],
    },
    {
      id: "i7", categoryId: "c4",
      name: T("Şokoladlı Fondan", "Chocolate Fondant", "Шоколадный фондан"),
      description: T("Vanil dondurması ilə", "With vanilla ice cream", "С ванильным мороженым"),
      price: 11, image: "https://images.unsplash.com/photo-1611329857570-f02f340e7378?w=800",
      allergens: ["gluten", "dairy", "egg"], station: "pastry", prepTime: 12, available: true, soldOut: false, hidden: false,
      badges: ["chef"], featured: true, showOnQr: true, showOnPdf: true, modifierGroupIds: [],
    },
    {
      id: "i8", categoryId: "c4",
      name: T("Mövsümi Tart", "Seasonal Tart", "Сезонный тарт"),
      description: T("Şefdən soruşun", "Ask your server", "Спросите официанта"),
      price: 9, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800",
      allergens: ["gluten", "dairy"], station: "pastry", prepTime: 8, available: true, soldOut: true, hidden: false,
      badges: [], featured: false, showOnQr: true, showOnPdf: true, modifierGroupIds: [],
    },
  ];

  const tables: Table[] = Array.from({ length: 12 }).map((_, i) => ({
    id: `t${i + 1}`, label: `T${i + 1}`, branchId, seats: 2 + (i % 3) * 2,
    status: (["available", "available", "seated", "preparing", "available", "ready"] as TableStatus[])[i % 6],
    qrEnabled: true,
  }));

  return { cats, items, mods: [mod1, mod2], branchId, tables };
};

const s = seed();

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      auth: { loggedIn: false, role: null, email: null, name: null, branchId: null, setupComplete: true },
      restaurant: {
        name: "MasaQR", slug: "demo", primaryLang: "en", langs: ["az", "en", "ru"],
        currency: "₼", serviceMode: "hybrid",
        cover: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600",
      },
      plan: { tier: "trial", trialEndsAt: now() + 1000 * 60 * 60 * 24 * 30, limits: { branches: 3, tables: 50, staff: 25 } },
      eta: { defaultPrep: 15, lateThreshold: 25, rushMultiplier: 1.3, learning: true },
      branches: [
        { id: "br1", name: "Downtown", address: "12 Nizami St, Baku", active: true },
        { id: "br2", name: "Seaside", address: "Boulevard 45, Baku", active: true },
      ],
      activeBranchId: "br1",
      categories: [],
      items: [],
      modifiers: [],
      tables: [],
      orders: [],
      alerts: [],
      staff: [],
      invites: [],
      tickets: [],
      pdf: { template: "bistro", language: "en", showImages: true, showAllergens: true, showSoldOut: false, showPrices: true },
      customerLang: "en",
      scans: 0,

      login: ({ email, role, name, branchId }) => set({
        auth: { loggedIn: true, role, email, name, branchId: branchId ?? null, setupComplete: true }
      }),
      loginWithGoogle: (_role = "owner") => {
        // Mock Google login disabled — Supabase auth required.
        return { isNew: false, role: _role };
      },
      logout: () => set({ auth: { loggedIn: false, role: null, email: null, name: null, branchId: null, setupComplete: true } }),
      register: (email, name, restaurantName, slug) => {
        set({
          auth: { loggedIn: true, role: "owner", email, name, branchId: "br1", setupComplete: false },
          restaurant: { ...get().restaurant, name: restaurantName, slug },
          plan: { ...get().plan, tier: "trial", trialEndsAt: now() + 1000 * 60 * 60 * 24 * 30 },
        });
      },
      registerWithGoogle: () => {
        set({
          auth: { loggedIn: true, role: "owner", email: "owner.google@gmail.com", name: "Aysel Mammadova", branchId: "br1", setupComplete: false },
          plan: { ...get().plan, tier: "trial", trialEndsAt: now() + 1000 * 60 * 60 * 24 * 30 },
        });
      },
      completeSetup: () => set(st => ({ auth: { ...st.auth, setupComplete: true } })),
      setActiveBranch: (id) => set({ activeBranchId: id }),
      setCustomerLang: (l) => set({ customerLang: l }),

      upsertCategory: (c) => set(st => {
        const ex = st.categories.find(x => x.id === c.id);
        return { categories: ex ? st.categories.map(x => x.id === c.id ? c : x) : [...st.categories, c] };
      }),
      deleteCategory: (id) => set(st => ({
        categories: st.categories.filter(c => c.id !== id),
        items: st.items.filter(i => i.categoryId !== id),
      })),
      upsertItem: (i) => set(st => {
        const ex = st.items.find(x => x.id === i.id);
        return { items: ex ? st.items.map(x => x.id === i.id ? i : x) : [...st.items, i] };
      }),
      deleteItem: (id) => set(st => ({ items: st.items.filter(i => i.id !== id) })),
      toggleSoldOut: (id) => set(st => ({
        items: st.items.map(i => i.id === id ? { ...i, soldOut: !i.soldOut } : i),
      })),
      upsertModifier: (g) => set(st => {
        const ex = st.modifiers.find(x => x.id === g.id);
        return { modifiers: ex ? st.modifiers.map(x => x.id === g.id ? g : x) : [...st.modifiers, g] };
      }),

      upsertTable: (t) => set(st => {
        const ex = st.tables.find(x => x.id === t.id);
        return { tables: ex ? st.tables.map(x => x.id === t.id ? t : x) : [...st.tables, t] };
      }),
      deleteTable: (id) => set(st => ({ tables: st.tables.filter(t => t.id !== id) })),
      setTableStatus: (id, s) => set(st => ({ tables: st.tables.map(t => t.id === id ? { ...t, status: s } : t) })),

      placeOrder: (tableId, items, lang) => {
        const id = rid();
        const shortCode = "A" + Math.floor(Math.random() * 900 + 100);
        const order: Order = {
          id, shortCode, tableId, branchId: get().activeBranchId, status: "new",
          items, createdAt: now(), language: lang,
        };
        set(st => ({
          orders: [order, ...st.orders],
          tables: st.tables.map(t => t.id === tableId ? { ...t, status: "ordering" } : t),
        }));
        return order;
      },
      setOrderStatus: (id, s) => set(st => {
        const orders = st.orders.map(o => {
          if (o.id !== id) return o;
          const patch: Partial<Order> = { status: s };
          if (s === "accepted") patch.acceptedAt = now();
          if (s === "ready") patch.readyAt = now();
          if (s === "served") patch.servedAt = now();
          return { ...o, ...patch };
        });
        const o = orders.find(x => x.id === id)!;
        const alerts = s === "ready"
          ? [...st.alerts, { id: rid(), kind: "ready" as AlertKind, tableId: o.tableId, orderId: o.id, createdAt: now(), resolved: false }]
          : st.alerts;
        const tables = st.tables.map(t => {
          if (t.id !== o.tableId) return t;
          if (s === "preparing") return { ...t, status: "preparing" as TableStatus };
          if (s === "ready") return { ...t, status: "ready" as TableStatus };
          if (s === "served") return { ...t, status: "served" as TableStatus };
          return t;
        });
        return { orders, alerts, tables };
      }),
      toggleOrderItemDone: (orderId, itemId) => set(st => ({
        orders: st.orders.map(o => o.id === orderId
          ? { ...o, items: o.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) }
          : o)
      })),
      requestBill: (tableId) => set(st => ({
        alerts: [...st.alerts, { id: rid(), kind: "bill", tableId, createdAt: now(), resolved: false }],
        tables: st.tables.map(t => t.id === tableId ? { ...t, status: "bill_requested" } : t),
        orders: st.orders.map(o => o.tableId === tableId ? { ...o, billRequested: true } : o),
      })),
      callWaiter: (tableId, kind) => set(st => ({
        alerts: [...st.alerts, { id: rid(), kind, tableId, createdAt: now(), resolved: false }],
      })),
      resolveAlert: (id) => set(st => ({
        alerts: st.alerts.map(a => a.id === id ? { ...a, resolved: true } : a),
      })),

      inviteStaff: (email, role, branchIds) => {
        const code = Math.random().toString(36).slice(2, 8).toUpperCase();
        const inv: Invite = {
          id: rid(), email, role, branchIds, code,
          expiresAt: now() + 1000 * 60 * 60 * 24 * 7, status: "pending",
        };
        set(st => ({ invites: [inv, ...st.invites] }));
        return inv;
      },
      acceptInvite: (code, name) => {
        const inv = get().invites.find(i => i.code === code && i.status === "pending");
        if (!inv) return null;
        const member: StaffMember = {
          id: rid(), name, email: inv.email, role: inv.role,
          branchIds: inv.branchIds, active: true, lastActive: now(),
        };
        set(st => ({
          staff: [...st.staff, member],
          invites: st.invites.map(i => i.id === inv.id ? { ...i, status: "accepted" } : i),
        }));
        return member;
      },
      removeStaff: (id) => set(st => ({ staff: st.staff.filter(s => s.id !== id) })),
      cancelInvite: (id) => set(st => ({
        invites: st.invites.map(i => i.id === id ? { ...i, status: "cancelled" } : i),
      })),

      addBranch: (name, address) => set(st => ({
        branches: [...st.branches, { id: rid(), name, address, active: true }],
      })),
      toggleBranch: (id) => set(st => ({
        branches: st.branches.map(b => b.id === id ? { ...b, active: !b.active } : b),
      })),

      setPdf: (p) => set(st => ({ pdf: { ...st.pdf, ...p } })),
      setPlan: (tier) => set(st => ({ plan: { ...st.plan, tier } })),
      setEta: (p) => set(st => ({ eta: { ...st.eta, ...p } })),
      setRestaurant: (p) => set(st => ({ restaurant: { ...st.restaurant, ...p } })),

      openTicket: (subject, type, message) => set(st => ({
        tickets: [
          { id: rid(), subject, type, message, status: "open", createdAt: now() },
          ...st.tickets,
        ],
      })),
      trackScan: () => set(st => ({ scans: st.scans + 1 })),
      resetDemo: () => {
        localStorage.removeItem("masaqr-v1");
        window.location.reload();
      },
    }),
    { name: "masaqr-v1" }
  )
);

// helpers
export const tr = (t: Translated, lang: Lang) => t[lang] || t.en || t.az;
export const fmtPrice = (n: number, cur = "₼") => `${n.toFixed(2)} ${cur}`;
export const minutesAgo = (ts: number) => Math.max(0, Math.round((Date.now() - ts) / 60000));
