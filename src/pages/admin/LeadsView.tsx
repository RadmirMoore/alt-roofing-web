import { LeadsPanel } from "../../components/admin/LeadsPanel";

export function LeadsView() {
  return (
    <div>
      <div>
        <h1 className="font-display text-4xl font-bold">Leads</h1>
        <p className="mt-2 text-sm text-foreground/65">
          Every form and AI-chat submission, with status, notes, and export.
        </p>
      </div>
      <div className="mt-8">
        <LeadsPanel />
      </div>
    </div>
  );
}
