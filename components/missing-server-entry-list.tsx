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
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-stone-950">
          Server Entries For Today
        </h3>
        <p className="mt-1 text-sm text-stone-600">
          Every server stays visible here. A green dot means that server already
          has at least one revenue entry saved for today.
        </p>
      </div>

      <div className="space-y-3">
        {servers.map(({ server, hasEntryToday }) => (
          <MissingServerEntryRow
            key={server}
            server={server}
            hasEntryToday={hasEntryToday}
          />
        ))}
      </div>
    </div>
  );
}
