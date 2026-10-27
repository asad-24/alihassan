import { getDb, isDatabaseConfigured } from "./db";
import type { StoreSettings } from "./types";
export const defaultSettings: StoreSettings = {
  phone: "+923016922212",
  whatsapp: "923016922212",
  email: "",
  address: "",
  openingHours: "",
  returnPolicy: "",
};
export async function getSettings(): Promise<StoreSettings> {
  if (!isDatabaseConfigured()) return defaultSettings;
  const data = await (
    await getDb()
  )
    .collection<StoreSettings & { _id: string }>("settings")
    .findOne({ _id: "store" }, { projection: { _id: 0 } });
  return { ...defaultSettings, ...data };
}
