import { db, initDb } from "../db";
import { genId } from "../utils";

initDb();

export interface Agency {
  id: string;
  name: string;
  city: string;
  province: string;
  ownerName: string;
  code: string;
  address: string;
  phone: string;
  phone2: string;
  postalCode: string;
  workHours: string;
  coveredCars: string;
  type: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: any): Agency {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    province: row.province,
    ownerName: row.owner_name,
    code: row.code,
    address: row.address,
    phone: row.phone,
    phone2: row.phone2,
    postalCode: row.postal_code,
    workHours: row.work_hours,
    coveredCars: row.covered_cars,
    type: row.type,
    sortOrder: row.sort_order,
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listAgencies({ onlyActive = false }: { onlyActive?: boolean } = {}): Agency[] {
  const rows = onlyActive
    ? db.prepare("SELECT * FROM agencies WHERE is_active = 1 ORDER BY city ASC, sort_order ASC").all()
    : db.prepare("SELECT * FROM agencies ORDER BY city ASC, sort_order ASC").all();
  return rows.map(mapRow);
}

export function getAgencyById(id: string): Agency | null {
  const row = db.prepare("SELECT * FROM agencies WHERE id = ?").get(id);
  return row ? mapRow(row) : null;
}

export interface AgencyInput {
  name: string;
  city: string;
  province?: string;
  ownerName?: string;
  code?: string;
  address?: string;
  phone?: string;
  phone2?: string;
  postalCode?: string;
  workHours?: string;
  coveredCars?: string;
  type?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export function createAgency(input: AgencyInput): Agency {
  const id = genId();
  db.prepare(
    `INSERT INTO agencies (id, name, city, province, owner_name, code, address, phone, phone2, postal_code, work_hours, covered_cars, type, sort_order, is_active)
     VALUES (@id, @name, @city, @province, @ownerName, @code, @address, @phone, @phone2, @postalCode, @workHours, @coveredCars, @type, @sortOrder, @isActive)`
  ).run({
    id,
    name: input.name,
    city: input.city,
    province: input.province || "",
    ownerName: input.ownerName || "",
    code: input.code || "",
    address: input.address || "",
    phone: input.phone || "",
    phone2: input.phone2 || "",
    postalCode: input.postalCode || "",
    workHours: input.workHours || "",
    coveredCars: input.coveredCars || "",
    type: input.type || "عاملیت فروش و خدمات پس از فروش",
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive === false ? 0 : 1,
  });
  return getAgencyById(id)!;
}

export function updateAgency(id: string, input: Partial<AgencyInput>): Agency | null {
  const current = getAgencyById(id);
  if (!current) return null;
  db.prepare(
    `UPDATE agencies SET name=@name, city=@city, province=@province, owner_name=@ownerName, code=@code, address=@address, phone=@phone, phone2=@phone2, postal_code=@postalCode, work_hours=@workHours, covered_cars=@coveredCars, type=@type, sort_order=@sortOrder, is_active=@isActive, updated_at=datetime('now')
     WHERE id=@id`
  ).run({
    id,
    name: input.name ?? current.name,
    city: input.city ?? current.city,
    province: input.province ?? current.province,
    ownerName: input.ownerName ?? current.ownerName,
    code: input.code ?? current.code,
    address: input.address ?? current.address,
    phone: input.phone ?? current.phone,
    phone2: input.phone2 ?? current.phone2,
    postalCode: input.postalCode ?? current.postalCode,
    workHours: input.workHours ?? current.workHours,
    coveredCars: input.coveredCars ?? current.coveredCars,
    type: input.type ?? current.type,
    sortOrder: input.sortOrder ?? current.sortOrder,
    isActive: input.isActive === undefined ? (current.isActive ? 1 : 0) : input.isActive ? 1 : 0,
  });
  return getAgencyById(id);
}

export function deleteAgency(id: string) {
  db.prepare("DELETE FROM agencies WHERE id = ?").run(id);
}

export function listCities(): string[] {
  const rows = db
    .prepare("SELECT DISTINCT city FROM agencies WHERE is_active = 1 ORDER BY city ASC")
    .all() as { city: string }[];
  return rows.map((r) => r.city);
}
