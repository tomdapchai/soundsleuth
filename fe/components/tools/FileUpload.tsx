"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { AudioProcess } from "@/utils/AudioProcess";
import MusicContainer from "../MusicContainer";
import { findMusics } from "@/services/FindMusicService";
import { PlaylistResult } from "@/types";
import { set } from "zod";

const allowedFormats = [".mp3", ".wav", ".m4a", ".flac", ".ogg", ".aac"];

export function FileUpload() {
    const [files, setFiles] = useState<File[]>([]);
    const [processedFiles, setProcessedFiles] = useState<File[]>([]);
    const [recognizedSongs, setRecognizedSongs] = useState<PlaylistResult>();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const processAudio = async () => {
        if (files.length === 0) {
            setError("Please upload some files first.");
            return;
        }
        setIsProcessing(true);
        setError(null);

        try {
            // Process the audio files
            const processed = await AudioProcess(files);
            setProcessedFiles(processed);
            console.log("Processed files:", processed);

            // Use the processed files directly instead of from state
            const results = await findMusics(processed);
            setRecognizedSongs(results);
        } catch (error) {
            console.error("Error during processing:", error);
            setError("An error occurred while processing. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: any[]) => {
            setError(null);

            const validFiles = acceptedFiles.filter((file) =>
                allowedFormats.some((format) =>
                    file.name.toLowerCase().endsWith(format)
                )
            );

            if (
                rejectedFiles.length > 0 ||
                validFiles.length !== acceptedFiles.length
            ) {
                setError(
                    "Some files were rejected. Please only upload allowed music file formats."
                );
            }

            setFiles((prevFiles) => [...prevFiles, ...validFiles]);
        },
        []
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    const removeFile = (fileToRemove: File) => {
        setFiles(files.filter((file) => file !== fileToRemove));
    };

    return (
        <div className="w-full flex flex-col justify-start items-center space-y-4">
            <Card className="p-8 w-full mx-auto">
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                        isDragActive
                            ? "border-primary bg-primary/10"
                            : "border-gray-300"
                    }`}>
                    <input {...getInputProps()} />
                    <p className="text-lg mb-4">
                        Drop your music files here or click to select
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        Supported formats: {allowedFormats.join(", ")}
                    </p>
                    <Button variant="outline">Select Files</Button>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                {files.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Uploaded Files:</h3>
                        <ul className="space-y-2">
                            {files.map((file, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                    <span className="truncate">
                                        {file.name}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(file)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Card>
            <Button
                disabled={isProcessing}
                className={`w-1/2 text-md ${
                    isProcessing ? "cursor-none bg-slate-400" : ""
                }`}
                onClick={processAudio}>
                {isProcessing ? "Processing..." : "Process Audio"}
            </Button>
            <div className="w-full flex justify-center items-center">
                <MusicContainer
                    files={processedFiles}
                    names={recognizedSongs?.results || []}
                />
            </div>
            <div className="w-full flex justify-center items-center">
                <div className="w-full flex justify-center items-center">
                    <h1 className="font-bold text-lg"></h1>
                    <a
                        href={recognizedSongs?.playlist}
                        target="_blank"
                        rel="noreferrer">
                        <Button
                            className="ml-2 text-lg font-bold text-green-400"
                            variant="link">
                            Open Playlist
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
}
