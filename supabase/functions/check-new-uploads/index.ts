import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Checking for new unprocessed uploads...');

    // Get all files from dicom-files bucket
    const { data: files, error: listError } = await supabaseClient.storage
      .from('dicom-files')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (listError) {
      console.error('❌ Error listing files:', listError);
      throw listError;
    }

    if (!files || files.length === 0) {
      console.log('📂 No files found in bucket');
      return new Response(
        JSON.stringify({ message: 'No files to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📁 Found ${files.length} files in bucket`);

    // Check which files don't have corresponding medical_cases records
    let processedCount = 0;
    
    for (const file of files) {
      if (!file.name) continue;

      // Check if this file already has a medical case record
      const { data: existingCase, error: queryError } = await supabaseClient
        .from('medical_cases')
        .select('id')
        .eq('storage_path', file.name)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        console.error(`❌ Error checking existing case for ${file.name}:`, queryError);
        continue;
      }

      if (existingCase) {
        console.log(`✅ File ${file.name} already processed`);
        continue;
      }

      console.log(`🔄 Processing new file: ${file.name}`);

      // Determine source based on filename
      const source = file.name.includes('manual') ? 'manual' : 'system';
      console.log(`📝 File ${file.name} will be marked as: ${source}`);

      // Call the process-dicom-file function for unprocessed files
      const { data: result, error: processError } = await supabaseClient.functions
        .invoke('process-dicom-file', {
          body: {
            fileName: file.name,
            bucketName: 'dicom-files',
            source: source
          }
        });

      if (processError) {
        console.error(`❌ Error processing ${file.name}:`, processError);
        continue;
      }

      console.log(`✅ Successfully processed: ${file.name}`);
      processedCount++;
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${processedCount} new files`,
        totalFiles: files.length,
        processedCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in check-new-uploads:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});