import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayoutClient from '@/components/admin/AdminLayoutClient'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    const jwtRole = user.app_metadata?.role

    if (profile?.role !== 'admin' && jwtRole !== 'admin') {
        redirect('/')
    }

    return (
        <AdminLayoutClient
            adminName={profile?.full_name || 'Admin'}
            adminEmail={user.email || ''}
        >
            {children}
        </AdminLayoutClient>
    )
}
