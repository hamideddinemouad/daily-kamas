import { SERVER_OPTIONS, type ServerOption } from "@/lib/constants";

export type EntryActionState = {
  success: boolean;
  message: string;
  error: string;
};

export type WishlistInputResult =
  | { success: true; data: { content: string } }
  | { success: false; error: string };

export const emptyActionState: EntryActionState = {
  success: false,
  message: "",
  error: "",
};

export function parseEntryInput(formData: FormData):
  | { success: true; data: { server: ServerOption; revenu: string } }
  | { success: false; state: EntryActionState } {
  const server = formData.get("server");
  const revenu = formData.get("revenu");

  if (typeof server !== "string" || server.trim() === "") {
    return {
      success: false,
      state: {
        ...emptyActionState,
        error: "Server is required.",
      },
    };
  }

  if (!SERVER_OPTIONS.includes(server as ServerOption)) {
    return {
      success: false,
      state: {
        ...emptyActionState,
        error: "Server selection is invalid.",
      },
    };
  }

  if (typeof revenu !== "string" || revenu.trim() === "") {
    return {
      success: false,
      state: {
        ...emptyActionState,
        error: "Revenu is required.",
      },
    };
  }

  const normalizedRevenu = revenu.replace(",", ".").trim();
  const numericValue = Number(normalizedRevenu);

  if (!Number.isFinite(numericValue)) {
    return {
      success: false,
      state: {
        ...emptyActionState,
        error: "Revenu must be a valid number.",
      },
    };
  }

  return {
    success: true,
    data: {
      server: server as ServerOption,
      revenu: normalizedRevenu,
    },
  };
}

export function parseWishlistInput(content: unknown): WishlistInputResult {
  if (typeof content !== "string") {
    return {
      success: false,
      error: "Wishlist text is required.",
    };
  }

  const normalizedContent = content.trim().replace(/\s+/g, " ");

  if (normalizedContent.length === 0) {
    return {
      success: false,
      error: "Wishlist text is required.",
    };
  }

  if (normalizedContent.length > 280) {
    return {
      success: false,
      error: "Wishlist text must stay under 280 characters.",
    };
  }

  return {
    success: true,
    data: {
      content: normalizedContent,
    },
  };
}
