"use client";

import { useEffect, useState, useTransition } from "react";

type WishlistItemRecord = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type WishlistCardProps = {
  databaseConfigured: boolean;
};

async function readWishlistItems() {
  const response = await fetch("/api/wishlist", {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    items?: WishlistItemRecord[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to load wishlist items.");
  }

  return payload.items ?? [];
}

export function WishlistCard({ databaseConfigured }: WishlistCardProps) {
  const [content, setContent] = useState("");
  const [items, setItems] = useState<WishlistItemRecord[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isListVisible, setIsListVisible] = useState(false);
  const [isLoading, startLoading] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  useEffect(() => {
    if (!databaseConfigured) {
      return;
    }

    startLoading(async () => {
      try {
        setError("");
        const nextItems = await readWishlistItems();
        setItems(nextItems);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load wishlist items.",
        );
      }
    });
  }, [databaseConfigured]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startSaving(async () => {
      try {
        setError("");
        setSuccess("");

        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        });

        const payload = (await response.json()) as {
          item?: WishlistItemRecord;
          error?: string;
        };

        if (!response.ok || !payload.item) {
          throw new Error(payload.error ?? "Unable to save wishlist item.");
        }

        setItems((currentItems) => [payload.item!, ...currentItems].slice(0, 8));
        setContent("");
        setSuccess("Wishlist idea saved.");
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "Unable to save wishlist item.",
        );
      }
    });
  }

  function handleTextareaKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();

    const form = event.currentTarget.form;

    if (!form || isBusy || !databaseConfigured || content.trim().length === 0) {
      return;
    }

    form.requestSubmit();
  }

  function handleDelete(id: string) {
    startDeleting(async () => {
      try {
        setError("");
        setSuccess("");

        const response = await fetch(`/api/wishlist/${id}`, {
          method: "DELETE",
        });

        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to delete wishlist item.");
        }

        setItems((currentItems) =>
          currentItems.filter((item) => item.id !== id),
        );
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "Unable to delete wishlist item.",
        );
      }
    });
  }

  const isBusy = isLoading || isSaving || isDeleting;

  return (
    <section className="rounded-[1.6rem] border border-stone-200/80 bg-stone-50/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-34px_rgba(68,46,20,0.32)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Wishlist
          </p>
          <h3 className="mt-2 text-base font-semibold text-stone-900">
            Future feature notes
          </h3>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            A quiet place for ideas you want to build later.
          </p>
        </div>
        <span className="rounded-full border border-stone-200 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-stone-500">
          {items.length} saved
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="space-y-2">
          <span className="sr-only">Wishlist idea</span>
          <textarea
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleTextareaKeyDown}
            rows={3}
            maxLength={280}
            placeholder="Add a small future feature idea..."
            disabled={!databaseConfigured || isBusy}
            className="min-h-24 w-full resize-y rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
          />
        </label>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-stone-500">{content.trim().length}/280</p>
          <button
            type="submit"
            disabled={!databaseConfigured || isBusy || content.trim().length === 0}
            className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-400"
          >
            {isSaving ? "Saving..." : "Save idea"}
          </button>
        </div>
      </form>

      {error ? (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      {!databaseConfigured ? (
        <p className="mt-3 rounded-2xl border border-amber-300 bg-amber-100/80 px-4 py-3 text-sm text-amber-950">
          Add your Neon `DATABASE_URL` in `.env` to save wishlist ideas.
        </p>
      ) : null}

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setIsListVisible((currentValue) => !currentValue)}
          className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
          aria-expanded={isListVisible}
        >
          {isListVisible ? "Hide wishes" : "Show wishes"}
        </button>

        {isListVisible ? (
          <div className="mt-3 space-y-2">
            {items.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-300 bg-white/65 px-4 py-4 text-sm text-stone-500">
                {isLoading ? "Loading wishlist..." : "No future ideas saved yet."}
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-stone-200 bg-white/85 px-4 py-3"
                >
                  <div>
                    <p className="text-sm leading-6 text-stone-800">{item.content}</p>
                    <p className="mt-1 text-xs text-stone-400">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={isBusy}
                    className="shrink-0 rounded-full border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-500 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:text-stone-300"
                    aria-label={`Delete wishlist item: ${item.content}`}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
