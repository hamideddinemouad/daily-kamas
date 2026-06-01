import { SERVER_OPTIONS, type ServerOption } from "@/lib/constants";

export type EntryActionState = {
  success: boolean;
  message: string;
  error: string;
};

export type WishlistInputResult =
  | { success: true; data: { content: string } }
  | { success: false; error: string };

export type KamasSoldInputResult =
  | {
      success: true;
      data: {
        amount: string;
        kamasQuantity: string;
        pricePerM: string;
      };
    }
  | { success: false; state: EntryActionState };

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

function parseRequiredDecimalField(
  value: FormDataEntryValue | null,
  label: string,
): { ok: true; value: string } | { ok: false; state: EntryActionState } {
  if (typeof value !== "string" || value.trim() === "") {
    return {
      ok: false,
      state: {
        ...emptyActionState,
        error: `${label} is required.`,
      },
    };
  }

  const normalizedValue = value.replace(",", ".").trim();
  const numericValue = Number(normalizedValue);

  if (!Number.isFinite(numericValue)) {
    return {
      ok: false,
      state: {
        ...emptyActionState,
        error: `${label} must be a valid number.`,
      },
    };
  }

  if (numericValue < 0) {
    return {
      ok: false,
      state: {
        ...emptyActionState,
        error: `${label} cannot be negative.`,
      },
    };
  }

  return {
    ok: true,
    value: normalizedValue,
  };
}

export function parseKamasSoldInput(formData: FormData): KamasSoldInputResult {
  const amountResult = parseRequiredDecimalField(formData.get("amount"), "Amount");

  if (!amountResult.ok) {
    return {
      success: false,
      state: amountResult.state,
    };
  }

  const quantityResult = parseRequiredDecimalField(
    formData.get("kamasQuantity"),
    "Kamas quantity",
  );

  if (!quantityResult.ok) {
    return {
      success: false,
      state: quantityResult.state,
    };
  }

  const pricePerMResult = parseRequiredDecimalField(
    formData.get("pricePerM"),
    "Price per M",
  );

  if (!pricePerMResult.ok) {
    return {
      success: false,
      state: pricePerMResult.state,
    };
  }

  return {
    success: true,
    data: {
      amount: amountResult.value,
      kamasQuantity: quantityResult.value,
      pricePerM: pricePerMResult.value,
    },
  };
}
