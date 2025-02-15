import api from "@/api";

export const findMusics = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file);
    });

    try {
        const response = await api.post("/services/find-music", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.results;
    } catch (error) {
        console.error("Recognition error:", error);
        return files.map(() => "Recognition failed");
    }
};
