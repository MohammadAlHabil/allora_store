import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { changePasswordSchema } from "@/features/user/schemas/user.schemas";
import { changeUserPasswordService } from "@/features/user/services/user.service";
import { isErr } from "@/shared/lib/errors/core/result";

/**
 * POST /api/user/password
 * Change authenticated user's password
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const result = await changeUserPasswordService(session.user.id, validation.data);

    if (isErr(result)) {
      return NextResponse.json({ error: result.error.message }, { status: result.error.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
