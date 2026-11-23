import type { Agency } from "@/lib/models/agencies";

export default function AgencyCard({ agency }: { agency: Agency }) {
  return (
    <div className="card-kh flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="section-eyebrow mb-1">{agency.city}</span>
          <h3 className="text-lg font-black text-ink">{agency.name}</h3>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M5 21V7l8-4 8 4v14M9 9h.01M9 13h.01M15 9h.01M15 13h.01M10 21v-4h4v4" />
          </svg>
        </span>
      </div>

      <p className="text-sm font-bold text-ink/50">{agency.type}</p>

      {agency.address && (
        <div className="flex items-start gap-2 text-sm text-ink/70">
          <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span>{agency.address}</span>
        </div>
      )}

      {agency.phone && (
        <div className="flex items-center gap-2 text-sm text-ink/70">
          <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <a href={`tel:${agency.phone.replace(/[^0-9+]/g, "")}`} className="font-bold text-ink hover:underline" dir="ltr">
            {agency.phone}
          </a>
          {agency.phone2 && (
            <>
              {" / "}
              <a href={`tel:${agency.phone2.replace(/[^0-9+]/g, "")}`} className="font-bold text-ink hover:underline" dir="ltr">
                {agency.phone2}
              </a>
            </>
          )}
        </div>
      )}

      {agency.workHours && (
        <div className="flex items-start gap-2 text-xs text-ink/50">
          <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          <span>{agency.workHours}</span>
        </div>
      )}

      {agency.coveredCars && (
        <div className="border-t border-line pt-3 text-xs text-ink/50">
          خودروهای تحت پوشش: <span className="font-bold text-ink/70">{agency.coveredCars}</span>
        </div>
      )}
    </div>
  );
}
