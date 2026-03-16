import { Phone } from "lucide-react";

export function WhatsAppFloat() {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919818190679";

    return (
        <div className="fixed bottom-8 right-8 z-50 group">
            <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-xl hover:bg-green-600 transition-colors"
            >
                <Phone className="w-6 h-6 text-white" />
            </a>
            <div className="absolute right-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-xl whitespace-nowrap pointer-events-none">
                Chat on WhatsApp
            </div>
        </div>
    );
}
