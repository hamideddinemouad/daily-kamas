import { MissingServerEntryRow } from "@/components/missing-server-entry-row";
import type { ServerOption } from "@/lib/constants";

type MissingServerEntryListProps = {
  servers: {
    server: ServerOption;
    hasEntryToday: boolean;
  }[];
};

export function MissingServerEntryList({
  servers,
}: MissingServerEntryListProps) {
  if (servers.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {servers.map(({ server, hasEntryToday }) => (
        <MissingServerEntryRow
          key={server}
          server={server}
          hasEntryToday={hasEntryToday}
        />
      ))}
    </div>
  );
}
