"use client";
import React from "react";
import { useState, useEffect } from "react";

const MusicContainer = ({ files }: { files: File[] }) => {
    return (
        <div className="border-black border w-[600px] h-[400px] overflow-y-auto">
            {files.length > 0 ? (
                <div className="flex flex-col space-y-2 p-2">
                    {files.map((file, index) => (
                        <audio key={index} controls>
                            <source src={URL.createObjectURL(file)} />
                        </audio>
                    ))}
                </div>
            ) : (
                <div>No files uploaded</div>
            )}
        </div>
    );
};

export default MusicContainer;
