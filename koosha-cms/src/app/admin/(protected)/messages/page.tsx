import { listMessages } from "@/lib/models/messages";
import MessageActions from "@/components/admin/MessageActions";
import { formatJalaliDate } from "@/lib/utils";

export default function AdminMessagesPage() {
  const messages = listMessages();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-black text-ink">پیام‌های تماس با ما</h1>
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`admin-card ${!m.isRead ? "border-ink" : ""}`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-black text-ink">{m.name}</span>
                {m.subject && <span className="mr-2 text-sm text-ink/50">— {m.subject}</span>}
              </div>
              <span className="text-xs text-ink/40">{formatJalaliDate(m.createdAt)}</span>
            </div>
            <p className="mb-3 whitespace-pre-line text-sm leading-7 text-ink/75">{m.message}</p>
            <div className="mb-4 flex flex-wrap gap-4 text-xs text-ink/50" dir="ltr">
              {m.phone && <span>{m.phone}</span>}
              {m.email && <span>{m.email}</span>}
            </div>
            <MessageActions id={m.id} isRead={m.isRead} />
          </div>
        ))}
        {messages.length === 0 && <p className="admin-card text-center text-ink/40">پیامی دریافت نشده است.</p>}
      </div>
    </div>
  );
}
