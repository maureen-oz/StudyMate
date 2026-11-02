import { AppShell } from "@/components/app/app-shell";
import { StudyDataProvider } from "@/components/app/study-data";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudyDataProvider>
      <AppShell>{children}</AppShell>
    </StudyDataProvider>
  );
}
