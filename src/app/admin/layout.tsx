import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

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
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar
                adminName={profile?.full_name || 'Admin'}
                adminEmail={user.email || ''}
            />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
