import { client } from "@/lib/rpc"

export async function exportToCSV() {
    const response = await (client.api.subscriptions as any)["export/csv"].$get();
    
    if (!response.ok) {
        throw new Error("Failed to export CSV");
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

export async function exportToPDF() {
    const response = await (client.api.subscriptions as any)["export/pdf"].$get();
    
    if (!response.ok) {
        throw new Error("Failed to export PDF");
    }
    
    const base64 = await response.text();
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscriptions-report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
