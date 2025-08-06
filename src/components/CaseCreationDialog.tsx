import React, { useState } from 'react';
import { User, Calendar, FileText, Stethoscope, AlertCircle, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PatientDetails {
  name: string;
  age: string;
  gender: string;
  patientId: string;
  symptoms: string;
  medicalHistory: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface CaseCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData: any;
  imageFiles: File[];
  onCaseCreated: (caseData: any) => void;
}

export const CaseCreationDialog: React.FC<CaseCreationDialogProps> = ({
  open,
  onOpenChange,
  reportData,
  imageFiles,
  onCaseCreated
}) => {
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    name: '',
    age: '',
    gender: '',
    patientId: '',
    symptoms: '',
    medicalHistory: '',
    urgency: 'medium'
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const totalSteps = 4;
  const stepTitles = [
    'Patient Information',
    'Review AI Report', 
    'Add Radiologist Notes',
    'Confirm & Save'
  ];

  const validateForm = () => {
    const required = ['name', 'age', 'patientId'];
    const missing = required.filter(field => !patientDetails[field as keyof PatientDetails]);
    return missing.length === 0;
  };

  const createCase = async () => {
    console.log('Creating case - Auth state:', { user: !!user, loading, userId: user?.id });
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required patient details.",
      });
      return;
    }

    // Wait for authentication to load if still loading
    if (loading) {
      console.log('Authentication still loading, waiting...');
      toast({
        title: "Loading Authentication",
        description: "Please wait while we verify your authentication status.",
      });
      return;
    }

    // Check if user is authenticated
    if (!user?.id) {
      console.error('Authentication failed - User object:', user);
      toast({
        variant: "destructive",
        title: "Authentication Required", 
        description: "Please refresh the page and log in again to create a case.",
      });
      return;
    }

    console.log('User authenticated successfully:', user.email);

    setIsCreating(true);

    try {
      // Create case data combining patient info and AI report
      const caseData = {
        body_part: reportData?.bodyPart || 'Unknown',
        image_name: imageFiles[0]?.name || 'Unknown',
        modality: 'Unknown', // This could be extracted from DICOM data
        severity_rating: getSeverityRating(patientDetails.urgency),
        status: 'open',
        radiologist_notes: reportData?.reportText || '',
        comment: `AI Analysis Results: ${JSON.stringify(reportData?.analysisResults || {})}`,
        image_data: JSON.stringify({
          patientDetails,
          aiReport: reportData,
          voiceNotes: reportData?.voiceNotes || '',
          uploadedFiles: imageFiles.map(f => ({ name: f.name, size: f.size }))
        }),
        storage_path: null, // This would be set after file upload
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('medical_cases')
        .insert([caseData])
        .select()
        .single();

      if (error) {
        console.error('Error creating case:', error);
        throw error;
      }

      toast({
        title: "Case Created Successfully",
        description: `Medical case for ${patientDetails.name} has been created.`,
      });

      onCaseCreated(data);
      onOpenChange(false);

      // Reset form
      setPatientDetails({
        name: '',
        age: '',
        gender: '',
        patientId: '',
        symptoms: '',
        medicalHistory: '',
        urgency: 'medium'
      });

    } catch (error: any) {
      console.error('Error creating case:', error);
      toast({
        variant: "destructive",
        title: "Error Creating Case",
        description: "Failed to save case. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getSeverityRating = (urgency: string): number => {
    switch (urgency) {
      case 'critical': return 10;
      case 'high': return 8;
      case 'medium': return 6;
      case 'low': return 4;
      default: return 5;
    }
  };

  const updatePatientDetail = (field: keyof PatientDetails, value: string) => {
    setPatientDetails(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return patientDetails.name && patientDetails.age && patientDetails.patientId;
      case 2:
      case 3:
        return true;
      case 4:
        return validateForm();
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Patient Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="patientName" className="font-semibold">
                    Patient Name *
                  </Label>
                  <Input
                    id="patientName"
                    value={patientDetails.name}
                    onChange={(e) => updatePatientDetail('name', e.target.value)}
                    placeholder="Enter full patient name"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientId" className="font-semibold">
                    Patient ID *
                  </Label>
                  <Input
                    id="patientId"
                    value={patientDetails.patientId}
                    onChange={(e) => updatePatientDetail('patientId', e.target.value)}
                    placeholder="Enter unique patient ID"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="font-semibold">
                    Age *
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={patientDetails.age}
                    onChange={(e) => updatePatientDetail('age', e.target.value)}
                    placeholder="Enter age"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="font-semibold">
                    Gender
                  </Label>
                  <Select value={patientDetails.gender} onValueChange={(value) => updatePatientDetail('gender', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency" className="font-semibold">
                    Case Urgency
                  </Label>
                  <Select value={patientDetails.urgency} onValueChange={(value: any) => updatePatientDetail('urgency', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low - Routine</SelectItem>
                      <SelectItem value="medium">🟡 Medium - Standard</SelectItem>
                      <SelectItem value="high">🟠 High - Urgent</SelectItem>
                      <SelectItem value="critical">🔴 Critical - Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symptoms" className="font-semibold">
                    Current Symptoms
                  </Label>
                  <Textarea
                    id="symptoms"
                    value={patientDetails.symptoms}
                    onChange={(e) => updatePatientDetail('symptoms', e.target.value)}
                    placeholder="Describe current symptoms and presenting complaints..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalHistory" className="font-semibold">
                    Medical History
                  </Label>
                  <Textarea
                    id="medicalHistory"
                    value={patientDetails.medicalHistory}
                    onChange={(e) => updatePatientDetail('medicalHistory', e.target.value)}
                    placeholder="Enter relevant medical history, previous procedures, medications, etc..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">AI Analysis Report</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <span className="font-medium">Overall Severity:</span>
                  <Badge className="ml-2" variant="secondary">
                    {reportData?.analysisResults?.overallSeverity || 'Unknown'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Confidence:</span>
                  <Badge className="ml-2" variant="outline">
                    {reportData?.analysisResults?.confidence || 0}%
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Detected Abnormalities:</h4>
                  {reportData?.analysisResults?.abnormalities?.map((abn: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{abn.type}</span>
                        <Badge variant={abn.severity === 'High' ? 'destructive' : 'secondary'}>
                          {abn.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{abn.location}</p>
                    </div>
                  )) || <p className="text-gray-500">No abnormalities detected</p>}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Clinical Recommendations:</h4>
                  <ul className="space-y-1">
                    {reportData?.analysisResults?.clinicalInsights?.map((insight: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{insight}</span>
                      </li>
                    )) || <li className="text-gray-500">No specific recommendations</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Radiologist Notes</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Additional Clinical Notes</Label>
                  <Textarea
                    value={reportData?.reportText || ''}
                    placeholder="Add any additional clinical observations, interpretations, or notes..."
                    className="min-h-[150px] mt-2"
                    readOnly
                  />
                </div>

                {reportData?.voiceNotes && (
                  <div>
                    <Label className="font-semibold">Voice Transcription</Label>
                    <Textarea
                      value={reportData.voiceNotes}
                      placeholder="Voice notes from dictation..."
                      className="min-h-[100px] mt-2"
                      readOnly
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Review & Confirm</h3>
              </div>

              <div className="space-y-6">
                {/* Patient Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Patient Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Name:</span> {patientDetails.name}</div>
                    <div><span className="font-medium">ID:</span> {patientDetails.patientId}</div>
                    <div><span className="font-medium">Age:</span> {patientDetails.age}</div>
                    <div><span className="font-medium">Gender:</span> {patientDetails.gender || 'Not specified'}</div>
                    <div className="col-span-2">
                      <span className="font-medium">Urgency:</span> 
                      <Badge className="ml-2" variant={
                        patientDetails.urgency === 'critical' ? 'destructive' :
                        patientDetails.urgency === 'high' ? 'secondary' : 'outline'
                      }>
                        {patientDetails.urgency}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Summary */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">AI Analysis Summary</h4>
                  <div className="text-sm">
                    <p><span className="font-medium">Severity:</span> {reportData?.analysisResults?.overallSeverity}</p>
                    <p><span className="font-medium">Confidence:</span> {reportData?.analysisResults?.confidence}%</p>
                    <p><span className="font-medium">Findings:</span> {reportData?.analysisResults?.abnormalities?.length || 0} abnormalities detected</p>
                  </div>
                </div>

                {!validateForm() && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please ensure all required patient information is complete.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-2xl">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span>Create Medical Case</span>
          </DialogTitle>
          <DialogDescription>
            Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full">
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              {stepTitles.map((title, index) => (
                <span 
                  key={index} 
                  className={`${index + 1 === currentStep ? 'text-blue-600 font-medium' : ''}`}
                >
                  {index + 1}. {title}
                </span>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? () => onOpenChange(false) : prevStep}
              disabled={isCreating}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{currentStep === 1 ? 'Cancel' : 'Previous'}</span>
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed() || isCreating}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={createCase}
                disabled={!canProceed() || isCreating}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{isCreating ? 'Creating Case...' : 'Create Case'}</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};