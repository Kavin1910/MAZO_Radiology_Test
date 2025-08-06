
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Processing DICOM file trigger...')
    
    // Handle both webhook payload formats
    const body = await req.json()
    console.log('Request body:', body)
    
    // Extract record from different possible payload structures
    const record = body.record || body.Records?.[0] || body
    console.log('Storage event record:', record)

    if (!record || (!record.name && !record.fileName)) {
      console.log('No valid record or filename found in payload')
      return new Response(JSON.stringify({ message: 'No valid file record found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Get filename from either name or fileName property
    const fileName = record.name || record.fileName
    console.log('Processing file:', fileName)

    // Only process .dcm files or image files
    const isValidFile = fileName.endsWith('.dcm') || 
                       fileName.endsWith('.jpg') || 
                       fileName.endsWith('.jpeg') || 
                       fileName.endsWith('.png') || 
                       fileName.endsWith('.tiff') || 
                       fileName.endsWith('.tif')

    if (!isValidFile) {
      console.log('Skipping non-medical file:', fileName)
      return new Response(JSON.stringify({ message: 'Not a medical file' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log('Processing medical file:', fileName)

    // Determine source based on multiple criteria:
    // 1. Check if userId is provided in the payload (indicates manual upload from UI)
    // 2. Check if filename contains "manual" (case insensitive) - PRIMARY DETECTION
    // 3. Check if the record has specific properties indicating manual upload
    let source = 'system'
    let userId = null

    console.log('Filename analysis:', {
      fileName,
      containsManual: fileName.toLowerCase().includes('manual'),
      startsWithManual: fileName.toLowerCase().startsWith('manual-'),
      hasUserId: !!record.userId
    })

    // Priority 1: Check filename for "manual" indicator (MAIN DETECTION FOR MANUAL UPLOADS)
    if (fileName.toLowerCase().includes('manual') || fileName.toLowerCase().startsWith('manual-')) {
      source = 'manual'
      console.log('✅ Manual upload detected via filename pattern:', fileName)
      
      // Try to extract user from auth context or set to null for now
      // Manual uploads should still be associated with current session if possible
      try {
        const authHeader = req.headers.get('authorization')
        if (authHeader) {
          // Note: In production, you'd decode the JWT to get user_id
          console.log('Auth header present for manual upload')
        }
      } catch (e) {
        console.log('No auth context available for manual upload')
      }
    }
    // Priority 2: Check if userId is provided (manual upload from UI)
    else if (record.userId) {
      source = 'manual'
      userId = record.userId
      console.log('✅ Manual upload detected via userId:', userId)
    }
    // Priority 3: Check for timestamp patterns that indicate UI upload
    else if (fileName.includes('-') && /\d{13}/.test(fileName)) {
      source = 'manual'
      console.log('✅ Manual upload detected via timestamp pattern:', fileName)
    }

    console.log('🎯 FINAL DETERMINATION:', {
      source,
      fileName,
      userId,
      reasoning: source === 'manual' ? 'Contains manual in filename' : 'No manual indicators found'
    })

    // Mock medical analysis - in real implementation, you'd analyze the actual file
    const mockAnalysis = {
      patient_name: `Patient_${Math.floor(Math.random() * 1000)}`,
      patient_age: Math.floor(Math.random() * 80) + 20,
      modality: 'CT',
      body_part: 'Chest',
      findings: `${source === 'manual' ? 'Manually uploaded' : 'System processed'} medical image with normal findings.`,
      confidence_score: Math.floor(Math.random() * 40) + 60, // 60-100%
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      status: 'open'
    }

    console.log(`🚀 About to insert case with source="${source}" and userId="${userId}" for file: ${fileName}`)

    // Create medical case record with proper source
    const { data: caseData, error: insertError } = await supabaseClient
      .from('medical_cases')
      .insert({
        image_name: fileName,
        patient_name: mockAnalysis.patient_name,
        patient_age: mockAnalysis.patient_age,
        modality: mockAnalysis.modality,
        body_part: mockAnalysis.body_part,
        findings: mockAnalysis.findings,
        confidence_score: mockAnalysis.confidence_score,
        priority: mockAnalysis.priority,
        status: mockAnalysis.status,
        storage_path: `dicom-files/${fileName}`,
        image_data: `data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
        source: source, // Set the source based on detection logic
        user_id: userId, // Set user_id for manual uploads, null for system
        severity_rating: Math.floor(Math.random() * 5) + 1
      })
      .select()
      .single()

    console.log(`📋 Inserted case with ID: ${caseData?.id}, source: ${caseData?.source}, for file: ${fileName}`)

    if (insertError) {
      console.error('Error inserting case:', insertError)
      throw insertError
    }

    console.log('Successfully created medical case:', caseData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        case: caseData,
        message: `Medical file ${fileName} processed successfully as ${source} case`,
        source: source,
        userId: userId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing medical file:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
