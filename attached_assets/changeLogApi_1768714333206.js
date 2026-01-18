
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Creates a new change log entry in the database.
 * @param {Object} params
 * @param {string} params.characterId - The UUID of the character (scrolls table)
 * @param {string} params.sectionName - The UI section name (e.g., "Identity", "Tactical")
 * @param {string} params.changeSummary - A human readable summary of what changed
 * @param {string} [params.fieldName] - Specific field name if applicable
 * @param {string} [params.oldValue] - Previous value (stringified)
 * @param {string} [params.newValue] - New value (stringified)
 * @param {Object} [params.metadata] - Extra data
 */
export async function createChangeLogEntry({
    characterId,
    sectionName,
    changeSummary,
    fieldName = null,
    oldValue = null,
    newValue = null,
    metadata = {}
}) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase.from('change_logs').insert({
            character_id: characterId,
            user_id: user.id,
            section_name: sectionName,
            field_name: fieldName,
            old_value: oldValue ? String(oldValue) : null,
            new_value: newValue ? String(newValue) : null,
            change_summary: changeSummary,
            metadata
        });

        if (error) throw error;
    } catch (err) {
        console.error("Failed to create change log entry:", err);
        // We don't necessarily want to block the UI if logging fails, but we log to console.
    }
}
