import React, { useState, useRef } from 'react';
import { Brain, Mic, Play, Pause, Volume2, Download, Eye, AlertTriangle, CheckCircle2, Clock, MicOff, Loader2, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIAnalysisReportProps {
  imageFile: File;
  analysisData: any;
  isAnalyzing: boolean;
  onReportComplete: (reportData: any) => void;
}

export const AIAnalysisReport: React.FC<AIAnalysisReportProps> = ({
  imageFile,
  analysisData,
  isAnalyzing,
  onReportComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState('');
  const [reportText, setReportText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [reportAudioUrl, setReportAudioUrl] = useState<string | null>(null);
  const [currentPlayback, setCurrentPlayback] = useState<'recording' | 'report' | null>(null);
  const [realtimeTranscription, setRealtimeTranscription] = useState('');
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reportAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Simulated AI analysis results (in production, this would come from actual AI service)
  const analysisResults = analysisData || {
    abnormalities: [
      { type: 'Mass', location: 'Upper right quadrant', severity: 'High', confidence: 85 },
      { type: 'Calcification', location: 'Lower left', severity: 'Low', confidence: 72 }
    ],
    overallSeverity: 'Medium',
    clinicalInsights: [
      'Recommend immediate follow-up imaging',
      'Consider contrast-enhanced CT scan',
      'Consultation with radiologist advised'
    ],
    confidence: 78
  };

  // Initialize browser speech recognition for real-time transcription
  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update real-time transcription display
        setRealtimeTranscription(interimTranscript);
        
        // Add final transcript to voice notes
        if (finalTranscript) {
          setVoiceNotes(prev => prev + (prev ? ' ' : '') + finalTranscript);
          setRealtimeTranscription('');
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          variant: "destructive",
          title: "Voice recognition error",
          description: "Please try again or check microphone permissions.",
        });
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        setRealtimeTranscription('');
        toast({
          title: "Voice dictation ended",
          description: "Transcription has been saved to your notes.",
        });
      };
      
      return recognition;
    }
    return null;
  };

  const startRecording = async () => {
    try {
      // Start real-time speech recognition
      const recognition = initializeSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
        
        toast({
          title: "Voice dictation started",
          description: "Speak clearly for real-time transcription.",
        });
      } else {
        // Fallback to audio recording + API transcription
        await startAudioRecording();
      }
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: "Could not access microphone or speech recognition.",
      });
    }
  };

  const startAudioRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };
    
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      // Convert to base64 for API
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        await transcribeAudio(base64Audio);
      };
      reader.readAsDataURL(blob);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    
    toast({
      title: "Audio recording started",
      description: "Speak your notes clearly.",
    });
  };

  const transcribeAudio = async (base64Audio: string) => {
    setIsTranscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      if (data.text) {
        setVoiceNotes(prev => prev + (prev ? ' ' : '') + data.text);
        toast({
          title: "Transcription complete",
          description: "Voice notes have been transcribed successfully.",
        });
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        variant: "destructive",
        title: "Transcription failed",
        description: "Could not transcribe audio. Please try again.",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const stopRecording = () => {
    // Stop speech recognition if active
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    // Stop audio recording if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setRealtimeTranscription('');
    
    toast({
      title: "Recording stopped",
      description: "Voice dictation has been saved.",
    });
  };

  const playAudio = async () => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      
      await audio.play();
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const generateAudioSummary = async () => {
    if (!reportText && !analysisResults) {
      toast({
        variant: "destructive",
        title: "No content to read",
        description: "Please add report text or ensure AI analysis is complete.",
      });
      return;
    }

    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      toast({
        variant: "destructive",
        title: "Speech not supported",
        description: "Your browser doesn't support text-to-speech.",
      });
      return;
    }

    setIsGeneratingAudio(true);
    
    try {
      // Create comprehensive report text
      const reportContent = generateRadiologistReport();
      
      // Stop any ongoing speech
      speechSynthesis.cancel();
      
      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(reportContent);
      
      // Configure voice settings
      utterance.rate = 0.8; // Slightly slower for medical content
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      // Try to use a medical-appropriate voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Daniel') || voice.name.includes('Alex') || voice.name.includes('Tom'))
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Set up event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        setCurrentPlayback('report');
        toast({
          title: "Playing report",
          description: "Medical report is being read aloud.",
        });
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentPlayback(null);
        setIsGeneratingAudio(false);
        toast({
          title: "Playback complete",
          description: "Report reading finished.",
        });
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentPlayback(null);
        setIsGeneratingAudio(false);
        toast({
          variant: "destructive",
          title: "Playback failed",
          description: "Could not read the report. Please try again.",
        });
      };

      // Start speaking
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsGeneratingAudio(false);
      toast({
        variant: "destructive",
        title: "Audio generation failed",
        description: "Could not generate audio. Please try again.",
      });
    }
  };

  const generateRadiologistReport = () => {
    const findings = analysisResults?.abnormalities?.map((abn: any) => 
      `${abn.type} identified in ${abn.location} with ${abn.severity.toLowerCase()} severity (${abn.confidence}% confidence)`
    ).join('. ') || 'No significant abnormalities detected';

    const impression = analysisResults?.overallSeverity === 'High' 
      ? 'Urgent findings requiring immediate clinical correlation'
      : analysisResults?.overallSeverity === 'Medium'
      ? 'Findings requiring clinical correlation and possible follow-up'
      : 'No acute findings identified';

    return `
      RADIOLOGICAL REPORT
      
      FINDINGS:
      ${findings}
      
      IMPRESSION:
      ${impression}
      
      AI ANALYSIS CONFIDENCE: ${analysisResults?.confidence || 0}%
      
      CLINICAL RECOMMENDATIONS:
      ${analysisResults?.clinicalInsights?.join('. ') || 'Standard clinical follow-up as appropriate'}
      
      ${reportText ? `RADIOLOGIST NOTES: ${reportText}` : ''}
      ${voiceNotes ? `ADDITIONAL NOTES: ${voiceNotes}` : ''}
    `.trim();
  };

  const finalizeReport = () => {
    const finalReport = {
      analysisResults,
      voiceNotes,
      reportText,
      timestamp: new Date().toISOString(),
      imageFile: imageFile.name
    };
    
    onReportComplete(finalReport);
    
    toast({
      title: "Report finalized",
      description: "AI analysis report has been completed.",
    });
  };

  if (isAnalyzing) {
    return (
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <Brain className="h-16 w-16 text-blue-500 animate-pulse" />
              <div className="absolute -inset-2 bg-blue-100 rounded-full animate-ping opacity-75"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-800">AI Analysis in Progress</h3>
              <p className="text-slate-600">Analyzing medical image with advanced AI algorithms...</p>
            </div>
            <Progress value={65} className="w-full max-w-md" />
            <p className="text-sm text-slate-500">This may take 30-60 seconds</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Results */}
      <Card className="border-2 border-green-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
            <span>AI Analysis Results</span>
            <Badge variant="secondary" className="bg-green-50 text-green-700">
              {analysisResults.confidence}% Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Assessment */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className={`h-5 w-5 ${
                analysisResults.overallSeverity === 'High' ? 'text-red-500' :
                analysisResults.overallSeverity === 'Medium' ? 'text-yellow-500' : 'text-green-500'
              }`} />
              <span className="font-semibold">Overall Severity: {analysisResults.overallSeverity}</span>
            </div>
          </div>

          {/* Detected Abnormalities */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-3">Detected Abnormalities</h4>
            <div className="grid gap-3">
              {analysisResults.abnormalities.map((abnormality: any, index: number) => (
                <div key={index} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{abnormality.type}</span>
                      <p className="text-sm text-slate-600">{abnormality.location}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={abnormality.severity === 'High' ? 'destructive' : 
                        abnormality.severity === 'Medium' ? 'secondary' : 'outline'}>
                        {abnormality.severity}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">{abnormality.confidence}% confident</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Insights */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-3">Clinical Insights</h4>
            <ul className="space-y-2">
              {analysisResults.clinicalInsights.map((insight: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Voice Dictation */}
      <Card className="border-2 border-purple-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mic className="h-6 w-6 text-purple-600" />
            </div>
            <span>Voice Dictation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className="flex items-center space-x-2"
            >
              {isRecording ? (
                <MicOff className="h-4 w-4 animate-pulse" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              <span>{isRecording ? 'Stop Recording' : 'Dictate Notes'}</span>
            </Button>
            
            {isTranscribing && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Transcribing...</span>
              </div>
            )}
            
            {audioUrl && !isTranscribing && (
              <Button
                variant="outline"
                onClick={isPlaying ? pauseAudio : playAudio}
                className="flex items-center space-x-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isPlaying ? 'Pause Recording' : 'Play Recording'}</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={generateAudioSummary}
              disabled={isGeneratingAudio || (isPlaying && currentPlayback === 'report')}
              className="flex items-center space-x-2"
            >
              {isGeneratingAudio ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              <span>{isGeneratingAudio ? 'Preparing...' : 'Listen to Full Report'}</span>
            </Button>

            {isPlaying && currentPlayback === 'report' && (
              <Button
                variant="outline"
                onClick={() => {
                  speechSynthesis.pause();
                  setIsPlaying(false);
                  setCurrentPlayback(null);
                }}
                className="flex items-center space-x-2"
              >
                <Pause className="h-4 w-4" />
                <span>Pause Report</span>
              </Button>
            )}

            {speechSynthesis.paused && currentPlayback === 'report' && (
              <Button
                variant="outline"
                onClick={() => {
                  speechSynthesis.resume();
                  setIsPlaying(true);
                }}
                className="flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Resume Report</span>
              </Button>
            )}

            {(isPlaying || speechSynthesis.paused) && currentPlayback === 'report' && (
              <Button
                variant="outline"
                onClick={() => {
                  speechSynthesis.cancel();
                  setIsPlaying(false);
                  setCurrentPlayback(null);
                  setIsGeneratingAudio(false);
                }}
                className="flex items-center space-x-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Stop Report</span>
              </Button>
            )}
          </div>
          {/* Real-time transcription display */}
          {isRecording && realtimeTranscription && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Real-time transcription:</span>
              </div>
              <p className="text-sm text-yellow-700 italic">{realtimeTranscription}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Voice Notes</label>
            <Textarea
              value={voiceNotes}
              onChange={(e) => setVoiceNotes(e.target.value)}
              placeholder="Voice notes will appear here automatically, or type additional notes..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Report Text */}
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <span>Radiologist Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Enter your radiologist interpretation and final report..."
            className="min-h-[150px]"
          />
        </CardContent>
      </Card>

      {/* Radiologist Notes (Voice Dictation) - Embedded Section */}
      {voiceNotes && (
        <Card className="border-2 border-indigo-200 shadow-lg bg-indigo-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Stethoscope className="h-6 w-6 text-indigo-600" />
              </div>
              <span>Radiologist Notes (Voice Dictation)</span>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                Auto-transcribed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-white border border-indigo-200 rounded-lg">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{voiceNotes}</p>
            </div>
            <div className="mt-3 text-xs text-indigo-600 flex items-center space-x-2">
              <Clock className="h-3 w-3" />
              <span>Transcribed: {new Date().toLocaleTimeString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          className="flex-1 h-12"
        >
          <Download className="mr-2 h-5 w-5" />
          Export Report
        </Button>
        
        <Button
          onClick={finalizeReport}
          className="flex-1 h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Finalize Report
        </Button>
      </div>
    </div>
  );
};
