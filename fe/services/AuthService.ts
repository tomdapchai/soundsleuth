import api from "@/api";
import { AuthResponse } from "@/types";

export const Login = async (
    username: string,
    password: string
): Promise<AuthResponse> => {
    const response = await api.post("/verification/login", {
        username,
        password,
    });
    return {
        status: "success",
        token: response.data.token,
        userId: response.data.userId,
    };
};

export const Register = async (
    username: string,
    password: string
): Promise<AuthResponse | null> => {
    const response = await api.post("/verification/register", {
        username,
        password,
    });
    return {
        status: "success",
        token: response.data.token,
        userId: response.data.userId,
    };
};
