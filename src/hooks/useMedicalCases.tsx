
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MedicalCase {
  id: string;
  imageName: string;
  patientName: string;
  patientId: string;
  patientAge: number | null;
  modality: string;
  bodyPart: string;
  status: 'open' | 'in_review' | 'completed' | 'rejected' | 'in-progress' | 'review-completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  aiConfidence: number;
  findings: string;
  recommendations?: string;
  createdAt: string;
  updatedAt: string;
  processedAt: string;
  userId?: string;
  patientGender?: string;
  institutionName?: string;
  assignedRadiologist?: string;
  assignedTo?: string;
  comment?: string;
  imageData?: string;
  radiologistNotes?: string;
  imageType?: string;
  imageAge?: string;
  source: 'manual' | 'system';
}

// Convert severity rating (1-10) to priority
const severityToPriority = (severityRating: number): 'low' | 'medium' | 'high' | 'critical' => {
  console.log(`🔍 Converting severity rating ${severityRating} to priority`);
  
  if (severityRating >= 8) {
    console.log(`✅ Severity ${severityRating} → critical (8-10 range)`);
    return 'critical';  // 8-10 is Critical
  }
  if (severityRating >= 6) {
    console.log(`✅ Severity ${severityRating} → high (6-7 range)`);
    return 'high';      // 6-7 is High  
  }
  if (severityRating >= 3) {
    console.log(`✅ Severity ${severityRating} → medium (3-5 range)`);
    return 'medium';    // 3-5 is Medium
  }
  
  console.log(`✅ Severity ${severityRating} → low (1-2 range)`);
  return 'low';         // 1-2 is Low
};

// Transform database row to MedicalCase interface
const transformDatabaseCase = (dbCase: any): MedicalCase => {
  console.log(`🔄 Transforming case ${dbCase.id}:`, {
    id: dbCase.id,
    patient_name: dbCase.patient_name,
    severity_rating: dbCase.severity_rating,
    confidence_score: dbCase.confidence_score,
    raw_case: dbCase
  });

  // Determine source - prioritize the source field from database
  let source: 'manual' | 'system' = dbCase.source || 'system';
  
  // If no source is set, use fallback logic
  if (!dbCase.source) {
    if (dbCase.user_id) {
      source = 'manual'; // Has user_id, likely manual
    } else if (dbCase.image_name && dbCase.image_name.toLowerCase().includes('manual')) {
      source = 'manual'; // Filename contains manual
    } else {
      source = 'system'; // Default to system
    }
  }
  
  console.log(`📋 Case ${dbCase.id}: Source from DB="${dbCase.source}", Final source="${source}", UserID="${dbCase.user_id}", Filename="${dbCase.image_name}"`);
  
  // Generate patientId from patient_name if not available
  const patientId = dbCase.patient_id || 
    (dbCase.patient_name ? `P${dbCase.patient_name.replace(/\s+/g, '').toUpperCase().slice(0, 6)}${Math.floor(Math.random() * 1000)}` : `P${Math.floor(Math.random() * 100000)}`);
  
  // Determine imageType from modality or body_part
  const imageType = dbCase.modality || dbCase.body_part || 'Unknown';
  
  // Calculate imageAge based on created_at
  const calculateImageAge = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    return '< 1h';
  };
  
  // Get confidence score directly from database (should be 0-100)
  const confidenceScore = dbCase.confidence_score || 0;
  console.log(`🎯 Case ${dbCase.id}: Raw confidence_score from DB:`, dbCase.confidence_score, '→ Final confidence score:', confidenceScore);
  
  // Get severity rating from database and convert to priority
  const severityRating = dbCase.severity_rating || 5; // Default to 5 if not set
  console.log(`⚖️  Case ${dbCase.id}: Raw severity_rating from DB:`, dbCase.severity_rating, '→ Using severity rating:', severityRating);
  
  // CRITICAL: Always recalculate priority based on severity rating
  const priority = severityToPriority(severityRating);
  console.log(`🎯 Case ${dbCase.id}: FINAL PRIORITY CALCULATION - Severity ${severityRating} → Priority: "${priority}"`);
  
  const transformedCase = {
    id: dbCase.id,
    imageName: dbCase.image_name,
    patientName: dbCase.patient_name || 'Unknown Patient',
    patientId: patientId,
    patientAge: dbCase.patient_age,
    modality: dbCase.modality || 'Unknown',
    bodyPart: dbCase.body_part || 'Unknown',
    status: dbCase.status || 'open',
    priority: priority, // Use the converted priority based on severity_rating
    aiConfidence: confidenceScore, // Use confidence_score directly from database
    findings: dbCase.findings || 'No findings available',
    recommendations: dbCase.recommendations,
    createdAt: dbCase.created_at,
    updatedAt: dbCase.updated_at,
    processedAt: dbCase.processed_at,
    userId: dbCase.user_id,
    patientGender: dbCase.patient_gender,
    institutionName: dbCase.institution_name,
    assignedRadiologist: dbCase.assigned_radiologist,
    assignedTo: dbCase.assigned_radiologist,
    comment: dbCase.comment,
    imageData: dbCase.image_data,
    radiologistNotes: dbCase.radiologist_notes,
    imageType: imageType,
    imageAge: calculateImageAge(dbCase.created_at),
    source: source
  };

  console.log(`✅ Case ${dbCase.id} transformed successfully:`, {
    id: transformedCase.id,
    patientName: transformedCase.patientName,
    priority: transformedCase.priority,
    severityRating: severityRating,
    aiConfidence: transformedCase.aiConfidence,
    source: transformedCase.source,
    imageName: transformedCase.imageName
  });

  return transformedCase;
};

