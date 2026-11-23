import { notFound } from "next/navigation";
import AgencyForm from "@/components/admin/AgencyForm";
import { getAgencyById } from "@/lib/models/agencies";

export default function EditAgencyPage({ params }: { params: { id: string } }) {
  const agency = getAgencyById(params.id);
  if (!agency) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-black text-ink">ویرایش عاملیت: {agency.name}</h1>
      <AgencyForm agency={agency} />
    </div>
  );
}
