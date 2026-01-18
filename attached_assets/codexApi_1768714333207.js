import { supabase } from '@/lib/customSupabaseClient';

export const CATEGORIES = ['Sessions', 'Quests', 'Discoveries', 'Encounters', 'Notes'];

export const createCodexRecord = async (characterId, userId, title, content, category) => {
  const { data, error } = await supabase
    .from('codex_records')
    .insert([{
      character_id: characterId,
      user_id: userId,
      title,
      content,
      category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getCodexRecords = async (characterId, category = null) => {
  let query = supabase
    .from('codex_records')
    .select('*')
    .eq('character_id', characterId)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getAllCodexRecords = async (characterId) => {
  return getCodexRecords(characterId);
};

export const updateCodexRecord = async (recordId, title, content, category) => {
  const { data, error } = await supabase
    .from('codex_records')
    .update({
      title,
      content,
      category,
      updated_at: new Date().toISOString()
    })
    .eq('id', recordId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCodexRecord = async (recordId) => {
  const { error } = await supabase
    .from('codex_records')
    .delete()
    .eq('id', recordId);

  if (error) throw error;
  return true;
};