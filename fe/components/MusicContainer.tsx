"use client";
import React from "react";
import { useState, useEffect } from "react";

interface MusicContainerProps {
    files: File[];
    names: string[];
}

const MusicContainer = ({ files, names }: MusicContainerProps) => {
    return (
        <div className="w-full flex justify-between items-center h-[400px] overflow-y-auto">
            <div className="border-black border w-[600px] h-[400px] overflow-y-auto flex flex-col">
                <div className="flex flex-col w-full">
                    <div className="flex justify-center items-center w-full">
                        <h1 className="font-bold text-lg">
                            Proccessed Audio files:
                        </h1>
                    </div>
                    {files.length > 0 ? (
                        <div className="flex flex-col space-y-2 p-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col space-y-2 w-full">
                                    <p className="text-red-500">{file.name}</p>
                                    <audio key={index} controls>
                                        <source
                                            src={URL.createObjectURL(file)}
                                        />
                                    </audio>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>No files uploaded</div>
                    )}
                </div>
            </div>
            <div className="border-black border w-[600px] h-[400px] overflow-y-auto flex flex-col">
                <div className="flex flex-col w-full">
                    <div className="flex justify-center items-center w-full">
                        <h1 className="font-bold text-lg">Recognized Songs:</h1>
                    </div>
                    {names.length > 0 ? (
                        <div className="flex flex-col space-y-2 p-2">
                            {names.map((name, index) => (
                                <p key={index}>{name}</p>
                            ))}
                        </div>
                    ) : (
                        <div>No songs recognized</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MusicContainer;
