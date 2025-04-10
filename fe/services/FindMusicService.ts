"use server";
import api from "@/api";
import { PlaylistResult } from "@/types";
import { cookies } from "next/headers";

export const findMusics = async (files: File[]): Promise<PlaylistResult> => {
    const formData = new FormData();

    // Add each file to form data with a unique name to avoid conflicts
    files.forEach((file, index) => {
        formData.append(`files`, file, `file_${index}_${file.name}`);
    });

    try {
        // Explicitly set the content type to undefined to let the browser set it with the boundary
        const response = await api.post("/services/find-music", formData, {
            headers: {
                // Don't manually set Content-Type - let axios set it with the boundary
                Authorization: `Bearer ${
                    (await cookies()).get("token")?.value
                }`,
            },
            // Add timeout and retry config
            timeout: 300000,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
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
