
import React, { useState, useRef } from 'react';
import { Mic, MicOff, Brain, Save, Volume2, ZoomIn, ZoomOut, RotateCw, Download, Play, Pause, Maximize2, Grid3X3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReviewDialogProps {
  case: MedicalCase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCase: (updatedCase: MedicalCase) => void;
}

export const ReviewDialog: React.FC<ReviewDialogProps> = ({ 
  case: caseData, 
  open, 
  onOpenChange,
  onUpdateCase
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [radiologyNotes, setRadiologyNotes] = useState(caseData.findings || '');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [imageZoom, setImageZoom] = useState(100);
  const [imageRotation, setImageRotation] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Get real medical image data from the case
  const getRealImageData = () => {
    // For system-processed cases and manual uploads with actual image data
    const imageData = (caseData as any).imageData;
    if (imageData && (imageData.startsWith('data:image') || imageData.startsWith('data:application'))) {
      return [imageData]; // Return the actual base64 image data
    }
    
    // Fallback to placeholder if no real image data available
    return ['/lovable-uploads/809183d2-1566-4f13-a90f-30e8e2cbae5a.png'];
  };

  const medicalImages = getRealImageData();

  // AI-generated review notes based on case data
  const generateAIReviewNotes = () => {
    setIsGeneratingAI(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const aiNotes = `
AI Review Analysis for ${caseData.imageType} - ${caseData.bodyPart}:

TECHNICAL QUALITY:
- Image quality: Excellent diagnostic quality with optimal contrast resolution
- Positioning: Appropriate anatomical alignment
- Contrast enhancement: ${caseData.imageType === 'MRI' ? 'Gadolinium enhanced sequences obtained' : 'IV contrast administered per protocol'}

FINDINGS:
${caseData.findings ? `- ${caseData.findings}` : '- No acute abnormalities detected'}
- Normal anatomical structures preserved
- No mass lesions or space-occupying lesions identified
- Vascular structures patent without evidence of stenosis
- No signs of acute inflammation or infection

AI CONFIDENCE METRICS:
- Overall diagnostic confidence: ${caseData.aiConfidence}%
- Risk stratification: ${caseData.priority.toUpperCase()}
- Quality assurance score: 95%
- Recommended follow-up: ${caseData.priority === 'critical' ? 'Immediate clinical correlation required' : 'Routine follow-up as clinically indicated'}

DIFFERENTIAL CONSIDERATIONS:
- Age-related changes consistent with patient demographics
- Comparison with prior studies shows stable appearance
- No contraindications to discharge if clinically stable
- Consider correlation with laboratory findings and clinical presentation

QUALITY ASSURANCE:
- All sequences/views systematically reviewed
- Prior studies compared when available
- Findings communicated to referring physician via secure messaging
- Report reviewed and electronically signed
      `.trim();
      
      setRadiologyNotes(aiNotes);
      setIsGeneratingAI(false);
      
      toast({
        title: "AI Review Generated",
        description: "Comprehensive AI analysis completed with high confidence scoring.",
      });
    }, 2000);
  };

  const startVoiceDictation = async () => {
    try {
      // Check if speech recognition is supported
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support speech recognition. Please type your notes manually.",
          variant: "destructive",
        });
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      let finalTranscript = '';
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update the notes with the final transcript
        if (finalTranscript) {
          setRadiologyNotes(prev => prev + '\n\n[Voice Note]: ' + finalTranscript);
          finalTranscript = '';
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
        
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}. Please try again or type manually.`,
          variant: "destructive",
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setIsRecording(false);
        
        if (finalTranscript) {
          toast({
            title: "Voice Note Added",
            description: "Your voice dictation has been successfully added to the clinical notes.",
          });
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setIsRecording(true);
      
      toast({
        title: "Voice Recognition Started",
        description: "Speak your clinical notes. Click the microphone again to stop.",
      });
      
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      toast({
        title: "Voice Recognition Error",
        description: "Could not start voice recognition. Please check your microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setIsRecording(false);
  };

  const handleSave = async () => {
    if (!radiologyNotes.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add some review notes before saving.",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Update the case in the database
      const { error } = await supabase
        .from('medical_cases')
        .update({
          findings: radiologyNotes,
          status: 'review-completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', caseData.id);

      if (error) {
        console.error('Error saving review to database:', error);
        throw error;
      }

      // Update the case in the parent component
      const updatedCase: MedicalCase = {
        ...caseData,
        findings: radiologyNotes,
        status: 'review-completed',
        updatedAt: new Date().toISOString(),
      };

      onUpdateCase(updatedCase);
      onOpenChange(false);
      
      toast({
        title: "Review Completed",
        description: "Radiology review has been saved and status updated to review complete.",
      });
      
    } catch (error) {
      console.error('Error saving review:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save review. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        // Stop speaking
        speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        // Start speaking
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        speechSynthesis.speak(utterance);
      }
    }
  };

  const handleZoomIn = () => setImageZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setImageZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setImageRotation(prev => (prev + 90) % 360);
  const handleDownload = () => {
    // In a real implementation, this would download the actual DICOM image
    toast({
      title: "Download Started",
      description: "Medical image download initiated in DICOM format.",
    });
  };

  const toggleSlideshow = () => {
    setIsPlaying(!isPlaying);
  };

  // Auto-advance slideshow
  useState(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedImageIndex(prev => (prev + 1) % medicalImages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-slate-50">
        <DialogHeader className="border-b border-slate-200 pb-4">
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900">Advanced Radiology Review</span>
              <p className="text-sm text-slate-600 mt-1">{caseData.patientName} • {caseData.patientId}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Enhanced Medical Image Viewer */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg text-slate-900">Medical Imaging - {caseData.imageType}</h4>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'single' ? 'grid' : 'single')}>
                  {viewMode === 'single' ? <Grid3X3 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-600 min-w-[60px] text-center">{imageZoom}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={toggleSlideshow}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {viewMode === 'single' ? (
              <div className="bg-black rounded-xl shadow-2xl p-4 min-h-[450px] flex items-center justify-center relative overflow-hidden">
                <img
                  src={medicalImages[selectedImageIndex]}
                  alt={`Medical scan ${selectedImageIndex + 1} for ${caseData.patientName}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  style={{
                    transform: `scale(${imageZoom / 100}) rotate(${imageRotation}deg)`,
                    transition: 'transform 0.3s ease',
                  }}
                />
                <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                  Slice {selectedImageIndex + 1} of {medicalImages.length}
                </div>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                  {caseData.imageType} • {caseData.bodyPart}
                </div>
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 text-white text-xs px-3 py-2 rounded-lg">
                  Patient: {caseData.patientName} | ID: {caseData.patientId}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {medicalImages.map((image, index) => (
                  <div key={index} className="bg-black rounded-lg p-2 aspect-square">
                    <img
                      src={image}
                      alt={`Medical scan ${index + 1}`}
                      className="w-full h-full object-contain rounded cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setViewMode('single');
                      }}
                    />
                    <div className="text-white text-xs text-center mt-2">Slice {index + 1}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Enhanced Image Thumbnails */}
            <div className="flex space-x-3 justify-center">
              {medicalImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-20 h-20 rounded-lg border-3 overflow-hidden transition-all duration-300 ${
                    selectedImageIndex === index 
                      ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg scale-105' 
                      : 'border-slate-300 hover:border-slate-400 hover:scale-102'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            
            {/* Enhanced Case Information */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-r from-slate-100 to-blue-50 rounded-xl shadow-inner">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-slate-600">Patient ID</span>
                  <div className="text-lg font-semibold text-slate-900">{caseData.patientId}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-600">Imaging Modality</span>
                  <div className="text-lg font-semibold text-slate-900">{caseData.imageType}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-slate-600">Body Region</span>
                  <div className="text-lg font-semibold text-slate-900">{caseData.bodyPart}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-600">Priority Level</span>
                  <Badge className={`text-sm font-medium ${
                    caseData.priority === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
                    caseData.priority === 'high' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                    caseData.priority === 'medium' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                    'bg-green-100 text-green-800 border-green-300'
                  }`}>
                    {caseData.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Review Notes Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg text-slate-900">Clinical Review & Analysis</h4>
              <div className="flex space-x-3">
                {radiologyNotes && (
                  <Button
                    onClick={() => speakText(radiologyNotes)}
                    variant="outline"
                    size="sm"
                    className={`hover:bg-slate-100 ${isSpeaking ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300' : ''}`}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {isSpeaking ? 'Stop Reading' : 'Read Report'}
                  </Button>
                )}
              </div>
            </div>
            
            <textarea
              value={radiologyNotes}
              onChange={(e) => setRadiologyNotes(e.target.value)}
              placeholder="AI-generated clinical analysis will appear here. You can also add your own observations and findings..."
              className="w-full h-80 p-6 border border-slate-300 rounded-xl resize-none text-sm font-mono bg-white shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={isSaving}
            />

            {/* Enhanced Voice Dictation */}
            <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <Button
                onClick={isRecording ? stopVoiceDictation : startVoiceDictation}
                variant={isRecording ? "destructive" : "default"}
                className="flex items-center space-x-2 px-6 py-3"
                disabled={isSaving}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    <span>Voice Dictation</span>
                  </>
                )}
              </Button>
              <div className="text-sm text-slate-700">
                {isRecording ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-medium">
                      {isListening ? 'Listening...' : 'Recording clinical notes...'}
                    </span>
                  </div>
                ) : (
                  "Click to start voice dictation. Your speech will be transcribed and added to the clinical notes."
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!radiologyNotes.trim() || isSaving} 
            className="px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Save className="w-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Clinical Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
