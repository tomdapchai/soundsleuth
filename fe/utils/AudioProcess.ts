import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

/**
 * Process audio files: trim to first 15 seconds and compress to 128kbps if needed
 * @param files - Array of File objects to process
 * @returns Promise with array of processed Files
 */
export async function AudioProcess(files: File[]): Promise<File[]> {
    const ffmpeg = new FFmpeg();
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

    // Load ffmpeg
    await ffmpeg.load({
        coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            "text/javascript"
        ),
        wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            "application/wasm"
        ),
    });

    const processedFiles: File[] = [];

    for (const file of files) {
        try {
            const fileName = file.name;
            const fileNameWithoutExt = fileName.substring(
                0,
                fileName.lastIndexOf(".")
            );
            const fileExt = fileName.substring(fileName.lastIndexOf("."));
            const tempName = `temp_${Date.now()}${fileExt}`;
            const infoTextFile = `info_${Date.now()}.txt`;

            // Write the file to FFmpeg's virtual file system
            await ffmpeg.writeFile(tempName, await fetchFile(file));

            // Get bitrate info using ffprobe and redirect to a text file
            await ffmpeg.ffprobe([
                "-v",
                "error",
                "-select_streams",
                "a:0",
                "-show_entries",
                "stream=bit_rate",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                tempName,
                "-o",
                infoTextFile,
            ]);

            // Read the bitrate from the text file
            const bitrateText = await ffmpeg.readFile(infoTextFile);
            const currentBitrate =
                parseInt(bitrateText.toString().trim() || "0") / 1000; // Convert to kbps

            // Clean up the info file
            await ffmpeg.deleteFile(infoTextFile);

            // Set output name - keep original name but make it unique
            const outputName = `${fileNameWithoutExt}_processed_${Date.now()}.mp3`;

            // Trim to 15 seconds and compress to 128kbps
            await ffmpeg.exec([
                "-ss",
                "00:00:30",
                "-to",
                "00:00:45",
                "-i",
                tempName,
                "-vn",
                "-ar",
                "44100",
                "-ac",
                "2",
                "-map",
                "0:a:0",
                "-b:a",
                "128k",
                outputName,
            ]);

            // Read the processed file
            const processedData = await ffmpeg.readFile(outputName);

            // Create a proper File object with explicit type and name
            const blob = new Blob([processedData], { type: "audio/mpeg" });
            const processedFile = new File([blob], outputName, {
                type: "audio/mpeg",
            });

            // Clean up temporary files
            await ffmpeg.deleteFile(tempName);
            await ffmpeg.deleteFile(outputName);

            processedFiles.push(processedFile);
        } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            // Continue with next file instead of breaking the entire process
        }
    }

    return processedFiles;
}
