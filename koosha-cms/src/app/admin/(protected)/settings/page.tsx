import SettingsForm from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/models/settings";

export default function AdminSettingsPage() {
  const settings = getSettings();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-black text-ink">تنظیمات و سئو</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
