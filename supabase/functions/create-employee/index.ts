
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the user that called the function
    const supabaseAuthClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Check if the user is an admin
    const { data: { user } } = await supabaseAuthClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // You might also want to check the user's role in the profiles table
    // However, since we are using the service role key later, we must ensure authorization here.
    // Let's assume metadata or a profile check.
    // For now, we trust the Auth token, but a real app should check 'profiles.role'

    // Create admin client for privileged operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Double check admin role
    const { data: callerProfile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!callerProfile || callerProfile.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can create employees');
    }

    const { email, password, name, role = 'employee', ...employeeData } = await req.json();

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (authError) throw authError;

    // 2. Insert into profiles (if not handled by trigger, but here we can force it or update it)
    // Actually, usually a trigger on auth.users inserts into profiles.
    // If you have a trigger, you might need to update the profile with the role.

    // Let's assume there is a trigger that creates a profile.
    // If not, we should insert it. The migration showed `profiles` table.
    // "1. Profiles table ... Links to employee records for employee users"

    // Check if profile exists (due to trigger)
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (!profile) {
      // Create profile if it doesn't exist
       await supabaseClient
        .from('profiles')
        .insert({
          id: authData.user.id,
          role: role,
          full_name: name,
        });
    } else {
        // Update profile
         await supabaseClient
        .from('profiles')
        .update({
            role: role,
            full_name: name
        })
        .eq('id', authData.user.id);
    }

    // 3. Create Employee Record
    // The employee record needs the user_id
    const { data: employee, error: employeeError } = await supabaseClient
      .from('employees')
      .insert({
        ...employeeData,
        email,
        name,
        user_id: authData.user.id,
      })
      .select()
      .single();

    if (employeeError) {
      // Clean up auth user if employee creation fails?
      await supabaseClient.auth.admin.deleteUser(authData.user.id);
      throw employeeError;
    }

    // 4. Update Profile to link to Employee ID
    await supabaseClient
        .from('profiles')
        .update({ employee_id: employee.id })
        .eq('id', authData.user.id);

    return new Response(
      JSON.stringify({ user: authData.user, employee }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
