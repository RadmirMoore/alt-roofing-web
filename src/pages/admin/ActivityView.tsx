import { ActivityPanel } from "../../components/admin/ActivityPanel";

export function ActivityView() {
  return (
    <div>
      <div>
        <h1 className="font-display text-4xl font-bold">Activity</h1>
        <p className="mt-2 text-sm text-foreground/65">
          One timeline of every inbound contact — forms, AI-chat leads, and call
          attempts — with the traffic source each came from.
        </p>
      </div>
      <div className="mt-8">
        <ActivityPanel />
      </div>
    </div>
  );
}
