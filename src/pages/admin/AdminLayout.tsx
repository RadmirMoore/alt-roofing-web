import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import { clearAdminToken, fetchLeads, getAdminToken } from "../../lib/admin-api";
import { LoginForm } from "../../components/admin/LoginForm";

type AdminOutletContext = {
  /** Called by a child view when a request 401s, to drop back to the login screen. */
  onSessionExpired: () => void;
};

export function useAdminOutlet() {
  return useOutletContext<AdminOutletContext>();
}

const TAB_BASE =
  "-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition";

function tabClass({ isActive }: { isActive: boolean }) {
  return `${TAB_BASE} ${
    isActive
      ? "border-primary text-foreground"
      : "border-transparent text-foreground/55 hover:text-foreground"
  }`;
}

export function AdminLayout() {
  const [authed, setAuthed] = useState(Boolean(getAdminToken()));
  const [newLeads, setNewLeads] = useState(0);

  useEffect(() => {
    document.title = "ALT Roofing Admin";
    return () => {
      document.title =
        "ALT Roofing Solutions | Los Angeles Roofing Contractor — Repair, Replacement & Free Estimates";
    };
  }, []);

  // Keep the "new leads" badge fresh so the operator sees fresh inbound work
  // regardless of which tab they are on.
  useEffect(() => {
    if (!authed) return;
    let active = true;
    const refresh = () =>
      fetchLeads({ status: "new" })
        .then((data) => {
          if (active) setNewLeads(data.total);
        })
        .catch(() => {});
    void refresh();
    const id = window.setInterval(refresh, 60_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [authed]);

  if (!authed) {
    return <LoginForm onSuccess={() => setAuthed(true)} />;
  }

  const context: AdminOutletContext = {
    onSessionExpired: () => setAuthed(false),
  };

  return (
    <div className="min-h-screen bg-background px-5 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs uppercase tracking-[0.25em] text-foreground/50">
            ALT Roofing Admin
          </div>
          <button
            type="button"
            onClick={() => {
              clearAdminToken();
              setAuthed(false);
            }}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm transition hover:border-primary/40"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </button>
        </div>

        <nav className="mt-4 flex gap-1 border-b border-border">
          <NavLink to="/admin" end className={tabClass}>
            Analytics
          </NavLink>
          <NavLink to="/admin/leads" className={tabClass}>
            Leads
            {newLeads > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {newLeads}
              </span>
            ) : null}
          </NavLink>
          <NavLink to="/admin/chats" className={tabClass}>
            Chats
          </NavLink>
        </nav>

        <div className="mt-8">
          <Outlet context={context} />
        </div>
      </div>
    </div>
  );
}
