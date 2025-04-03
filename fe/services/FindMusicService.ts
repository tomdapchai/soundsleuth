"use server";
import api from "@/api";
import { PlaylistResult } from "@/types";
import { cookies } from "next/headers";

export const findMusics = async (files: File[]): Promise<PlaylistResult> => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file);
    });

    try {
        const response = await api.post("/services/find-music", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${
                    (await cookies()).get("token")?.value
                }`,
            },
        });
        return {
            results: response.data.results,
            playlist: response.data.playlist,
        };
    } catch (error) {
        console.error("Recognition error:", error);
        return { results: files.map(() => "Recognition failed"), playlist: "" };
    }
};