export const useMedicalCases = () => {
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching medical cases...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ Auth error:', userError);
        throw new Error('Authentication failed');
      }

      if (!user) {
        console.log('⚠️  No authenticated user found');
        setCases([]);
        return;
      }

      console.log(`👤 Fetching cases for user: ${user.id}`);
      
      // Fetch cases for the current user and system cases (where user_id is null)
      const { data, error } = await supabase
        .from('medical_cases')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw new Error(`Failed to fetch cases: ${error.message}`);
      }

  console.log('📊 Raw cases from database:', data);
  
  // Transform and set cases
  const transformedCases = data?.map(transformDatabaseCase) || [];
  console.log('✅ All transformed cases:', transformedCases.map(c => ({
    id: c.id,
    patientName: c.patientName,
    priority: c.priority,
    aiConfidence: c.aiConfidence,
    source: c.source,
    imageName: c.patientId
      })));
      
      // Log manual vs system breakdown
      const manualCases = transformedCases.filter(c => c.source === 'manual');
      const systemCases = transformedCases.filter(c => c.source === 'system');
      console.log(`📈 Found ${manualCases.length} manual cases and ${systemCases.length} system cases`);
      
      setCases(transformedCases);
      
    } catch (error) {
      console.error('❌ Error fetching cases:', error);
      toast({
        variant: "destructive",
        title: "Failed to load cases",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Add a new case to the state
  const addCase = useCallback((newCaseData: any) => {
    console.log('➕ Adding new case to state:', newCaseData);
    const transformedCase = transformDatabaseCase(newCaseData);
    setCases(prev => [transformedCase, ...prev]);
    
    toast({
      title: "New case added",
      description: `Case ${transformedCase.imageName} has been processed and added to your dashboard`,
    });
  }, [toast]);

  // Update an existing case in the state
  const updateCase = useCallback((updatedCase: MedicalCase) => {
    console.log('🔄 Updating case in state:', updatedCase);
    setCases(prev => 
      prev.map(case_ => 
        case_.id === updatedCase.id ? updatedCase : case_
      )
    );
    
    toast({
      title: "Case updated",
      description: `Case ${updatedCase.imageName} has been updated`,
    });
  }, [toast]);

  // Initial fetch on mount and when auth state changes
  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Set up automatic refresh every minute (60000ms)
  useEffect(() => {
    console.log('⏰ Setting up auto-refresh interval for medical cases...');
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing medical cases... (60 second interval)');
      fetchCases();
    }, 60000); // 60 seconds

    return () => {
      console.log('🛑 Cleaning up auto-refresh interval');
      clearInterval(interval);
    };
  }, [fetchCases]);

  return {
    cases,
    loading,
    addCase,
    updateCase,
    refetch: fetchCases
  };
};
