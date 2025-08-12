"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Camera, RefreshCcw, Check, VideoOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { cn } from "@/lib/utils";

interface CameraCaptureProps {
    onCapture: (imageDataUri: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const getCameraPermission = async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.error("Camera API not supported in this browser.");
                setHasCameraPermission(false);
                toast({
                    variant: "destructive",
                    title: "Camera Not Supported",
                    description: "Your browser does not support camera access.",
                });
                return;
            }
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasCameraPermission(true);
    
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings to use this app.',
            });
          }
        };
    
        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [toast]);
    
    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUri = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUri);
            }
        }
    }

    const handleRetake = () => {
        setCapturedImage(null);
    }

    const handleSave = () => {
        if (capturedImage) {
            onCapture(capturedImage);
        }
    }

    return (
        <div className="space-y-4">
             <div className="relative w-full aspect-video rounded-md bg-muted overflow-hidden">
                <video 
                    ref={videoRef} 
                    className={cn("w-full h-full object-cover", capturedImage ? "hidden" : "block")} 
                    autoPlay 
                    muted 
                    playsInline
                />
                {capturedImage && (
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                )}
                 <canvas ref={canvasRef} className="hidden" />
             </div>
             
            {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <VideoOff className="h-4 w-4" />
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access in your browser to use this feature. You may need to refresh the page after granting permissions.
                    </AlertDescription>
                </Alert>
            )}

            {hasCameraPermission && (
                 <div className="flex justify-center gap-4">
                    {capturedImage ? (
                        <>
                            <Button onClick={handleRetake} variant="outline"><RefreshCcw className="mr-2 h-4 w-4"/> Retake</Button>
                            <Button onClick={handleSave}><Check className="mr-2 h-4 w-4"/> Save Photo</Button>
                        </>
                    ) : (
                        <Button onClick={handleCapture} size="lg" className="rounded-full w-20 h-20">
                            <Camera className="h-8 w-8" />
                        </Button>
                    )}
                 </div>
            )}
        </div>
    )
}
