import { supabaseAdmin as supabase } from './config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  try {
    // 1. Get a user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email');
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return;
    }
    console.log('Users in DB:', users);
    if (!users || users.length === 0) {
      console.log('No users found in database.');
      return;
    }

    const userId = users[0].id;
    console.log(`Using user ID: ${userId}`);

    // 2. Test project_members query
    console.log('Testing project_members query...');
    const { data: memberProjects, error: memberError } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', userId);
    
    if (memberError) {
      console.error('project_members query failed:', memberError);
    } else {
      console.log('project_members query success:', memberProjects);
    }

    const memberProjectIds = memberProjects?.map(mp => mp.project_id) || [];
    let query = supabase
      .from('projects')
      .select(`
        *,
        owner:owner_id(id, first_name, last_name, email),
        members:project_members(id, user_id, role, user:user_id(id, first_name, last_name, email))
      `);

    if (memberProjectIds.length > 0) {
      query = query.or(`owner_id.eq.${userId},id.in.(${memberProjectIds.join(',')})`);
    } else {
      query = query.eq('owner_id', userId);
    }

    const { data: projects, error: projectsError } = await query.order('created_at', { ascending: false });
    
    if (projectsError) {
      console.error('projects query failed:', projectsError);
    } else {
      console.log('projects query success, count:', projects.length);
      console.log('projects data:', JSON.stringify(projects, null, 2));
    }

    // 4. Test notifications query
    console.log('Testing notifications query...');
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    if (notifError) {
      console.error('notifications query failed:', notifError);
    } else {
      console.log('notifications query success, count:', notifications.length);
    }

  } catch (err) {
    console.error('General error:', err);
  }
}

run();
