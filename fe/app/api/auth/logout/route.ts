import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    // Delete the auth cookie
    const cookieStore = await cookies();
    cookieStore.delete("token");

    return NextResponse.json({
        status: "success",
    });
}
