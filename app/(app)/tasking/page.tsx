"use client";

import {
  ArrowLeft,
  Camera,
  Download,
  Expand,
  Home,
  PieChart,
  Wallet,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import handleUpload from "@/utils/uploaderService";
import Link from "next/link";

interface ProjectData {
  projectName: string;
  taskNumber: number;
  languages: string[];
  tags: string[];
  expiryDate: string;
  prompt: string;
}
const text =
  "The goal is to analyze the conversation to identify user constraints and user expectations. This step is extremely important since you will be assessing the Code, Code Output and Responses based on your interpretation of the prompt. It’s helpful to keep notes for tasks that have many constraints and/or requests. Try to visualize the ideal execution steps the model should take and the ideal response that would be fulfilling to the user.";

export default function Component() {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch("/api/project-data");
        const data = await response.json();
        setProjectData(data);
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

    fetchProjectData();
  }, []);

  const handleVideoSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedVideo(file);
      setSelectedFileName(file.name);
    }
  };

  const handleSubmit = async () => {
    if (!selectedVideo) return;

    setIsLoading(true);
    try {
      await handleUpload(selectedVideo);
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPrompt = () => {
    if (projectData?.prompt || text) {
      const fileContent = projectData?.prompt || text;
      const blob = new Blob([fileContent], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "prompt.txt";
      link.click();
      URL.revokeObjectURL(url);
    }
  };
  const handleClearSelection = () => {
    setSelectedVideo(null);
    setSelectedFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-white h-16">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold text-navy-900">My Projects</h1>
        </div>
        <div className="h-10 w-10 rounded-full overflow-hidden">
          <Image
            src="/profile_im.jpg"
            alt="Profile"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4 pt-20 pb-24">
        {/* Project Card */}
        <Card className="bg-gradient-to-r from-purple-950 to-purple-800 text-white p-6 rounded-3xl">
          <h2 className="text-2xl font-bold">Astra Project</h2>
        </Card>

        {/* Task Number */}
        <div className="flex justify-between">
          <h3 className="text-xl font-semibold text-gray-700">
            Task Number #{projectData?.taskNumber || "14"}
          </h3>
          <h3 className="text-xl font-semibold text-gray-700">Task id: 15</h3>
        </div>

        {/* Language and Expiry Section */}
        <Card className="bg-gradient-to-r from-purple-950 to-purple-800 text-white p-4 rounded-xl space-y-1">
          <div className="flex justify-between items-center">
            <div>
              <p>Language</p>
              <div className="flex gap-2 mt-2">
                {projectData?.languages.map((lang) => (
                  <Badge
                    key={lang}
                    variant="outline"
                    className="bg-white text-blue-600"
                  >
                    {lang}
                  </Badge>
                )) || (
                  <>
                    <Badge variant="outline" className="bg-white text-blue-600">
                      Hindi
                    </Badge>
                    <Badge variant="outline" className="bg-white text-blue-600">
                      English
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <div>
              <p>Expiry Date</p>
              <Badge variant="outline" className="bg-white text-blue-600 mt-2">
                {projectData?.expiryDate || "10-06-24"}
              </Badge>
            </div>
          </div>
          <div>
            <p>Tags:</p>
            <div className="flex gap-2 mt-2">
              {projectData?.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-white text-blue-600"
                >
                  {tag}
                </Badge>
              )) || (
                <>
                  <Badge variant="outline" className="bg-white text-blue-600">
                    Hindi
                  </Badge>
                  <Badge variant="outline" className="bg-white text-blue-600">
                    English
                  </Badge>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Prompt Card */}
        <Card className="p-4 relative">
          <div className="flex flex-col gap-2">
            <p className="text-gray-600 flex-1 line-clamp-2">
              {projectData?.prompt || text}
            </p>
            <div className="flex justify-between items-center mt-2">
              <Button variant="ghost" size="sm" onClick={handleDownloadPrompt}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPromptOpen(true)}
              >
                <Expand className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </Card>

        {/* Full-screen Prompt Dialog */}
        <Dialog open={isPromptOpen} onOpenChange={setIsPromptOpen}>
          <DialogContent className="sm:max-w-[90%] h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Prompt</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto p-6">
              <p>{projectData?.prompt || text}</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Video Upload Section */}
        {/* <Card className='p-4'>
          <div className='flex items-center gap-2 text-gray-600 mb-4'>
            <p>Submit your video here</p>
          </div>
          <input
            type='file'
            accept='video/*'
            className='hidden'
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                onClick={handleVideoSelect}
                className='rounded-full'>
                <Camera className='h-5 w-5' />
              </Button>
              {selectedFileName && (
                <span className='text-sm text-gray-600 truncate max-w-[150px]'>
                  {selectedFileName}
                </span>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!selectedVideo || isLoading}
              className='bg-gradient-to-r from-blue-900 to-purple-900 text-white px-6 py-2 rounded-full hover:from-blue-800 hover:to-purple-800'>
              {isLoading ? "Uploading..." : "Submit"}
            </Button>
          </div>
        </Card> */}
        <Card className="p-4">
          <div className="flex items-center text-gray-600 mb-4">
            <p>Submit your video here</p>
          </div>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleVideoSelect}
                className="rounded-full"
              >
                <Camera className="h-5 w-5" />
              </Button>
              {selectedFileName && (
                <div className="flex items-center gap-1">
                  {""}
                  {/* Adjusted gap */}
                  <span className="text-sm text-gray-600 truncate max-w-[150px]">
                    {selectedFileName}
                  </span>
                  <button
                    onClick={handleClearSelection}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!selectedVideo || isLoading}
              className="bg-gradient-to-r from-blue-900 to-purple-900 text-white px-6 py-2 rounded-full hover:from-blue-800 hover:to-purple-800"
            >
              {isLoading ? "Uploading..." : "Submit"}
            </Button>
          </div>
        </Card>
      </main>
      {/* Bottom Navigation */}
      {/* <nav className='fixed bottom-0 grid grid-cols-4 w-full gap-2 p-2 bg-white border-t'>
        <Button variant='ghost' className='flex flex-col items-center gap-1'>
          <Home className='h-5 w-5' />
          <span className='text-xs'>Home</span>
        </Button>
        <Button variant='ghost' className='flex flex-col items-center gap-1'>
          <PieChart className='h-5 w-5' />
          <span className='text-xs'>Analytics</span>
        </Button>
        <Button variant='ghost' className='flex flex-col items-center gap-1'>
          <Wallet className='h-5 w-5' />
          <span className='text-xs'>Earnings</span>
        </Button>
        <Button variant='ghost' className='flex flex-col items-center gap-1'>
          <User className='h-5 w-5' />
          <span className='text-xs'>Tasking</span>
        </Button>
      </nav> */}

      {/* Bottom Navigation */}
      {/* <nav className="fixed bottom-0 grid grid-cols-4 w-full gap-2 p-2 bg-white border-t">
        <Link href="/">
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
        </Link>
        <Link href="/analytics">
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <PieChart className="h-5 w-5" />
            <span className="text-xs">Analytics</span>
          </Button>
        </Link>
        <Link href="/earnings">
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <Wallet className="h-5 w-5" />
            <span className="text-xs">Earnings</span>
          </Button>
        </Link>
        <Link href="/tasking">
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <User className="h-5 w-5" />
            <span className="text-xs">Tasking</span>
          </Button>
        </Link>
      </nav> */}
    </div>
  );
}
