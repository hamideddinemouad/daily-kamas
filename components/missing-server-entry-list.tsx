import { MissingServerEntryRow } from "@/components/missing-server-entry-row";
import type { ServerOption } from "@/lib/constants";

type MissingServerEntryListProps = {
  servers: ServerOption[];
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
          Missing Entries For Today
        </h3>
        <p className="mt-1 text-sm text-stone-600">
          Fill these servers in order first. Once every server has an entry for
          today, the normal dropdown form will come back.
        </p>
      </div>

      <div className="space-y-3">
        {servers.map((server) => (
          <MissingServerEntryRow key={server} server={server} />
        ))}
      </div>
    </div>
  );
}
