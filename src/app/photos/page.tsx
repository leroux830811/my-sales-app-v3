
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Camera, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { usePhotos } from '@/context/photo-context';
import { useToast } from '@/hooks/use-toast';
import { CameraCapture } from '@/components/camera-capture';
import { format } from 'date-fns';

export default function PhotosPage() {
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const { photos, addPhoto } = usePhotos();
    const { toast } = useToast();

    const handleSavePhoto = (imageDataUri: string) => {
        addPhoto(imageDataUri, 'General Photo');
        setIsCameraOpen(false);
        toast({
            title: "Photo Saved",
            description: "Your photo has been saved to the gallery."
        });
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Photo Gallery</h2>
                 <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Take New Photo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Take a New Photo</DialogTitle>
                            <DialogDescription>
                                Capture a photo to add to your gallery. You can also upload an existing image.
                            </DialogDescription>
                        </DialogHeader>
                        <CameraCapture onCapture={handleSavePhoto} />
                    </DialogContent>
                </Dialog>
            </div>
            
            {photos.length > 0 ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {photos.map((photo) => (
                        <Card key={photo.id}>
                            <CardContent className="p-0">
                                <div className="relative h-64 w-full">
                                    <Image 
                                        src={photo.imageDataUri} 
                                        alt={photo.description || `Photo taken on ${photo.createdAt}`}
                                        fill
                                        className="rounded-t-md object-cover"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 flex flex-col items-start">
                               {photo.description && <p className='font-medium'>{photo.description}</p>}
                               <p className="text-sm text-muted-foreground">
                                 {format(new Date(photo.createdAt), "PPP p")}
                               </p>
                            </CardFooter>
                        </Card>
                    ))}
                 </div>
            ) : (
                <Card className="flex items-center justify-center h-96">
                    <div className="text-center text-muted-foreground">
                        <Camera className="mx-auto h-12 w-12 mb-4" />
                        <p className="mb-2">You haven't taken any photos yet.</p>
                        <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Take a Photo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>Take a New Photo</DialogTitle>
                                    <DialogDescription>
                                        Capture a photo to add to your gallery. You can also upload an existing image.
                                    </DialogDescription>
                                </DialogHeader>
                                <CameraCapture onCapture={handleSavePhoto} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </Card>
            )}

           
        </div>
    );
}
