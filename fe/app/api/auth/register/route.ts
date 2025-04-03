import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Register as RegisterService } from "@/services/AuthService";

export async function POST(request: Request) {
    const body = await request.json();
    const { username, password } = body;

    const response = await RegisterService(username, password);
    const cookieStore = await cookies();

    if (response?.status === "success") {
        // Set HTTP-only cookie from the server
        cookieStore.set({
            name: "token",
            value: response.token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60, // 1 hour
            path: "/",
            sameSite: "strict",
        });

        return NextResponse.json({
            status: "success",
            userId: response.userId,
        });
    }

    return NextResponse.json(
        {
            status: "error",
            message: "Registration failed",
        },
        { status: 400 }
    );
}
