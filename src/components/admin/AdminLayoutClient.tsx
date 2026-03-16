'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import AdminSidebar from './AdminSidebar'

interface AdminLayoutClientProps {
    adminName: string
    adminEmail: string
    children: React.ReactNode
}

export default function AdminLayoutClient({
    adminName,
    adminEmail,
    children,
}: AdminLayoutClientProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    function openSidebar() {
        setIsSidebarOpen(true)
    }

    function closeSidebar() {
        setIsSidebarOpen(false)
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Backdrop overlay — only on mobile when sidebar is open */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <AdminSidebar
                adminName={adminName}
                adminEmail={adminEmail}
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
            />

            {/* Right side: mobile header + main content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Mobile header bar — hidden on desktop */}
                <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-slate-100 shrink-0">
                    <button
                        onClick={openSidebar}
                        className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-slate-900 text-sm">
                        Little Mumbai Admin
                    </span>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
