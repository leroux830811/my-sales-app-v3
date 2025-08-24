
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Camera, RefreshCcw, Check, VideoOff, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { cn } from "@/lib/utils";

interface CameraCaptureProps {
    onCapture: (imageDataUri: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const { toast } = useToast();

    const getCameraPermission = useCallback(async (mode: 'environment' | 'user') => {
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

        // Stop any existing stream before starting a new one
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: mode } } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        // If exact facing mode fails, try without it
        if (mode === 'environment') {
            try {
                 const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                 setHasCameraPermission(true);
                 if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                 }
            } catch (fallbackError) {
                 console.error('Fallback camera access failed:', fallbackError);
                 setHasCameraPermission(false);
                 toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings to use this app.',
                });
            }
        } else {
             setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings to use this app.',
            });
        }
      }
    }, [toast]);

    useEffect(() => {
        getCameraPermission(facingMode);

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [facingMode, getCameraPermission]);
    
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
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onCapture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
    }

    const handleSave = () => {
        if (capturedImage) {
            onCapture(capturedImage);
        }
    }

    const handleSwitchCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    }

    return (
        <div className="space-y-4">
             <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
            />
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
                 <div className="flex justify-center items-center gap-4">
                    {capturedImage ? (
                        <>
                            <Button onClick={handleRetake} variant="outline"><RefreshCcw className="mr-2 h-4 w-4"/> Retake</Button>
                            <Button onClick={handleSave}><Check className="mr-2 h-4 w-4"/> Save Photo</Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="icon" className="w-16 h-16 rounded-full"><Upload className="h-6 w-6" /></Button>
                            <Button onClick={handleCapture} size="lg" className="rounded-full w-20 h-20">
                                <Camera className="h-8 w-8" />
                            </Button>
                            <Button onClick={handleSwitchCamera} variant="outline" size="icon" className="w-16 h-16 rounded-full"><RefreshCw className="h-6 w-6" /></Button>
                        </>
                    )}
                 </div>
            )}
             {!hasCameraPermission && (
                 <div className="text-center">
                    <Button onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Upload Photo Instead</Button>
                 </div>
             )}
        </div>
    )
}
