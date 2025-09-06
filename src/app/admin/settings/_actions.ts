
'use server';

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function deleteAllUserData() {
    try {
        // Order is important to respect foreign key constraints if they exist.
        // Start with tables that depend on others.

        // 1. Delete all transaction-related data
        const tablesToDeleteFrom = ['investments', 'withdrawals', 'referrals', 'withdrawal_methods'];
        for (const table of tablesToDeleteFrom) {
            const { error: deleteError } = await supabaseAdmin
                .from(table)
                .delete()
                .neq('id', 0); // Trick to delete all rows

            if (deleteError) {
                console.error(`Error deleting from ${table}:`, deleteError);
                throw new Error(`Failed to clear ${table}.`);
            }
        }
        
        // 2. Fetch all users
        const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
        if (usersError) {
             console.error('Error fetching users for deletion:', usersError);
             throw new Error('Could not fetch users to delete.');
        }

        // 3. Delete all users from auth, which will cascade to profiles
        for (const user of users.users) {
            const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
             if (deleteUserError) {
                console.error(`Failed to delete user ${user.id}:`, deleteUserError);
                // Continue trying to delete others
            }
        }
        
        return { success: true, error: null };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error resetting platform data:", errorMessage);
        return { success: false, error: errorMessage };
    }
}
