'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
    const router = useRouter()

    async function handleSignOut() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm 
                 text-slate-500 hover:text-red-500 
                 transition-colors font-medium"
        >
            <LogOut className="w-4 h-4" />
            Sign Out
        </button>
    )
}
