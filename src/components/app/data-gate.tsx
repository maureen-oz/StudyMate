"use client";

import { Skeleton } from "@/components/ui/spinner";
import { Card, ErrorState } from "@/components/ui/misc";
import { useStudyData } from "./study-data";

/** Shows skeletons while the student's data loads and a retry state if it fails. */
export function DataGate({ children, skeleton = "cards" }: { children: React.ReactNode; skeleton?: "cards" | "list" }) {
  const { status, reload } = useStudyData();

  if (status === "error") {
    return (
      <Card>
        <ErrorState onRetry={reload} />
      </Card>
    );
  }

  if (status === "loading") {
    return (
      <div aria-busy="true" aria-label="Loading your study data">
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="mb-8 h-4 w-80 max-w-full" />
        {skeleton === "cards" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-card" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-card" />
            ))}
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
