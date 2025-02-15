import { FileUpload } from "@/components/tools/FileUpload";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
    return (
        <div className="w-full flex flex-col justify-start items-center">
            <div className="flex flex-col justify-start items-center p-4 mt-4 space-y-4 w-[800px]">
                <h1 className="text-4xl font-bold">
                    Share your local music files
                </h1>
                <FileUpload />
            </div>
        </div>
    );
}
