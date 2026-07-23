import { ChatsPanel } from "../../components/admin/ChatsPanel";

export function ChatsView() {
  return (
    <div>
      <div>
        <h1 className="font-display text-4xl font-bold">AI chat logs</h1>
        <p className="mt-2 text-sm text-foreground/65">
          Full AI-assistant conversations — see which dialogs turned into leads.
        </p>
      </div>
      <div className="mt-8">
        <ChatsPanel />
      </div>
    </div>
  );
}
