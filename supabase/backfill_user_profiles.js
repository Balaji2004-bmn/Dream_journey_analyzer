require('dotenv').config({ path: '../backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function backfillUserProfiles() {
  try {
    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // Get all existing user profiles
    const { data: existingProfiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id');
    if (profileError) throw profileError;

    const existingProfileIds = new Set(existingProfiles.map(p => p.user_id));

    // Find users who are missing a profile
    const missingProfiles = authUsers.users.filter(user => !existingProfileIds.has(user.id));

    if (missingProfiles.length === 0) {
      console.log('All users have a profile. No backfill needed.');
      return;
    }

    console.log(`Found ${missingProfiles.length} users missing a profile. Backfilling...`);

    const profilesToInsert = missingProfiles.map(user => ({
      user_id: user.id,
      role: 'user',
      is_active: true,
      created_at: user.created_at,
      updated_at: new Date().toISOString()
    }));

    // Insert the missing profiles
    const { error: insertError } = await supabaseAdmin
      .from('user_profiles')
      .insert(profilesToInsert);

    if (insertError) throw insertError;

    console.log(`Successfully backfilled ${profilesToInsert.length} user profiles.`);

  } catch (error) {
    console.error('Error backfilling user profiles:', error.message);
  }
}

backfillUserProfiles();
