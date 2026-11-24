import { Suspense } from "react";
import { SettingsPageContent } from "@/components/settings/SettingsPageContent";
export default function Page() { return <Suspense fallback={null}><SettingsPageContent /></Suspense>; }
