import React, { useState } from 'react';
import { Brain, Loader2, CheckCircle, AlertTriangle, Eye, Activity, FileText, Mic, MicOff, Plus, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { type MedicalCase } from '@/hooks/useMedicalCases';

interface AnalysisResult {
  id: string;
  imageId: string;
  description: string;
  findings: string[];
  confidence: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  bodyPart: string;
  modality: string;
  recommendations: string[];
  status: 'analyzing' | 'completed' | 'error';
}

interface AIImageAnalysisProps {
  uploadedFiles: Array<{
    id: string;
    file: File;
    preview: string;
    status: 'uploading' | 'success' | 'error';
    metadata?: {
      modality?: string;
      bodyPart?: string;
      patientId?: string;
    };
  }>;
  onAnalysisComplete: (analyses: AnalysisResult[]) => void;
  onCaseCreated?: (newCase: MedicalCase) => void;
}

export const AIImageAnalysis: React.FC<AIImageAnalysisProps> = ({
  uploadedFiles,
  onAnalysisComplete,
  onCaseCreated
}) => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [dictatedText, setDictatedText] = useState('');
  const [showCaseCreation, setShowCaseCreation] = useState(false);
  const [createdCase, setCreatedCase] = useState<MedicalCase | null>(null);
  const [newCaseData, setNewCaseData] = useState({
    patientName: '',
    patientId: '',
    findings: '',
    priority: 'medium' as 'critical' | 'high' | 'medium' | 'low'
  });
  const { toast } = useToast();

  const generateAIAnalysis = async (file: any): Promise<AnalysisResult> => {
    // Simulate AI analysis with realistic medical imaging analysis
    const bodyPart = file.metadata?.bodyPart || 'Unknown';
    const modality = file.metadata?.modality || 'Unknown';
    
    const analysisTemplates = {
      'Head': {
        'CT': {
          description: 'Axial CT images of the head demonstrate normal brain parenchyma with appropriate gray-white matter differentiation. Ventricular system is within normal limits. No evidence of acute intracranial hemorrhage, mass effect, or midline shift.',
          findings: ['Normal brain parenchyma', 'Intact gray-white matter differentiation', 'No acute hemorrhage', 'Normal ventricular system'],
          recommendations: ['Clinical correlation recommended', 'Follow-up as clinically indicated']
        },
        'MRI': {
          description: 'MRI brain with and without contrast shows normal brain morphology. T1 and T2 weighted sequences demonstrate appropriate signal characteristics. No abnormal enhancement following gadolinium administration.',
          findings: ['Normal brain morphology', 'Appropriate T1/T2 signal', 'No abnormal enhancement', 'Normal vascular flow'],
          recommendations: ['Routine follow-up', 'Correlate with neurological examination']
        }
      },
      'Chest': {
        'CT': {
          description: 'High-resolution CT of the chest shows clear lung fields bilaterally. No nodules, masses, or consolidation identified. Mediastinal structures appear normal. Heart size within normal limits.',
          findings: ['Clear lung fields', 'No pulmonary nodules', 'Normal mediastinal structures', 'Normal cardiac silhouette'],
          recommendations: ['No acute findings', 'Routine screening as appropriate']
        }
      },
      'Abdomen': {
        'CT': {
          description: 'Contrast-enhanced CT of the abdomen and pelvis demonstrates normal organ enhancement patterns. Liver, spleen, kidneys, and pancreas appear normal. No evidence of mass lesions or fluid collections.',
          findings: ['Normal organ enhancement', 'No mass lesions', 'Normal bowel patterns', 'No fluid collections'],
          recommendations: ['No acute abdominal pathology', 'Clinical correlation advised']
        }
      },
      'Spine': {
        'MRI': {
          description: 'MRI of the spine shows normal vertebral body alignment and disc spaces. No evidence of disc herniation, spinal stenosis, or cord compression. Normal spinal cord signal intensity.',
          findings: ['Normal vertebral alignment', 'Intact disc spaces', 'No neural compression', 'Normal cord signal'],
          recommendations: ['Conservative management', 'Physical therapy if symptomatic']
        }
      }
    };

    const template = analysisTemplates[bodyPart as keyof typeof analysisTemplates]?.[modality as keyof any] || {
      description: `${modality} imaging of the ${bodyPart.toLowerCase()} demonstrates satisfactory image quality for diagnostic interpretation. Systematic review of anatomical structures shows no obvious acute abnormalities.`,
      findings: ['Adequate image quality', 'No obvious acute findings', 'Systematic review completed'],
      recommendations: ['Clinical correlation recommended', 'Follow-up as indicated']
    };

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const confidence = Math.floor(Math.random() * 25) + 75; // 75-100%
    const priority = confidence > 90 ? 'low' : confidence > 80 ? 'medium' : confidence > 70 ? 'high' : 'critical';

    return {
      id: `analysis_${file.id}`,
      imageId: file.id,
      description: template.description,
      findings: template.findings,
      confidence,
      priority,
      bodyPart,
      modality,
      recommendations: template.recommendations,
      status: 'completed'
    };
  };

  const startAnalysis = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Images to Analyze",
        description: "Please upload medical images first before starting AI analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Initialize analyses for all uploaded files
    const initialAnalyses = uploadedFiles.map(file => ({
      id: `analysis_${file.id}`,
      imageId: file.id,
      description: '',
      findings: [],
      confidence: 0,
      priority: 'medium' as const,
      bodyPart: file.metadata?.bodyPart || 'Unknown',
      modality: file.metadata?.modality || 'Unknown',
      recommendations: [],
      status: 'analyzing' as const
    }));

    setAnalyses(initialAnalyses);

    try {
      // Process each file
      const completedAnalyses = await Promise.all(
        uploadedFiles.map(async (file, index) => {
          try {
            const analysis = await generateAIAnalysis(file);
            
            // Update individual analysis as it completes
            setAnalyses(prev => prev.map(a => 
              a.imageId === file.id ? analysis : a
            ));
            
            return analysis;
          } catch (error) {
            const errorAnalysis = {
              ...initialAnalyses[index],
              status: 'error' as const,
              description: 'Analysis failed due to technical error. Please try again.',
              findings: ['Analysis error occurred'],
              recommendations: ['Manual review recommended']
            };
            
            setAnalyses(prev => prev.map(a => 
              a.imageId === file.id ? errorAnalysis : a
            ));
            
            return errorAnalysis;
          }
        })
      );

      onAnalysisComplete(completedAnalyses);
      
      toast({
        title: "AI Analysis Complete",
        description: `Successfully analyzed ${completedAnalyses.length} medical image(s) with comprehensive diagnostic insights.`,
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to complete AI analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startVoiceDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      toast({
        title: "Voice Recording Started",
        description: "Speak your findings and observations...",
      });
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setDictatedText(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast({
        title: "Voice Recognition Error",
        description: "There was an error with voice recognition. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const generateReport = () => {
    const reportContent = analyses.map(analysis => {
      return `
MEDICAL IMAGING REPORT

Patient Information:
- Study: ${analysis.modality} ${analysis.bodyPart}
- AI Confidence: ${analysis.confidence}%
- Priority: ${analysis.priority.toUpperCase()}

Clinical Description:
${analysis.description}

Key Findings:
${analysis.findings.map(finding => `• ${finding}`).join('\n')}

Recommendations:
${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}

${dictatedText ? `\nAdditional Clinical Notes:\n${dictatedText}` : ''}

---
Report generated on: ${new Date().toLocaleString()}
      `;
    }).join('\n\n');

    // Create and download the report
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Generated",
      description: "Medical report has been downloaded successfully.",
    });
  };

  const createCase = () => {
    if (!newCaseData.patientName || !newCaseData.patientId) {
      toast({
        title: "Missing Information",
        description: "Please fill in patient name and ID.",
        variant: "destructive",
      });
      return;
    }

    const newCase: MedicalCase = {
      id: `case_${Date.now()}`,
      imageName: `analysis_${Date.now()}.dcm`,
      patientId: newCaseData.patientId,
      patientName: newCaseData.patientName,
      patientAge: null,
      modality: analyses[0]?.modality || 'CT',
      imageType: analyses[0]?.modality as 'MRI' | 'CT' || 'CT',
      priority: newCaseData.priority,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      aiConfidence: analyses[0]?.confidence || 85,
      bodyPart: analyses[0]?.bodyPart || 'Unknown',
      findings: newCaseData.findings || analyses[0]?.description,
      imageAge: '0m ago',
      source: 'system' // AI workflow is system-processed
    };

    setCreatedCase(newCase);

    if (onCaseCreated) {
      onCaseCreated(newCase);
    }

    toast({
      title: "Case Created and Saved Successfully",
      description: `New case for ${newCaseData.patientName} has been added to the system.`,
    });

    // Reset form but keep case creation visible for additional actions
    setNewCaseData({
      patientName: '',
      patientId: '',
      findings: '',
      priority: 'medium'
    });
  };

  const sendEmailReport = () => {
    if (!createdCase) {
      toast({
        title: "No Case Available",
        description: "Please create a case first before sending email reports.",
        variant: "destructive",
      });
      return;
    }

    // Simulate email sending
    const emailContent = `
Subject: Medical Imaging Report - ${createdCase.patientName} (${createdCase.patientId})

Dear Healthcare Provider,

Please find attached the medical imaging report for patient ${createdCase.patientName}.

Case Details:
- Patient ID: ${createdCase.patientId}
- Study Type: ${createdCase.imageType} ${createdCase.bodyPart}
- Priority: ${createdCase.priority.toUpperCase()}
- AI Confidence: ${createdCase.aiConfidence}%

${createdCase.findings || 'Detailed findings are available in the attached report.'}

Generated on: ${new Date().toLocaleString()}

Best regards,
Mazo Radiology-AI System
    `;

    console.log('Email Report Content:', emailContent);
    
    toast({
      title: "Email Report Sent",
      description: "Medical imaging report has been sent via email successfully.",
    });
  };

  const sendSMSReport = () => {
    if (!createdCase) {
      toast({
        title: "No Case Available",
        description: "Please create a case first before sending SMS reports.",
        variant: "destructive",
      });
      return;
    }

    // Simulate SMS sending
    const smsContent = `
URGENT: Medical Report for ${createdCase.patientName} (${createdCase.patientId})
Priority: ${createdCase.priority.toUpperCase()}
Study: ${createdCase.imageType} ${createdCase.bodyPart}
AI Confidence: ${createdCase.aiConfidence}%
Report available in system. Contact for details.
    `;

    console.log('SMS Report Content:', smsContent);
    
    toast({
      title: "SMS Report Sent",
      description: "Medical imaging report summary has been sent via SMS successfully.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzing': return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  if (uploadedFiles.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-600">Upload medical images to enable AI analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Analysis Control */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span>Step 1: AI Medical Image Analysis</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                onClick={startVoiceDictation}
                variant={isRecording ? "destructive" : "outline"}
                className={isRecording ? "animate-pulse" : ""}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Dictation
                  </>
                )}
              </Button>
              <Button
                onClick={startAnalysis}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Start AI Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Advanced AI will analyze your medical images to provide detailed diagnostic insights, 
            identify potential findings, and suggest clinical recommendations.
          </p>
          
          {/* Voice Dictation Area */}
          {(dictatedText || isRecording) && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-sm font-medium text-blue-800 mb-2 block">
                {isRecording ? "Recording..." : "Dictated Notes:"}
              </Label>
              <Textarea
                value={dictatedText}
                onChange={(e) => setDictatedText(e.target.value)}
                placeholder="Your voice dictation will appear here..."
                className="min-h-[100px] bg-white"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Case Creation Form */}
      {analyses.length > 0 && analyses.some(a => a.status === 'completed') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-green-600" />
              <span>Step 2: Create New Medical Case</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  value={newCaseData.patientName}
                  onChange={(e) => setNewCaseData(prev => ({ ...prev, patientName: e.target.value }))}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  value={newCaseData.patientId}
                  onChange={(e) => setNewCaseData(prev => ({ ...prev, patientId: e.target.value }))}
                  placeholder="Enter patient ID"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <select 
                id="priority"
                value={newCaseData.priority}
                onChange={(e) => setNewCaseData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full p-2 border border-slate-300 rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <Label htmlFor="findings">Clinical Findings</Label>
              <Textarea
                id="findings"
                value={newCaseData.findings}
                onChange={(e) => setNewCaseData(prev => ({ ...prev, findings: e.target.value }))}
                placeholder="Enter clinical findings or use AI analysis results..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button onClick={createCase} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add and Save Case
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: View, Generate and Send Reports */}
      {createdCase && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Step 3: View, Generate and Send Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Case Created Successfully</h4>
              <p className="text-sm text-green-700">
                <strong>Patient:</strong> {createdCase.patientName} ({createdCase.patientId})<br />
                <strong>Study:</strong> {createdCase.imageType} {createdCase.bodyPart}<br />
                <strong>Priority:</strong> {createdCase.priority.toUpperCase()}<br />
                <strong>AI Confidence:</strong> {createdCase.aiConfidence}%
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={generateReport} variant="outline" className="flex-1 min-w-0">
                <FileText className="h-4 w-4 mr-2" />
                Generate & Download Report
              </Button>
              <Button onClick={sendEmailReport} variant="outline" className="flex-1 min-w-0">
                <Mail className="h-4 w-4 mr-2" />
                Email Report
              </Button>
              <Button onClick={sendSMSReport} variant="outline" className="flex-1 min-w-0">
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analyses.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">Analysis Results</h4>
          
          {analyses.map((analysis) => {
            const associatedFile = uploadedFiles.find(f => f.id === analysis.imageId);
            
            return (
              <Card key={analysis.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                        {associatedFile && (
                          <img
                            src={associatedFile.preview}
                            alt="Medical scan"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusIcon(analysis.status)}
                          <h5 className="font-medium text-slate-900">
                            {analysis.modality} - {analysis.bodyPart}
                          </h5>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(analysis.priority)}>
                            {analysis.priority.toUpperCase()}
                          </Badge>
                          {analysis.status === 'completed' && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              <Activity className="h-3 w-3 mr-1" />
                              {analysis.confidence}% Confidence
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {analysis.status === 'analyzing' ? (
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-blue-800">AI is analyzing the medical image...</span>
                    </div>
                  ) : analysis.status === 'completed' ? (
                    <>
                      {/* Description */}
                      <div>
                        <h6 className="font-medium text-slate-900 mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Clinical Description
                        </h6>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">
                          {analysis.description}
                        </p>
                      </div>

                      {/* Findings */}
                      <div>
                        <h6 className="font-medium text-slate-900 mb-2">Key Findings</h6>
                        <div className="space-y-1">
                          {analysis.findings.map((finding, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-slate-700">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                              <span>{finding}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h6 className="font-medium text-slate-900 mb-2">Recommendations</h6>
                        <div className="space-y-1">
                          {analysis.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-slate-600">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-red-800 text-sm">
                        Analysis failed. Please try uploading the image again or contact support.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
