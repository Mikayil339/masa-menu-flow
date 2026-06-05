import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as PageHeader } from "./AppShell-DE5YGknu.mjs";
import { C as Card } from "./card-BdXDhg5r.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-Fr-Qmdjb.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./supabase-C_P_XQd2.mjs";
import { f as fetchOwnerContext } from "./masaqr-BQ3x-CAL.mjs";
import { o as Plus, s as RefreshCcw, t as UserRound, X, u as Save, v as Copy } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./Logo-g-ujtk54.mjs";
import "./store-MU1TcehK.mjs";
import "../_libs/zustand.mjs";
import "./i18n-BZSpJObU.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
function getStatusLabel(status) {
  if (status === "active") return "Aktiv";
  if (status === "inactive") return "Deaktiv";
  if (status === "used") return "İstifadə olunub";
  if (status === "expired") return "Müddəti bitib";
  return status || "Naməlum";
}
function StaffPage() {
  const [profile, setProfile] = reactExports.useState(null);
  const [staff, setStaff] = reactExports.useState([]);
  const [invites, setInvites] = reactExports.useState([]);
  const [tables, setTables] = reactExports.useState([]);
  const [assignments, setAssignments] = reactExports.useState([]);
  const [ranges, setRanges] = reactExports.useState({});
  const [open, setOpen] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  const [creating, setCreating] = reactExports.useState(false);
  const [savingWaiterId, setSavingWaiterId] = reactExports.useState(null);
  async function loadStaff() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      if (!ctx.profile?.restaurant_id) {
        setStaff([]);
        setInvites([]);
        setTables([]);
        setAssignments([]);
        return;
      }
      const restaurantId = ctx.profile.restaurant_id;
      const [staffResult, invitesResult, tablesResult, assignmentsResult] = await Promise.all([supabase.from("masaqr_users").select("id,email,full_name,role,restaurant_id,status,created_at").eq("restaurant_id", restaurantId).eq("role", "waiter").order("created_at", {
        ascending: false
      }), supabase.from("masaqr_staff_invites").select("*").eq("restaurant_id", restaurantId).order("created_at", {
        ascending: false
      }), supabase.from("masaqr_tables").select("*").eq("restaurant_id", restaurantId).order("table_number", {
        ascending: true
      }), supabase.from("masaqr_waiter_table_assignments").select("*").eq("restaurant_id", restaurantId).eq("is_active", true)]);
      if (staffResult.error) throw staffResult.error;
      if (invitesResult.error) throw invitesResult.error;
      if (tablesResult.error) throw tablesResult.error;
      if (assignmentsResult.error) throw assignmentsResult.error;
      const staffRows = (staffResult.data ?? []).map((row) => ({
        id: String(row.id),
        restaurant_id: row.restaurant_id ?? null,
        email: row.email ?? null,
        full_name: row.full_name ?? null,
        role: "waiter",
        status: row.status ?? null
      }));
      const inviteRows = (invitesResult.data ?? []).map((row) => ({
        id: String(row.id),
        restaurant_id: String(row.restaurant_id),
        code: String(row.code),
        role: "waiter",
        status: row.status ?? "active",
        created_by: String(row.created_by ?? ""),
        used_by: row.used_by ?? null,
        expires_at: row.expires_at ?? null,
        created_at: row.created_at ?? (/* @__PURE__ */ new Date()).toISOString()
      }));
      const tableRows = tablesResult.data ?? [];
      const assignmentRows = assignmentsResult.data ?? [];
      setStaff(staffRows);
      setInvites(inviteRows);
      setTables(tableRows);
      setAssignments(assignmentRows);
      setRanges((current) => buildRangeDrafts(staffRows, tableRows, assignmentRows, current));
    } catch (error) {
      toast.error(error.message ?? "Ofisiant məlumatları yüklənmədi");
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    loadStaff();
    const channel = supabase.channel("staff-live").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_users"
    }, () => loadStaff()).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_staff_invites"
    }, () => loadStaff()).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_waiter_table_assignments"
    }, () => loadStaff()).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  function makeInviteCode() {
    return `MQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
  async function createInvite() {
    if (!profile?.restaurant_id || !profile.id) {
      toast.error("Restoran profili tapılmadı");
      return;
    }
    setCreating(true);
    try {
      const code = makeInviteCode();
      const {
        error
      } = await supabase.from("masaqr_staff_invites").insert({
        restaurant_id: profile.restaurant_id,
        code,
        role: "waiter",
        status: "active",
        created_by: profile.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString()
      });
      if (error) throw error;
      toast.success(`Dəvət kodu yaradıldı: ${code}`);
      setOpen(false);
      await loadStaff();
    } catch (error) {
      toast.error(error.message ?? "Dəvət kodu yaradıla bilmədi");
    } finally {
      setCreating(false);
    }
  }
  async function cancelInvite(inviteId) {
    const {
      error
    } = await supabase.from("masaqr_staff_invites").update({
      status: "expired"
    }).eq("id", inviteId);
    if (error) return toast.error(error.message);
    toast.success("Dəvət ləğv edildi");
    await loadStaff();
  }
  async function deactivateStaff(userId) {
    const {
      error
    } = await supabase.from("masaqr_users").update({
      status: "inactive"
    }).eq("id", userId);
    if (error) return toast.error(error.message);
    toast.success("Ofisiant deaktiv edildi");
    await loadStaff();
  }
  function updateRange(waiterId, patch) {
    setRanges((current) => {
      const existing = current[waiterId] ?? {
        from: "",
        to: ""
      };
      return {
        ...current,
        [waiterId]: {
          ...existing,
          ...patch
        }
      };
    });
  }
  function assignedTablesFor(waiterId) {
    const assignedTableIds = new Set(assignments.filter((assignment) => assignment.waiter_id === waiterId).map((assignment) => assignment.table_id));
    return tables.filter((table) => assignedTableIds.has(table.id));
  }
  async function saveTableRange(waiterId) {
    if (!profile?.restaurant_id) return;
    const range = ranges[waiterId];
    const from = Number(range?.from);
    const to = Number(range?.to);
    if (!Number.isFinite(from) || !Number.isFinite(to) || from <= 0 || to < from) {
      toast.error("Düzgün masa aralığı yazın. Məsələn: 1 - 10");
      return;
    }
    const selectedTables = tables.filter((table) => {
      const number = Number(table.table_number);
      return Number.isFinite(number) && number >= from && number <= to;
    });
    if (selectedTables.length === 0) {
      toast.error("Bu aralıqda masa tapılmadı");
      return;
    }
    setSavingWaiterId(waiterId);
    try {
      const selectedTableIds = selectedTables.map((table) => table.id);
      const {
        error: waiterClearError
      } = await supabase.from("masaqr_waiter_table_assignments").update({
        is_active: false
      }).eq("restaurant_id", profile.restaurant_id).eq("waiter_id", waiterId);
      if (waiterClearError) throw waiterClearError;
      const {
        error: tableClearError
      } = await supabase.from("masaqr_waiter_table_assignments").update({
        is_active: false
      }).eq("restaurant_id", profile.restaurant_id).in("table_id", selectedTableIds);
      if (tableClearError) throw tableClearError;
      const rows = selectedTables.map((table) => ({
        restaurant_id: profile.restaurant_id,
        waiter_id: waiterId,
        table_id: table.id,
        is_active: true
      }));
      const {
        error: insertError
      } = await supabase.from("masaqr_waiter_table_assignments").insert(rows);
      if (insertError) throw insertError;
      toast.success(`${selectedTables.length} masa ofisianta təyin edildi`);
      await loadStaff();
    } catch (error) {
      toast.error(error.message ?? "Masa təyini saxlanmadı");
    } finally {
      setSavingWaiterId(null);
    }
  }
  const activeInvites = invites.filter((invite) => invite.status === "active");
  const inactiveInvites = invites.filter((invite) => invite.status !== "active");
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Ofisiantlar yüklənir…" });
  if (!profile?.restaurant_id) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Ofisiantlar", subtitle: "Ofisiant dəvət etmək üçün əvvəl restoran qurulumunu tamamlayın." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-sm text-muted-foreground", children: "Bu hesaba restoran qoşulmayıb." }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Ofisiantlar", subtitle: "Ofisiantları dəvət edin və masa aralıqlarını təyin edin.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setOpen(true), className: "bg-ember hover:bg-ember/90 text-ember-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
      "Ofisiant dəvət et"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 p-6 xl:grid-cols-[1.2fr_0.8fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold", children: [
              "Komanda (",
              staff.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Restorana bağlı real ofisiant profilləri." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: loadStaff, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCcw, { className: "mr-2 h-4 w-4" }),
            "Yenilə"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          staff.map((member) => {
            const assigned = assignedTablesFor(member.id);
            const range = ranges[member.id] ?? {
              from: "",
              to: ""
            };
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-5 w-5" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: member.full_name || member.email || "Ofisiant" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: member.email })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border px-3 py-1 text-xs", children: "Ofisiant" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border px-3 py-1 text-xs", children: getStatusLabel(member.status) }),
                  member.status !== "inactive" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => deactivateStaff(member.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) }) : null
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-xl border bg-muted/20 p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-sm font-medium", children: "Masa təyini" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-[1fr_1fr_auto]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Başlanğıc masa" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { inputMode: "numeric", value: range.from, onChange: (event) => updateRange(member.id, {
                      from: event.target.value
                    }), placeholder: "1" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Son masa" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { inputMode: "numeric", value: range.to, onChange: (event) => updateRange(member.id, {
                      to: event.target.value
                    }), placeholder: "10" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "self-end", variant: "outline", onClick: () => saveTableRange(member.id), disabled: savingWaiterId === member.id, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-2 h-4 w-4" }),
                    "Saxla"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
                  "Hazırda: ",
                  assigned.length ? assigned.map((table) => table.table_number).join(", ") : "masa təyin edilməyib"
                ] })
              ] })
            ] }, member.id);
          }),
          staff.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground", children: "Hələ ofisiant profili yoxdur. Dəvət kodu yaradın və ofisiant qoşulsun." }) : null
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold", children: [
          "Aktiv dəvətlər (",
          activeInvites.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm text-muted-foreground", children: "Dəvət kodları Supabase-də real saxlanılır." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          activeInvites.map((invite) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Ofisiant" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "Bitmə tarixi: ",
                  invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : "Limitsiz"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => cancelInvite(invite.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
              navigator.clipboard.writeText(invite.code);
              toast.success("Dəvət kodu kopyalandı");
            }, className: "mt-3 flex w-full items-center justify-between rounded-xl border bg-background px-3 py-2 font-mono text-sm hover:bg-muted", children: [
              invite.code,
              /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" })
            ] })
          ] }, invite.id)),
          activeInvites.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground", children: "Aktiv dəvət yoxdur." }) : null
        ] }),
        inactiveInvites.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-sm font-medium text-muted-foreground", children: "Əvvəlki dəvətlər" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: inactiveInvites.slice(0, 5).map((invite) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b pb-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: invite.code }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: getStatusLabel(invite.status) })
          ] }, invite.id)) })
        ] }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Ofisiant dəvət et" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vəzifə" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-full rounded-md border bg-muted px-3 py-2 text-sm", children: "Ofisiant" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Bu əməliyyat Supabase-də real dəvət kodu yaradır. Ofisiant həmin kodla qoşulma səhifəsindən qeydiyyatdan keçə bilər." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Bağla" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: creating, onClick: createInvite, children: creating ? "Yaradılır..." : "Dəvət yarat" })
      ] })
    ] }) })
  ] });
}
function buildRangeDrafts(staff, tables, assignments, current) {
  const result = {
    ...current
  };
  for (const member of staff) {
    if (result[member.id]?.from || result[member.id]?.to) continue;
    const assignedIds = new Set(assignments.filter((assignment) => assignment.waiter_id === member.id).map((assignment) => assignment.table_id));
    const numbers = tables.filter((table) => assignedIds.has(table.id)).map((table) => Number(table.table_number)).filter((number) => Number.isFinite(number)).sort((a, b) => a - b);
    result[member.id] = numbers.length ? {
      from: String(numbers[0]),
      to: String(numbers[numbers.length - 1])
    } : {
      from: "",
      to: ""
    };
  }
  return result;
}
export {
  StaffPage as component
};
