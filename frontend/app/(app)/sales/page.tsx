"use client";

import { useEffect, useState } from "react";
import { Database, Sparkles, ArrowRight, Loader2, Copy, ExternalLink, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SalesPage() {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<any>(null);
    const [message, setMessage] = useState("");
    const [serviceAccountEmail, setServiceAccountEmail] = useState<string | null>(null);
    const [creatingSheet, setCreatingSheet] = useState(false);
    const [clientName, setClientName] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("antigravity_token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch config and service account email in parallel
        Promise.all([
            fetch("/api/config", { headers }).then(res => {
                if (!res.ok) throw new Error("Failed to load config");
                return res.json();
            }),
            fetch("/api/sheets/service-account", { headers }).then(res => res.json()).catch(() => ({}))
        ]).then(([configData, saData]) => {
            // Ensure google_sheets structure exists
            if (!configData.google_sheets) {
                configData.google_sheets = {
                    spreadsheet_id: "",
                    range_name: "Feuille 1!A2:C",
                    drive_folder_id: ""
                };
            }
            if (!configData.crm) {
                configData.crm = {
                    hubspot: { enabled: false },
                    salesforce: { enabled: false },
                    pipedrive: { enabled: false }
                };
            }

            setConfig(configData);
            setServiceAccountEmail(saData.email || null);
            setLoading(false);
        }).catch(e => {
            console.error("Sales fetch error", e);
            setLoading(false);
        });
    }, []);

    const handleCreateSheet = async () => {
        if (!clientName.trim()) {
            setMessage("Please enter a client/company name");
            setTimeout(() => setMessage(""), 3000);
            return;
        }

        setCreatingSheet(true);
        const token = localStorage.getItem("antigravity_token");

        try {
            const res = await fetch("/api/sheets/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ client_name: clientName }),
            });

            const data = await res.json();

            if (res.ok && data.spreadsheet_id) {
                // Update local config with new spreadsheet ID
                setConfig((prev: any) => ({
                    ...prev,
                    google_sheets: {
                        ...prev.google_sheets,
                        spreadsheet_id: data.spreadsheet_id
                    },
                    sales_source_type: "google_sheets"
                }));
                setMessage(`Sheet created: ${data.title}`);

                // Open the new sheet in a new tab
                window.open(data.spreadsheet_url, "_blank");
            } else {
                setMessage(data.detail || "Failed to create sheet");
            }
        } catch (e) {
            console.error("Error creating sheet", e);
            setMessage("Error creating sheet");
        } finally {
            setCreatingSheet(false);
            setTimeout(() => setMessage(""), 5000);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setMessage("Copied to clipboard!");
        setTimeout(() => setMessage(""), 2000);
    };

    const handleSaveConfig = async (newConfig: any) => {
        setConfig(newConfig);
        const token = localStorage.getItem("antigravity_token");

        try {
            const res = await fetch("/api/config", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newConfig),
            });
            if (res.ok) {
                setMessage("Saved successfully");
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (e) {
            console.error("Error saving sales config", e);
        }
    };

    const toggleCRM = (crmKey: string) => {
        const newConfig = { ...config };
        if (!newConfig.crm) newConfig.crm = {};
        if (!newConfig.crm[crmKey]) newConfig.crm[crmKey] = { enabled: false };

        const isEnabled = !newConfig.crm[crmKey].enabled;
        newConfig.crm[crmKey].enabled = isEnabled;

        if (isEnabled) {
            newConfig.sales_source_type = "crm";
        }

        handleSaveConfig(newConfig);
    };

    const updateGoogleSheets = (field: string, value: string) => {
        const newConfig = { ...config };
        newConfig.google_sheets[field] = value;
        handleSaveConfig(newConfig);
    };

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="animate-pulse text-primary font-medium">Loading sales data settings...</div>
        </div>
    );

    return (
        <div className="p-8 md:p-12 max-w-6xl mx-auto">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Sales Data</h1>
                    <p className="text-lg text-muted-foreground">Connect your Revenue Source to power the AI model.</p>
                </div>
                {message && (
                    <div className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20 animate-fade-in">
                        {message}
                    </div>
                )}
            </div>

            <div className="space-y-8">

                {/* Google Sheets Card - Full Width */}
                <div className="relative group w-full">
                    {/* Glow Effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>

                    <div className="relative bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl p-8 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl bg-white/5 border border-white/10">
                                    <Database size={24} className="text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white tracking-wide">Google Sheets</h3>
                                    <p className="text-sm text-muted-foreground">Legacy connection for raw data.</p>
                                </div>
                            </div>
                            <div className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all duration-300",
                                config.sales_source_type === "google_sheets"
                                    ? "bg-green-400/10 text-green-400 border-green-400/20 shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                                    : "bg-white/5 text-muted-foreground border-white/10"
                            )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full", config.sales_source_type === "google_sheets" ? "bg-green-400 animate-pulse" : "bg-gray-500")} />
                                {config.sales_source_type === "google_sheets" ? "Active Source" : "Inactive"}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">

                            {/* Help / Instructions (NOW STEP 1 & 2) */}
                            <div className="bg-white/5 rounded-xl p-6 border border-white/5 order-2 md:order-1">
                                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">1</span>
                                    Get the Template
                                </h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Start by copying our official tracking sheet.
                                </p>

                                <a
                                    href="https://docs.google.com/spreadsheets/d/1-nQ74vat4JXexflJdjQlMOIgymQHyvTMjLrBkdZXIGo/copy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-bold mb-6"
                                >
                                    <ExternalLink size={16} />
                                    Copy Template to your Drive
                                </a>

                                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">2</span>
                                    Grant Access
                                </h4>
                                {serviceAccountEmail ? (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm text-muted-foreground">
                                            Share your new sheet with this Service Email (as <strong>Editor</strong>) so the bot can read it:
                                        </p>
                                        <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 border border-white/10">
                                            <code className="text-xs text-green-400 flex-1 truncate">{serviceAccountEmail}</code>
                                            <button
                                                onClick={() => copyToClipboard(serviceAccountEmail)}
                                                className="text-muted-foreground hover:text-white transition-colors"
                                                title="Copy email"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <p className="text-xs text-red-400">Service Account not detected. Please check backend config.</p>
                                    </div>
                                )}
                            </div>

                            {/* Configuration Config (NOW STEP 3) */}
                            <div className="space-y-6 order-1 md:order-2">
                                <div>
                                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">3</span>
                                        Connect to Dashboard
                                    </h4>
                                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Spreadsheet ID</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono focus:border-green-500/50 focus:bg-white/5 transition-all outline-none"
                                        defaultValue={config.google_sheets?.spreadsheet_id || ""}
                                        onBlur={(e) => updateGoogleSheets("spreadsheet_id", e.target.value)}
                                        placeholder="1BxiMVs0XRA5nFM..."
                                    />
                                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                        Found in your Sheet URL: <br />
                                        <span className="opacity-50">docs.google.com/spreadsheets/d/</span><strong className="text-white">ID_HERE</strong><span className="opacity-50">/edit</span>
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Data Range</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono focus:border-green-500/50 focus:bg-white/5 transition-all outline-none"
                                        defaultValue={config.google_sheets?.range_name || "Feuille 1!A2:C"}
                                        onBlur={(e) => updateGoogleSheets("range_name", e.target.value)}
                                        placeholder="Feuille 1!A2:C"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Default is <code>Feuille 1!A2:C</code>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-white/5 pt-6">
                            <button
                                onClick={() => {
                                    const newConfig = { ...config, sales_source_type: "google_sheets" };
                                    handleSaveConfig(newConfig);
                                }}
                                className={cn(
                                    "px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 border",
                                    config.sales_source_type === "google_sheets"
                                        ? "bg-green-500/10 text-green-400 border-green-500/20 cursor-default"
                                        : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                )}
                            >
                                {config.sales_source_type === "google_sheets" ? "Connected as Primary Source" : "Set as Primary Source"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4 mt-8">
                    <Sparkles size={18} className="text-primary" />
                    <h3 className="text-xl font-bold text-white">CRM Integrations</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* HubSpot */}
                    <SalesSourceCard
                        name="HubSpot"
                        icon={<span className="text-orange-500 font-bold text-xl">H</span>}
                        description="Sync deals and revenue automatically."
                        isEnabled={config.crm?.hubspot?.enabled}
                        onToggle={() => toggleCRM("hubspot")}
                    />

                    {/* Salesforce */}
                    <SalesSourceCard
                        name="Salesforce"
                        icon={<span className="text-blue-400 font-bold text-xl">S</span>}
                        description="Enterprise grade connection."
                        isEnabled={config.crm?.salesforce?.enabled}
                        onToggle={() => toggleCRM("salesforce")}
                    />

                    {/* Pipedrive */}
                    <SalesSourceCard
                        name="Pipedrive"
                        icon={<span className="text-green-400 font-bold text-xl">P</span>}
                        description="Pipeline management sync."
                        isEnabled={config.crm?.pipedrive?.enabled}
                        onToggle={() => toggleCRM("pipedrive")}
                    />
                </div>

            </div>
        </div>
    );
}

