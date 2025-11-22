import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { updateProfileSchema } from "@/features/user/schemas/user.schemas";
import {
  getUserProfileService,
  updateUserProfileService,
} from "@/features/user/services/user.service";
import { isErr } from "@/shared/lib/errors/core/result";

/**
 * GET /api/user/profile
 * Get authenticated user's profile
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getUserProfileService(session.user.id);

    if (isErr(result)) {
      return NextResponse.json({ error: result.error.message }, { status: result.error.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

/**
 * PATCH /api/user/profile
 * Update authenticated user's profile
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const result = await updateUserProfileService(session.user.id, validation.data);

    if (isErr(result)) {
      return NextResponse.json({ error: result.error.message }, { status: result.error.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
