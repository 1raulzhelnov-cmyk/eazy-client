import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabase.auth.setSession({
        access_token: authHeader.replace('Bearer ', ''),
        refresh_token: '',
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const method = req.method;

    console.log(`File Upload Service: ${method} ${path}`);

    // POST /upload - Upload file to storage
    if (method === 'POST' && path === 'upload') {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const bucket = formData.get('bucket') as string;
      const folder = formData.get('folder') as string || '';
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate file type and size
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (file.size > maxSize) {
        return new Response(JSON.stringify({ error: 'File too large. Maximum size is 10MB' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!allowedTypes.includes(file.type)) {
        return new Response(JSON.stringify({ error: 'File type not allowed' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomId}.${extension}`;
      
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      // Get public URL if bucket is public
      let publicUrl = null;
      if (bucket === 'review-photos' || bucket === 'menu-images') {
        const { data: { publicUrl: url } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        publicUrl = url;
      }

      // Log file upload activity
      await supabase.rpc('audit_data_access', {
        action_name: 'file_upload',
        resource_name: 'storage',
        resource_identifier: filePath,
        additional_details: {
          bucket,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type
        }
      });

      return new Response(JSON.stringify({ 
        path: data.path,
        fullPath: data.fullPath,
        publicUrl,
        fileName: file.name,
        size: file.size,
        type: file.type
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /delete - Delete file from storage
    if (method === 'DELETE' && path === 'delete') {
      const body = await req.json();
      const { bucket, filePath } = body;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      // Log file deletion activity
      await supabase.rpc('audit_data_access', {
        action_name: 'file_delete',
        resource_name: 'storage',
        resource_identifier: filePath,
        additional_details: { bucket }
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /files - List files in bucket/folder
    if (method === 'GET' && path === 'files') {
      const { bucket, folder = '', limit = '100' } = Object.fromEntries(url.searchParams);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: files, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: parseInt(limit),
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      // Get public URLs for public buckets
      const filesWithUrls = files?.map(file => {
        let publicUrl = null;
        if (bucket === 'review-photos' || bucket === 'menu-images') {
          const { data: { publicUrl: url } } = supabase.storage
            .from(bucket)
            .getPublicUrl(folder ? `${folder}/${file.name}` : file.name);
          publicUrl = url;
        }
        return { ...file, publicUrl };
      });

      return new Response(JSON.stringify({ files: filesWithUrls }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /generate-signed-url - Generate signed URL for private files
    if (method === 'POST' && path === 'generate-signed-url') {
      const body = await req.json();
      const { bucket, filePath, expiresIn = 3600 } = body;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;

      return new Response(JSON.stringify({ signedUrl: data.signedUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('File Upload Service Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});