import { Music, FileAudio, AlertCircle } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface MusicContainerProps {
    files: File[];
    names: string[];
}

const MusicContainer = ({ files, names }: MusicContainerProps) => {
    return (
        <div className="w-full space-y-4">
            {/* Mobile view with tabs */}
            <Tabs defaultValue="files" className="w-full md:hidden">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="files">Audio Files</TabsTrigger>
                    <TabsTrigger value="songs">Recognized Songs</TabsTrigger>
                </TabsList>
                <TabsContent value="files">
                    <AudioFilesCard files={files} />
                </TabsContent>
                <TabsContent value="songs">
                    <RecognizedSongsCard names={names} />
                </TabsContent>
            </Tabs>

            {/* Desktop view with side-by-side cards */}
            <div className="hidden md:grid md:grid-cols-2 md:gap-6">
                <AudioFilesCard files={files} />
                <RecognizedSongsCard names={names} />
            </div>
        </div>
    );
};

const AudioFilesCard = ({ files }: { files: File[] }) => {
    return (
        <Card className="h-[400px] flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <FileAudio className="h-5 w-5" />
                    Processed Audio Files
                </CardTitle>
                <CardDescription>
                    {files.length} {files.length === 1 ? "file" : "files"}{" "}
                    processed
                </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[310px] w-full p-4">
                    {files.length > 0 ? (
                        <div className="space-y-4">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border bg-card p-3">
                                    <div className="mb-2 flex items-center w-full justify-between">
                                        <div className="flex items-center gap-2 w-full">
                                            <Music className="h-4 w-4 text-primary" />
                                            <span
                                                className="font-medium text-sm line-clamp-1"
                                                title={file.name}>
                                                {file.name}
                                            </span>
                                        </div>
                                    </div>
                                    <audio
                                        controls
                                        className="w-fit h-8"
                                        style={{
                                            colorScheme: "normal",
                                        }}>
                                        <source
                                            src={URL.createObjectURL(file)}
                                        />
                                        Your browser does not support the audio
                                        element.
                                    </audio>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center p-4">
                            <FileAudio className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-lg font-semibold">
                                No audio files
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Upload audio files to process and recognize
                                songs
                            </p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

const RecognizedSongsCard = ({ names }: { names: string[] }) => {
    return (
        <Card className="h-[400px] flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Recognized Songs
                </CardTitle>
                <CardDescription>
                    {names.length} {names.length === 1 ? "song" : "songs"}{" "}
                    recognized
                </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[310px] w-full p-4">
                    {names.length > 0 ? (
                        <div className="space-y-2">
                            {names.map((name, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-lg border bg-card w-full">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <Music className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 line-clamp-1 ">
                                        <p className="font-medium" title={name}>
                                            {name}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center p-4">
                            <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-lg font-semibold">
                                No songs recognized
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Process audio files to recognize songs
                            </p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default MusicContainer;
