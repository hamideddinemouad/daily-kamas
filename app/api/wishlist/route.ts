import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/api-auth";
import { createWishlistItem, listWishlistItems } from "@/lib/wishlist";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await listWishlistItems();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to list wishlist items", error);
    return NextResponse.json(
      { error: "Unable to load wishlist items right now." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { content?: unknown };
    const result = await createWishlistItem(body.content);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ item: result.item }, { status: 201 });
  } catch (error) {
    console.error("Failed to create wishlist item", error);
    return NextResponse.json(
      { error: "Unable to save the wishlist item right now." },
      { status: 500 },
    );
  }
}