// Reusing the exact visual style from IntegrationCard
function SalesSourceCard({ name, icon, description, isEnabled, onToggle }: { name: string, icon: React.ReactNode, description: string, isEnabled: boolean, onToggle: () => void }) {
    return (
        <div className="relative group h-full">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl opacity-20 group-hover:opacity-50 blur transition duration-500"></div>

            <div className="relative h-full bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex flex-col justify-between transition-all duration-300 group-hover:-translate-y-1">

                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl bg-white/5 border border-white/10">
                        {icon}
                    </div>
                    <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all duration-300",
                        isEnabled
                            ? "bg-green-400/10 text-green-400 border-green-400/20 shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                            : "bg-white/5 text-muted-foreground border-white/10"
                    )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", isEnabled ? "bg-green-400 animate-pulse" : "bg-gray-500")} />
                        {isEnabled ? "Connected" : "Inactive"}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-bold text-lg text-white tracking-wide mb-1">{name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>

                <button
                    onClick={onToggle}
                    className={cn(
                        "w-full py-2.5 rounded-lg text-sm font-bold transition-all duration-300 border",
                        isEnabled
                            ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(248,113,113,0.2)]"
                            : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    )}
                >
                    {isEnabled ? "Disconnect" : "Connect"}
                </button>
            </div>
        </div>
    );
}
