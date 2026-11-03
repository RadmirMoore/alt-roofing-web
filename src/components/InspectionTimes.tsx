import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { newId } from "../lib/ids";

// After the estimate form is saved in ALT's CRM, the homeowner can pick a real
// inspection time from the CRM's calendar (or skip and wait for a call). The
// request token lives in an HttpOnly cookie; these calls only send dates.

type Time = { date: string; time: string; end_time: string };
type Booking = { status: string; date: string; time: string; end_time: string };
type BookAnswer = {
  ok?: boolean;
  booking?: Booking | null;
  property?: { street?: string; city?: string };
  unavailable?: boolean;
  alternatives?: Time[];
  reason?: string;
  error?: string;
  unsure?: boolean;
  expired?: boolean;
};

const PHONE = "(213) 415-6146";
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Dates are Pacific calendar days ("2026-11-09"); read them without time zones.
function parts(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return { y, m, d, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}
const longDate = (day: string) => {
  const p = parts(day);
  return `${WEEKDAYS[p.weekday]}, ${MONTHS[p.m - 1]} ${p.d}`;
};
const clock = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
function pacificToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());
}
function addDays(day: string, n: number): string {
  const p = parts(day);
  return new Date(Date.UTC(p.y, p.m - 1, p.d + n)).toISOString().slice(0, 10);
}

async function post(path: string, body: unknown): Promise<BookAnswer & { times?: Time[] }> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await response.json();
  } catch {
    return { ok: false, unsure: true, error: "We couldn't reach our booking system." };
  }
}

export function InspectionTimes({
  addressConfirmed,
  doneTitle,
  doneBody,
}: {
  addressConfirmed: boolean;
  doneTitle: string;
  doneBody: string;
}) {
  const [times, setTimes] = useState<Time[] | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [chosen, setChosen] = useState<(Time & { requestId: string }) | null>(null);
  const [booked, setBooked] = useState<Booking | null>(null);
  const [skipped, setSkipped] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    const today = pacificToday();
    post("/api/crm/times", { from: today, to: addDays(today, 31) }).then((r) => {
      if (!live) return;
      if (r.ok && r.times) {
        setTimes(r.times);
        setDay(r.times[0]?.date ?? null);
      } else {
        setNotice(r.error ?? "We couldn't load the available times.");
        setTimes([]);
      }
    });
    return () => {
      live = false;
    };
  }, []);

  const days = useMemo(() => {
    const m = new Map<string, Time[]>();
    for (const t of times ?? []) m.set(t.date, [...(m.get(t.date) ?? []), t]);
    return m;
  }, [times]);

  const confirm = async () => {
    if (!chosen || busy) return;
    setBusy(true);
    setNotice("");
    let r = await post("/api/crm/book", { request_id: chosen.requestId, date: chosen.date, time: chosen.time });
    // The answer was lost: ask the CRM what it holds before saying anything.
    if (r.unsure) {
      const check = await post("/api/crm/book", { check: true });
      const session = (check as { session?: BookAnswer | null }).session;
      if (check.ok && session?.booking?.status === "confirmed") r = { ok: true, booking: session.booking };
    }
    setBusy(false);
    if (r.ok && r.booking?.status === "confirmed") {
      setBooked(r.booking);
    } else if (r.unavailable) {
      setChosen(null);
      setTimes(r.alternatives ?? []);
      setDay(r.alternatives?.[0]?.date ?? null);
      setNotice(r.reason ?? "That time was just taken. Here are the times still open.");
    } else {
      setNotice(
        r.unsure
          ? "We couldn't confirm your time. Please press Confirm again — you won't be booked twice."
          : (r.error ?? `We couldn't book this time online. Please call ${PHONE}.`),
      );
    }
  };

  if (booked) {
    return (
      <div className="py-8 text-center" role="status">
        <CalendarCheck className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
        <h3 className="mt-4 font-display text-2xl font-bold">Your free inspection is booked</h3>
        <p className="mt-3 text-lg font-semibold">
          {longDate(booked.date)}, {clock(booked.time)} – {clock(booked.end_time)}
        </p>
        <p className="mt-1 text-sm text-foreground/60">Pacific time</p>
        <p className="mt-4 text-foreground/70">
          Need to change it? Call us at <a className="font-semibold text-primary" href="tel:+12134156146">{PHONE}</a>.
        </p>
      </div>
    );
  }

  if (skipped || (times !== null && times.length === 0)) {
    return (
      <div className="py-8 text-center" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
        <h3 className="mt-4 font-display text-2xl font-bold">{doneTitle}</h3>
        <p className="mt-3 text-foreground/70">
          {skipped ? "" : "There are no online times open right now. "}
          Our office will call you to schedule your free inspection.
        </p>
        <p className="mt-2 text-foreground/70">{doneBody}</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden="true" />
      <h3 className="mt-3 font-display text-2xl font-bold">Thanks! Now pick a time for your free inspection</h3>
      <p className="mt-2 text-sm text-foreground/70">
        Your request is saved. Choose a time below, or skip and our office will call you. All times are Pacific time.
        {addressConfirmed ? "" : " We'll double-check your address before the visit."}
      </p>

      {notice ? (
        <p className="mt-4 text-sm text-primary" role="alert">
          {notice}
        </p>
      ) : null}

      {times === null ? (
        <p className="mt-6 text-foreground/60" role="status">
          Loading available times…
        </p>
      ) : chosen ? (
        <div className="mt-6 rounded-xl border border-border bg-background/50 p-5">
          <p className="text-sm text-foreground/60">You chose</p>
          <p className="mt-1 text-lg font-semibold">
            {longDate(chosen.date)}, {clock(chosen.time)} – {clock(chosen.end_time)}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? "Booking…" : "Confirm this time"}
            </button>
            <button
              type="button"
              onClick={() => setChosen(null)}
              disabled={busy}
              className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold transition hover:bg-foreground/5 disabled:opacity-60"
            >
              Pick another time
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="Dates with open times">
            {[...days.keys()].map((d) => {
              const p = parts(d);
              const active = d === day;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  aria-pressed={active}
                  className={`flex min-w-[4.5rem] flex-col items-center rounded-xl border px-3 py-2 text-sm transition ${
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-foreground/5"
                  }`}
                >
                  <span className="text-xs">{WEEKDAYS[p.weekday].slice(0, 3)}</span>
                  <span className="font-semibold">
                    {MONTHS[p.m - 1].slice(0, 3)} {p.d}
                  </span>
                </button>
              );
            })}
          </div>
          {day ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label={`Open times on ${longDate(day)}`}>
              {(days.get(day) ?? []).map((t) => (
                <button
                  key={t.time}
                  type="button"
                  onClick={() => {
                    setNotice("");
                    setChosen({ ...t, requestId: newId() });
                  }}
                  className="h-11 rounded-lg border border-border text-sm font-semibold transition hover:border-primary hover:bg-foreground/5"
                >
                  {clock(t.time)}
                </button>
              ))}
            </div>
          ) : null}
        </>
      )}

      {chosen || times === null ? null : (
        <button
          type="button"
          onClick={() => setSkipped(true)}
          className="mt-6 text-sm font-semibold text-foreground/70 underline underline-offset-4 hover:text-foreground"
        >
          Skip — have the office call me instead
        </button>
      )}
    </div>
  );
}
