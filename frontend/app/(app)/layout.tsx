import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 bg-background">
                {children}
            </main>
        </div>
    );
}
