import { getContentFresh } from "@/lib/content/store";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const metadata = { title: "კონტაქტი და ფუტერი" };

export default async function SettingsPage() {
  const { settings } = await getContentFresh();
  return <SettingsEditor initial={settings} />;
}
