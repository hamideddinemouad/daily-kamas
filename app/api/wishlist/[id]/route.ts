import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/api-auth";
import { deleteWishlistItem } from "@/lib/wishlist";

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/wishlist/[id]">,
) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const result = await deleteWishlistItem(id);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete wishlist item", error);
    return NextResponse.json(
      { error: "Unable to delete the wishlist item right now." },
      { status: 500 },
    );
  }
}
