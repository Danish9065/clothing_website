'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    FolderOpen,
    ShoppingCart,
    Settings,
    LogOut,
    Sparkles,
    X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AdminSidebarProps {
    adminName: string
    adminEmail: string
    isOpen: boolean
    onClose: () => void
}

const navItems = [
    {
        label: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        label: 'Products',
        href: '/admin/products',
        icon: Package,
    },
    {
        label: 'Categories',
        href: '/admin/categories',
        icon: FolderOpen,
    },
    {
        label: 'Orders',
        href: '/admin/orders',
        icon: ShoppingCart,
    },
    {
        label: 'Settings',
        href: '/admin/settings',
        icon: Settings,
    },
]

export default function AdminSidebar({
    adminName,
    adminEmail,
    isOpen,
    onClose,
}: AdminSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()

    async function handleSignOut() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <aside
            data-open={isOpen}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out -translate-x-full data-[open=true]:translate-x-0 lg:static lg:translate-x-0 lg:z-auto"
        >
            {/* Logo + Close button row */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-brand-500 p-2 rounded-xl text-white">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-sm">
                            Little Mumbai
                        </p>
                        <p className="text-xs text-slate-400">
                            Admin Panel
                        </p>
                    </div>
                </div>

                {/* X close button — only visible on mobile */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    aria-label="Close sidebar"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 
                rounded-xl text-sm font-medium 
                transition-all
                ${isActive
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Quick Links */}
            <div className="p-4 border-t border-slate-100">
                <Link
                    href="/"
                    target="_blank"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-2 
                     text-xs text-slate-400 
                     hover:text-brand-500 transition-colors"
                >
                    ↗ View Live Site
                </Link>
            </div>

            {/* Admin Info + Signout */}
            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-brand-100 rounded-full 
                          flex items-center justify-center">
                        <span className="text-brand-600 text-sm 
                             font-bold">
                            {adminName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold 
                          text-slate-900 truncate">
                            {adminName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                            {adminEmail}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-3 
                     py-2 text-sm text-slate-500 
                     hover:text-red-500 hover:bg-red-50 
                     rounded-lg transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
