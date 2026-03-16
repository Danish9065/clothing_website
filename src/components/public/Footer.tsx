import Link from 'next/link';
import { Sparkles, MapPin, Phone, Instagram, Facebook } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 space-y-8 md:space-y-0">

                    {/* Column 1 - Brand Info */}
                    <div className="flex flex-col items-start gap-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-bold text-slate-900 text-lg">
                                Little Mumbai Choice
                            </span>
                        </Link>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Leading manufacturer and wholesaler of premium kids wear, delivering comfort, quality, and style to retailers nationwide.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2 - Shop By */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-6">Shop By</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/catalog?filter=boys" className="text-slate-600 text-sm hover:text-brand-600 transition-colors">Boys Wear</Link>
                            </li>
                            <li>
                                <Link href="/catalog?filter=girls" className="text-slate-600 text-sm hover:text-brand-600 transition-colors">Girls Wear</Link>
                            </li>
                            <li>
                                <Link href="/catalog?filter=child" className="text-slate-600 text-sm hover:text-brand-600 transition-colors">Infant & Toddlers</Link>
                            </li>
                            <li>
                                <Link href="/catalog?filter=new" className="text-slate-600 text-sm hover:text-brand-600 transition-colors">New Arrivals</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3 - Wholesale Info */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-6">Wholesale Info</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/wholesale" className="text-slate-600 text-sm hover:text-brand-600 transition-colors">Bulk Order Process</Link>
                            </li>
                            <li>
                                <Link href="/shipping" className="text-slate-600 text-sm hover:text-brand-600 transition-colors">Shipping Policy</Link>
                            </li>
                            <li>
                                <Link href="/payment" className="text-slate-600 text-sm hover:text-brand-600 transition-colors">Payment Methods</Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-slate-600 text-sm hover:text-brand-600 transition-colors">Terms of Service</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4 - Visit Us */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-6">Visit Us</h3>
                        <ul className="space-y-6">
                            <li className="flex gap-4 items-start">
                                <MapPin className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                                <span className="text-slate-600 text-sm leading-relaxed">
                                    Prem Nagar, Loni, Ghaziabad, UP
                                </span>
                            </li>
                            <li className="flex gap-4 items-start">
                                <Phone className="w-5 h-5 text-brand-500 shrink-0" />
                                <div className="flex flex-col text-slate-600 text-sm">
                                    <span>9310708172</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © 2026 Little Mumbai Choice. All rights reserved.
                    </p>
                    <div className="flex gap-4 grayscale opacity-50">
                        <div className="h-6 w-10 bg-slate-200 rounded flex items-center justify-center text-[8px] font-bold text-slate-600">VISA</div>
                        <div className="h-6 w-10 bg-slate-200 rounded flex items-center justify-center text-[8px] font-bold text-slate-600">MC</div>
                        <div className="h-6 w-10 bg-slate-200 rounded flex items-center justify-center text-[8px] font-bold text-slate-600">UPI</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
