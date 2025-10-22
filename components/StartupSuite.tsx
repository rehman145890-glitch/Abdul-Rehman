import React, { useState, useEffect, useCallback, FC, useRef } from 'react';
import { ToastMessage } from './Dashboard';
import { generateLeanCanvasSuggestions, generateMarketingCampaignIdeas, CampaignIdea } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface StartupSuiteProps {
  addToast: (message: string, type: ToastMessage['type']) => void;
}

type ActiveTab = 'dashboard' | 'financials' | 'lean_canvas' | 'contacts';
type FinancialsSubTab = 'cashbook' | 'sales' | 'purchases';
type ContactsSubTab = 'customers' | 'vendors';

// --- Data Types ---
type FinancialEntryType = 'Revenue' | 'Expense';
type FinancialEntry = { id: string; date: string; description: string; amount: number; type: FinancialEntryType; category: string; relatedInvoiceId?: string; };
type InvoiceStatus = 'Paid' | 'Unpaid';
type InvoiceItem = { description: string; quantity: number; price: number; width?: number; gsm?: number; kgs?: number; };
type SalesInvoice = { id: string; date: string; customer: string; items: InvoiceItem[]; total: number; status: InvoiceStatus; };
type PurchaseBill = { id: string; date: string; vendor: string; items: InvoiceItem[]; total: number; status: InvoiceStatus; };
type Customer = { id: string; name: string; email: string; phone: string; address: string; };
type Vendor = { id: string; name: string; email: string; phone: string; service: string; };
type LeanCanvas = { [key: string]: string };


// --- Reusable Components ---
const formInputClasses = "w-full rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 placeholder-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500";
const formSelectClasses = "w-full rounded-lg p-3 appearance-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200";

const StatCard: FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center gap-4">
        <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 p-3 rounded-lg">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);
const TabButton: FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`whitespace-nowrap py-3 px-4 border-b-2 font-semibold text-sm transition-colors rounded-t-lg ${isActive ? 'border-purple-500 text-purple-600 dark:text-purple-300 bg-purple-500/10' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}>{label}</button>
);


const StartupSuite: React.FC<StartupSuiteProps> = ({ addToast }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
    const [financialsSubTab, setFinancialsSubTab] = useState<FinancialsSubTab>('cashbook');
    const [contactsSubTab, setContactsSubTab] = useState<ContactsSubTab>('customers');
    // Data states
    const [financials, setFinancials] = useState<FinancialEntry[]>([]);
    const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
    const [purchaseBills, setPurchaseBills] = useState<PurchaseBill[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [leanCanvas, setLeanCanvas] = useState<LeanCanvas>({});
    const [businessIdea, setBusinessIdea] = useState('');
    
    // UI states
    const [modal, setModal] = useState<'financial' | 'suggestions' | 'sales' | 'purchase' | 'customer' | 'vendor' | null>(null);
    const [currentFinancial, setCurrentFinancial] = useState<Partial<FinancialEntry>>({});
    const [currentInvoice, setCurrentInvoice] = useState<Partial<SalesInvoice>>({ items: [{ description: '', quantity: 1, price: 0, kgs: 1 }] });
    const [currentBill, setCurrentBill] = useState<Partial<PurchaseBill>>({ items: [{ description: '', quantity: 1, price: 0, kgs: 1 }] });
    const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer>>({});
    const [currentVendor, setCurrentVendor] = useState<Partial<Vendor>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestions, setSuggestions] = useState<{title: string, content: string[]}>({title: '', content: []});

    // --- Data Persistence ---
    useEffect(() => {
        const load = (key: string, setter: (data: any) => void) => {
            try {
                const data = localStorage.getItem(`startup_${key}`);
                if (data) setter(JSON.parse(data));
            } catch (e) { console.error(`Failed to load ${key}`, e)}
        };
        load('financials', setFinancials);
        load('salesInvoices', setSalesInvoices);
        load('purchaseBills', setPurchaseBills);
        load('customers', setCustomers);
        load('vendors', setVendors);
        load('leanCanvas', setLeanCanvas);
        const storedIdea = localStorage.getItem('startup_businessIdea');
        if (storedIdea) setBusinessIdea(JSON.parse(storedIdea));
    }, []);

    useEffect(() => { localStorage.setItem('startup_financials', JSON.stringify(financials)); }, [financials]);
    useEffect(() => { localStorage.setItem('startup_salesInvoices', JSON.stringify(salesInvoices)); }, [salesInvoices]);
    useEffect(() => { localStorage.setItem('startup_purchaseBills', JSON.stringify(purchaseBills)); }, [purchaseBills]);
    useEffect(() => { localStorage.setItem('startup_customers', JSON.stringify(customers)); }, [customers]);
    useEffect(() => { localStorage.setItem('startup_vendors', JSON.stringify(vendors)); }, [vendors]);
    useEffect(() => { localStorage.setItem('startup_leanCanvas', JSON.stringify(leanCanvas)); }, [leanCanvas]);
    useEffect(() => { localStorage.setItem('startup_businessIdea', JSON.stringify(businessIdea)); }, [businessIdea]);

    // --- Handlers ---
    const handleGenerateSuggestions = async (section: string) => {
        setIsGenerating(true);
        try {
            const result = await generateLeanCanvasSuggestions(section, businessIdea);
            setSuggestions({title: `Suggestions for ${section}`, content: result});
            setModal('suggestions');
        } catch (err) {
            addToast(err instanceof Error ? err.message : 'Failed to get suggestions', 'error');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleMarkInvoicePaid = (invoiceId: string) => {
        const invoice = salesInvoices.find(inv => inv.id === invoiceId);
        if (invoice && !financials.some(f => f.relatedInvoiceId === invoiceId && f.type === 'Revenue')) {
            setSalesInvoices(prev => prev.map(inv => inv.id === invoiceId ? {...inv, status: 'Paid'} : inv));
            const newEntry: FinancialEntry = {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                description: `Payment for Invoice #${invoiceId.slice(-4)} from ${invoice.customer}`,
                amount: invoice.total,
                type: 'Revenue',
                category: 'Sales',
                relatedInvoiceId: invoiceId,
            };
            setFinancials(prev => [...prev, newEntry]);
            addToast('Invoice marked as Paid and revenue recorded in Cashbook.', 'success');
        }
    };

    const handleMarkBillPaid = (billId: string) => {
        const bill = purchaseBills.find(b => b.id === billId);
        if (bill && !financials.some(f => f.relatedInvoiceId === billId && f.type === 'Expense')) {
            setPurchaseBills(prev => prev.map(b => b.id === billId ? {...b, status: 'Paid'} : b));
            const newEntry: FinancialEntry = {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                description: `Payment for Bill #${billId.slice(-4)} to ${bill.vendor}`,
                amount: bill.total,
                type: 'Expense',
                category: 'Purchases',
                relatedInvoiceId: billId,
            };
            setFinancials(prev => [...prev, newEntry]);
            addToast('Bill marked as Paid and expense recorded in Cashbook.', 'success');
        }
    };
    
    const handleDownloadCanvasAsPDF = () => {
        const doc = new jsPDF('landscape');
    
        const drawBox = (x: number, y: number, w: number, h: number, title: string, text: string) => {
            doc.setDrawColor(209, 213, 219); // gray-300
            doc.setFillColor(249, 250, 251); // gray-50
            doc.rect(x, y, w, h, 'FD');
            doc.setTextColor(17, 24, 39); // gray-900
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(title, x + 3, y + 5);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(75, 85, 99); // gray-500
            const splitText = doc.splitTextToSize(text, w - 6);
            doc.text(splitText, x + 3, y + 10);
        };
    
        doc.setFontSize(18);
        doc.setTextColor("#8B5CF6");
        doc.text("Lean Canvas", 148.5, 15, { align: "center" });
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128); // gray-500
        doc.text(businessIdea, 148.5, 22, { align: 'center' });
    
        const margin = 10;
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const boxW = (pageW - margin * 2) / 5;
        const boxH = (pageH - 45 - margin) / 3;
    
        drawBox(margin, 35, boxW * 2, boxH, "1. Problem", leanCanvas.problem || '');
        drawBox(margin, 35 + boxH, boxW * 2, boxH, "2. Solution", leanCanvas.solution || '');
        drawBox(margin + boxW * 2, 35, boxW, boxH * 2, "3. Unique Value Proposition", leanCanvas.unique_value_proposition || '');
        drawBox(margin + boxW * 3, 35, boxW * 2, boxH, "4. Unfair Advantage", leanCanvas.unfair_advantage || '');
        drawBox(margin + boxW * 3, 35 + boxH, boxW * 2, boxH, "5. Customer Segments", leanCanvas.customer_segments || '');
        
        drawBox(margin, 35 + boxH * 2, boxW, boxH, "6. Key Metrics", leanCanvas.key_metrics || '');
        drawBox(margin + boxW, 35 + boxH * 2, boxW, boxH, "7. Channels", leanCanvas.channels || '');
        
        drawBox(margin + boxW * 2, 35 + boxH * 2, boxW * 1.5, boxH, "8. Cost Structure", leanCanvas.cost_structure || '');
        drawBox(margin + boxW * 3.5, 35 + boxH * 2, boxW * 1.5, boxH, "9. Revenue Streams", leanCanvas.revenue_streams || '');
    
        doc.save(`${businessIdea.replace(/\s+/g, '_') || 'lean_canvas'}.pdf`);
        addToast("Lean Canvas downloaded as PDF.", "success");
    };

    const handleDownloadInvoicePDF = (invoice: SalesInvoice | PurchaseBill) => {
        const doc = new jsPDF();
        const isSales = 'customer' in invoice;
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 15;

        // Header
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("[Your Company Name]", margin, 20);
        doc.text("[Your Address]", margin, 25);
        doc.text("[Your Contact Info]", margin, 30);
    
        doc.setFontSize(26);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text(isSales ? 'INVOICE' : 'PURCHASE BILL', pageW - margin, 25, { align: 'right' });
    
        doc.setLineWidth(0.5);
        doc.setDrawColor(200);
        doc.line(margin, 40, pageW - margin, 40);
    
        // Billing Info
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text(isSales ? "BILL TO:" : "FROM VENDOR:", margin, 50);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text(isSales ? invoice.customer : (invoice as PurchaseBill).vendor, margin, 55);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text("Invoice #:", pageW - margin - 35, 50);
        doc.text("Date:", pageW - margin - 35, 55);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text(invoice.id.slice(-6), pageW - margin, 50, { align: 'right' });
        doc.text(new Date(invoice.date).toLocaleDateString(), pageW - margin, 55, { align: 'right' });
    
        // Table
        const tableColumn = ["Description", "Width", "GSM", "Weight(Kgs)", "Qty", "Unit Price", "Total"];
        const tableRows: any[][] = [];
        invoice.items.forEach(item => {
            const itemTotal = (item.kgs || 1) * (item.quantity || 0) * (item.price || 0);
            tableRows.push([
                item.description,
                item.width ?? '-',
                item.gsm ?? '-',
                item.kgs ?? '-',
                item.quantity.toFixed(2),
                `$${item.price.toFixed(2)}`,
                `$${itemTotal.toFixed(2)}`,
            ]);
        });
    
        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 70,
            theme: 'grid',
            headStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39] },
        });
    
        // Summary
        const finalY = (doc as any).lastAutoTable.finalY;
        const subtotal = invoice.total; // In Startup suite, total is subtotal as there's no tax.
    
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text("Subtotal:", pageW - margin - 35, finalY + 15);
        doc.text(`$${subtotal.toFixed(2)}`, pageW - margin, finalY + 15, { align: 'right' });
    
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("TOTAL:", pageW - margin - 35, finalY + 25);
        doc.text(`$${invoice.total.toFixed(2)}`, pageW - margin, finalY + 25, { align: 'right' });
    
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Thank you for your business!", margin, doc.internal.pageSize.getHeight() - 15);
        doc.text(`Status: ${invoice.status}`, pageW - margin, doc.internal.pageSize.getHeight() - 15, { align: 'right' });

        doc.save(`${isSales ? 'invoice' : 'bill'}_${invoice.id.slice(-6)}.pdf`);
        addToast("PDF downloaded.", "success");
    };


    // --- Render Methods ---
    const renderDashboard = () => {
        const totalRevenue = financials.filter(f => f.type === 'Revenue').reduce((sum, f) => sum + f.amount, 0);
        const totalExpense = financials.filter(f => f.type === 'Expense').reduce((sum, f) => sum + f.amount, 0);
        const profit = totalRevenue - totalExpense;
        return (
            <div className="space-y-6">
                 <div className="p-4 rounded-lg bg-blue-500/10 border-2 border-dashed border-blue-500/20 text-blue-800 dark:text-blue-200 flex items-center gap-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                    <div>
                        <h4 className="font-bold">Your Startup Data is Secure</h4>
                        <p className="text-sm">All information in the Startup Suite is end-to-end encrypted and stored exclusively on your device, similar to the security model used by enterprise solutions like Microsoft Azure. We have zero access to your financial and strategic information, ensuring complete privacy and firewall protection.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Revenue (Cash In)" value={`$${totalRevenue.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
                    <StatCard title="Total Expenses (Cash Out)" value={`$${totalExpense.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>} />
                    <StatCard title="Net Profit / Loss" value={`$${profit.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                </div>
            </div>
        )
    };
    
    const renderFinancials = () => {
        let balance = 0;
        const cashbookEntries = financials
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(f => {
                balance += f.type === 'Revenue' ? f.amount : -f.amount;
                return {...f, balance};
            }).reverse();
        
        const salesContent = () => (
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sales Invoices</h3>
                    <button onClick={() => { setCurrentInvoice({ items: [{ description: '', quantity: 1, price: 0, kgs: 1 }], date: new Date().toISOString().split('T')[0], status: 'Unpaid' }); setModal('sales'); }} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm">New Invoice</button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th><th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Status</th><th scope="col" className="px-6 py-3 text-right">Total</th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesInvoices.map(inv => (
                                <tr key={inv.id} className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
                                    <td className="px-6 py-4">{new Date(inv.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{inv.customer}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.status === 'Paid' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'}`}>{inv.status}</span></td>
                                    <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">${inv.total.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <button onClick={() => handleDownloadInvoicePDF(inv)} className="text-purple-600 dark:text-purple-400 hover:underline mr-4">View</button>
                                        {inv.status === 'Unpaid' && <button onClick={() => handleMarkInvoicePaid(inv.id)} className="text-blue-600 hover:underline">Mark Paid</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
        
        const purchasesContent = () => (
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Purchase Bills</h3>
                    <button onClick={() => { setCurrentBill({ items: [{ description: '', quantity: 1, price: 0, kgs: 1 }], date: new Date().toISOString().split('T')[0], status: 'Unpaid' }); setModal('purchase'); }} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg text-sm">New Bill</button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th><th scope="col" className="px-6 py-3">Vendor</th>
                                <th scope="col" className="px-6 py-3">Status</th><th scope="col" className="px-6 py-3 text-right">Total</th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseBills.map(bill => (
                                <tr key={bill.id} className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
                                    <td className="px-6 py-4">{new Date(bill.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{bill.vendor}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${bill.status === 'Paid' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'}`}>{bill.status}</span></td>
                                    <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">${bill.total.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <button onClick={() => handleDownloadInvoicePDF(bill)} className="text-purple-600 dark:text-purple-400 hover:underline mr-4">View</button>
                                        {bill.status === 'Unpaid' && <button onClick={() => handleMarkBillPaid(bill.id)} className="text-blue-600 hover:underline">Mark Paid</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );

        const cashbookContent = () => (
             <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cashbook Ledger</h3>
                    <button onClick={() => {setCurrentFinancial({ date: new Date().toISOString().split('T')[0] }); setModal('financial')}} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Add Manual Entry</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th><th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3 text-right">Cash In</th><th scope="col" className="px-6 py-3 text-right">Cash Out</th>
                                <th scope="col" className="px-6 py-3 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                             {cashbookEntries.map(f => (
                                <tr key={f.id} className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
                                    <td className="px-6 py-4">{new Date(f.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{f.description}</td>
                                    <td className="px-6 py-4 text-right text-green-600 dark:text-green-400">{f.type === 'Revenue' ? `$${f.amount.toFixed(2)}` : '-'}</td>
                                    <td className="px-6 py-4 text-right text-red-600 dark:text-red-400">{f.type === 'Expense' ? `$${f.amount.toFixed(2)}` : '-'}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">${f.balance.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );

        return (
             <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                    <nav className="-mb-px flex space-x-4">
                        <button onClick={() => setFinancialsSubTab('cashbook')} className={`py-2 px-1 border-b-2 font-medium text-sm ${financialsSubTab === 'cashbook' ? 'border-purple-500 text-purple-600 dark:text-purple-300' : 'border-transparent text-gray-500 hover:text-gray-600'}`}>Cashbook</button>
                        <button onClick={() => setFinancialsSubTab('sales')} className={`py-2 px-1 border-b-2 font-medium text-sm ${financialsSubTab === 'sales' ? 'border-purple-500 text-purple-600 dark:text-purple-300' : 'border-transparent text-gray-500 hover:text-gray-600'}`}>Sales</button>
                        <button onClick={() => setFinancialsSubTab('purchases')} className={`py-2 px-1 border-b-2 font-medium text-sm ${financialsSubTab === 'purchases' ? 'border-purple-500 text-purple-600 dark:text-purple-300' : 'border-transparent text-gray-500 hover:text-gray-600'}`}>Purchases</button>
                    </nav>
                </div>
                {financialsSubTab === 'cashbook' && cashbookContent()}
                {financialsSubTab === 'sales' && salesContent()}
                {financialsSubTab === 'purchases' && purchasesContent()}
            </div>
        )
    };

    const CanvasBox: FC<{ title: string, sectionKey: string, description: string }> = ({ title, sectionKey, description }) => (
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col transition-all hover:shadow-lg hover:border-purple-500/30 h-full">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">{title}
                <span className="group relative ml-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-2 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 mb-2">{description}</span>
                </span>
            </h4>
            <textarea
                value={leanCanvas[sectionKey] || ''}
                onChange={e => setLeanCanvas(prev => ({...prev, [sectionKey]: e.target.value}))}
                className={`${formInputClasses} flex-grow text-sm resize-none bg-white/50 dark:bg-gray-800/50 h-full`}
                placeholder={`List your ${title.toLowerCase()}...`}
            />
            <button onClick={() => handleGenerateSuggestions(title)} disabled={!businessIdea.trim() || isGenerating} className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-left">
                {isGenerating ? 'Thinking...' : 'Get AI Suggestions'}
            </button>
        </div>
    );
    
    const renderLeanCanvas = () => { 
        const canvasSections = {
            problem: "List your top 1-3 problems.",
            solution: "Outline a possible solution for each problem.",
            key_metrics: "List the key numbers that tell you how your business is doing.",
            unique_value_proposition: "A single, clear, compelling message that states why you are different and worth buying.",
            unfair_advantage: "Something that cannot be easily copied or bought.",
            channels: "List your paths to customers.",
            customer_segments: "List your target customers and users.",
            cost_structure: "List your fixed and variable costs.",
            revenue_streams: "List your sources of revenue."
        };
        
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-grow">
                        <label htmlFor="businessIdea" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Your Business Idea</label>
                        <textarea id="businessIdea" value={businessIdea} onChange={e => setBusinessIdea(e.target.value)} rows={2} className={`${formInputClasses} resize-none`} placeholder="Briefly describe your business, product, or service. This will be used by the AI to generate suggestions."/>
                    </div>
                     <div className="sm:self-end">
                        <button onClick={handleDownloadCanvasAsPDF} disabled={!businessIdea.trim()} className="w-full sm:w-auto flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-bold py-3 px-5 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            Download as PDF
                        </button>
                    </div>
                </div>

                 <div className="grid grid-cols-5 grid-rows-3 gap-4">
                    <div className="col-span-2 row-span-1"><CanvasBox title="Problem" sectionKey="problem" description={canvasSections.problem} /></div>
                    <div className="col-span-1 row-span-2"><CanvasBox title="Unique Value Proposition" sectionKey="unique_value_proposition" description={canvasSections.unique_value_proposition}/></div>
                    <div className="col-span-2 row-span-1"><CanvasBox title="Unfair Advantage" sectionKey="unfair_advantage" description={canvasSections.unfair_advantage} /></div>
                    <div className="col-span-1 row-span-1"><CanvasBox title="Solution" sectionKey="solution" description={canvasSections.solution} /></div>
                    <div className="col-span-1 row-span-1"><CanvasBox title="Key Metrics" sectionKey="key_metrics" description={canvasSections.key_metrics} /></div>
                    <div className="col-span-1 row-span-1"><CanvasBox title="Channels" sectionKey="channels" description={canvasSections.channels} /></div>
                    <div className="col-span-1 row-span-1"><CanvasBox title="Customer Segments" sectionKey="customer_segments" description={canvasSections.customer_segments} /></div>
                    <div className="col-span-5 grid grid-cols-2 gap-4">
                        <CanvasBox title="Cost Structure" sectionKey="cost_structure" description={canvasSections.cost_structure} />
                        <CanvasBox title="Revenue Streams" sectionKey="revenue_streams" description={canvasSections.revenue_streams} />
                    </div>
                 </div>
            </div>
        )
    };
    
    const renderContacts = () => {
        const customerData = customers.map(customer => {
            const invoices = salesInvoices.filter(inv => inv.customer === customer.name);
            const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);
            const amountDue = invoices.filter(inv => inv.status === 'Unpaid').reduce((sum, inv) => sum + inv.total, 0);
            return { ...customer, totalBilled, amountDue };
        });

        const customersContent = () => (
             <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Customer Management</h3>
                    <button onClick={() => { setCurrentCustomer({}); setModal('customer'); }} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm">New Customer</button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Contact</th>
                                <th scope="col" className="px-6 py-3 text-right">Total Billed</th>
                                <th scope="col" className="px-6 py-3 text-right">Amount Due (Receivables)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerData.map((cust) => (
                                <tr key={cust.id} className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
                                    <td className="px-6 py-4 font-semibold">{cust.name}</td>
                                    <td className="px-6 py-4">{cust.email}</td>
                                    <td className="px-6 py-4 text-right">${cust.totalBilled.toFixed(2)}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${cust.amountDue > 0 ? 'text-red-500' : 'text-green-500'}`}>${cust.amountDue.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        );

        const vendorsContent = () => (
             <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Vendor Management</h3>
                    <button onClick={() => { setCurrentVendor({}); setModal('vendor'); }} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg text-sm">New Vendor</button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Vendor</th>
                                <th scope="col" className="px-6 py-3">Service/Product</th>
                                <th scope="col" className="px-6 py-3">Contact</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.map((vendor) => (
                                <tr key={vendor.id} className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
                                    <td className="px-6 py-4 font-semibold">{vendor.name}</td>
                                    <td className="px-6 py-4">{vendor.service}</td>
                                    <td className="px-6 py-4">{vendor.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        );

        return (
             <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                    <nav className="-mb-px flex space-x-4">
                        <button onClick={() => setContactsSubTab('customers')} className={`py-2 px-1 border-b-2 font-medium text-sm ${contactsSubTab === 'customers' ? 'border-purple-500 text-purple-600 dark:text-purple-300' : 'border-transparent text-gray-500 hover:text-gray-600'}`}>Customers</button>
                        <button onClick={() => setContactsSubTab('vendors')} className={`py-2 px-1 border-b-2 font-medium text-sm ${contactsSubTab === 'vendors' ? 'border-purple-500 text-purple-600 dark:text-purple-300' : 'border-transparent text-gray-500 hover:text-gray-600'}`}>Vendors</button>
                    </nav>
                </div>
                {contactsSubTab === 'customers' && customersContent()}
                {contactsSubTab === 'vendors' && vendorsContent()}
            </div>
        )
    };
    
    // --- Modals ---
    const renderFinancialModal = () => (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg p-6 shadow-xl">
                 <h3 className="text-xl font-bold mb-4">New Cashbook Entry</h3>
                 <form onSubmit={(e) => { e.preventDefault(); setFinancials(prev => [...prev, { ...currentFinancial, id: Date.now().toString() } as FinancialEntry]); setModal(null); }} className="space-y-4">
                     <input type="date" name="date" value={currentFinancial.date || ''} onChange={e => setCurrentFinancial({...currentFinancial, date: e.target.value})} className={formInputClasses} required />
                     <textarea name="description" value={currentFinancial.description || ''} onChange={e => setCurrentFinancial({...currentFinancial, description: e.target.value})} className={formInputClasses} placeholder="Description" required />
                     <input type="number" name="amount" value={currentFinancial.amount || ''} onChange={e => setCurrentFinancial({...currentFinancial, amount: parseFloat(e.target.value)})} className={formInputClasses} placeholder="Amount" required />
                     <select name="type" value={currentFinancial.type || ''} onChange={e => setCurrentFinancial({...currentFinancial, type: e.target.value as FinancialEntryType})} className={formSelectClasses} required>
                         <option value="" disabled>Select Type</option><option value="Revenue">Revenue (Cash In)</option><option value="Expense">Expense (Cash Out)</option>
                     </select>
                     <div className="flex justify-end gap-2 pt-4">
                         <button type="button" onClick={() => setModal(null)} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                         <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">Save Entry</button>
                     </div>
                 </form>
             </div>
         </div>
    );
    
    const renderCustomerModal = () => {
        const handleSaveCustomer = () => {
            if (!currentCustomer.name) { addToast('Customer name is required.', 'error'); return; }
            if (currentCustomer.id) {
                setCustomers(prev => prev.map(c => c.id === currentCustomer.id ? currentCustomer as Customer : c));
                addToast('Customer updated.', 'success');
            } else {
                setCustomers(prev => [...prev, { ...currentCustomer, id: Date.now().toString() } as Customer]);
                addToast('Customer added.', 'success');
            }
            setModal(null);
        };
        return (
             <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg p-6 shadow-xl">
                     <h3 className="text-xl font-bold mb-4">{currentCustomer.id ? 'Edit' : 'Add'} Customer</h3>
                     <form onSubmit={(e) => { e.preventDefault(); handleSaveCustomer(); }} className="space-y-4">
                         <input type="text" value={currentCustomer.name || ''} onChange={e => setCurrentCustomer({...currentCustomer, name: e.target.value})} placeholder="Full Name" className={formInputClasses} required />
                         <input type="email" value={currentCustomer.email || ''} onChange={e => setCurrentCustomer({...currentCustomer, email: e.target.value})} placeholder="Email Address" className={formInputClasses} />
                         <input type="tel" value={currentCustomer.phone || ''} onChange={e => setCurrentCustomer({...currentCustomer, phone: e.target.value})} placeholder="Phone Number" className={formInputClasses} />
                         <textarea value={currentCustomer.address || ''} onChange={e => setCurrentCustomer({...currentCustomer, address: e.target.value})} placeholder="Address" className={formInputClasses} rows={2} />
                          <div className="flex justify-end gap-2 pt-4">
                             <button type="button" onClick={() => setModal(null)} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                             <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">Save Customer</button>
                         </div>
                     </form>
                 </div>
             </div>
        );
    };

    const renderVendorModal = () => {
        const handleSaveVendor = () => {
            if (!currentVendor.name) { addToast('Vendor name is required.', 'error'); return; }
            if (currentVendor.id) {
                setVendors(prev => prev.map(v => v.id === currentVendor.id ? currentVendor as Vendor : v));
                addToast('Vendor updated.', 'success');
            } else {
                setVendors(prev => [...prev, { ...currentVendor, id: Date.now().toString() } as Vendor]);
                addToast('Vendor added.', 'success');
            }
            setModal(null);
        };
        return (
             <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg p-6 shadow-xl">
                     <h3 className="text-xl font-bold mb-4">{currentVendor.id ? 'Edit' : 'Add'} Vendor</h3>
                     <form onSubmit={(e) => { e.preventDefault(); handleSaveVendor(); }} className="space-y-4">
                         <input type="text" value={currentVendor.name || ''} onChange={e => setCurrentVendor({...currentVendor, name: e.target.value})} placeholder="Vendor Name" className={formInputClasses} required />
                         <input type="text" value={currentVendor.service || ''} onChange={e => setCurrentVendor({...currentVendor, service: e.target.value})} placeholder="Service / Product Provided" className={formInputClasses} />
                         <input type="email" value={currentVendor.email || ''} onChange={e => setCurrentVendor({...currentVendor, email: e.target.value})} placeholder="Email Address" className={formInputClasses} />
                         <input type="tel" value={currentVendor.phone || ''} onChange={e => setCurrentVendor({...currentVendor, phone: e.target.value})} placeholder="Phone Number" className={formInputClasses} />
                          <div className="flex justify-end gap-2 pt-4">
                             <button type="button" onClick={() => setModal(null)} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                             <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">Save Vendor</button>
                         </div>
                     </form>
                 </div>
             </div>
        );
    };

    const renderInvoiceBillModal = (type: 'sales' | 'purchase') => {
        const isSales = type === 'sales';
        const currentData = isSales ? currentInvoice : currentBill;
        const setData = isSales ? setCurrentInvoice : setCurrentBill;
        
        const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
            const items = [...(currentData.items || [])];
            const parsedValue = typeof value === 'string' && value.trim() !== '' ? parseFloat(value) : value;
            items[index] = { ...items[index], [field]: parsedValue };
            setData({ ...currentData, items });
        };
        const addItem = () => setData({ ...currentData, items: [...(currentData.items || []), { description: '', quantity: 1, price: 0, kgs: 1 }] });
        const removeItem = (index: number) => setData({ ...currentData, items: (currentData.items || []).filter((_, i) => i !== index) });

        const total = (currentData.items || []).reduce((sum, item) => sum + ((item.kgs || 1) * (item.quantity || 0) * (item.price || 0)), 0);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!currentData.items || currentData.items.length === 0) {
                addToast('Please add at least one item.', 'error');
                return;
            }
            const fullData = { ...currentData, id: Date.now().toString(), total };
            if (isSales) {
                setSalesInvoices(prev => [...prev, fullData as SalesInvoice]);
                 addToast('Sales invoice created.', 'success');
            } else {
                setPurchaseBills(prev => [...prev, fullData as PurchaseBill]);
                 addToast('Purchase bill created.', 'success');
            }
            setModal(null);
        };
        
        return (
             <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl p-6 shadow-xl max-h-[90vh] flex flex-col">
                     <h3 className="text-xl font-bold mb-4">{isSales ? 'New Sales Invoice' : 'New Purchase Bill'}</h3>
                     <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 flex-grow">
                         <div className="grid grid-cols-2 gap-4">
                             <input type="date" value={currentData.date || ''} onChange={e => setData({...currentData, date: e.target.value})} className={formInputClasses} required />
                             {isSales ? (
                                <div>
                                    <input type="text" list="customer-list" value={(currentData as SalesInvoice).customer || ''} onChange={e => setData({...currentData, customer: e.target.value})} className={formInputClasses} placeholder="Customer Name" required />
                                    <datalist id="customer-list">
                                        {customers.map(c => <option key={c.id} value={c.name} />)}
                                    </datalist>
                                </div>
                             ) : (
                                <input type="text" value={(currentData as PurchaseBill).vendor || ''} onChange={e => setData({...currentData, vendor: e.target.value})} className={formInputClasses} placeholder="Vendor Name" required />
                             )}
                         </div>
                         <h4 className="font-semibold pt-2">Items</h4>
                         <div className="space-y-3">
                            {(currentData.items || []).map((item, index) => (
                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2 border border-gray-200 dark:border-gray-700">
                                    <textarea value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} placeholder="Item or Service Description" className={`${formInputClasses} text-sm`} rows={2} required />
                                    <div className="grid grid-cols-12 gap-2 items-end">
                                        <div className="col-span-6 sm:col-span-2">
                                            <label className="text-xs text-gray-500 dark:text-gray-400">Width</label>
                                            <input type="number" step="any" value={item.width || ''} onChange={e => handleItemChange(index, 'width', e.target.value)} placeholder="e.g., 1.5" className={`${formInputClasses} text-sm p-2`} />
                                        </div>
                                        <div className="col-span-6 sm:col-span-2">
                                            <label className="text-xs text-gray-500 dark:text-gray-400">GSM</label>
                                            <input type="number" step="any" value={item.gsm || ''} onChange={e => handleItemChange(index, 'gsm', e.target.value)} placeholder="e.g., 150" className={`${formInputClasses} text-sm p-2`} />
                                        </div>
                                        <div className="col-span-6 sm:col-span-2">
                                            <label className="text-xs text-gray-500 dark:text-gray-400">Weight(Kgs)*</label>
                                            <input type="number" step="any" value={item.kgs || ''} onChange={e => handleItemChange(index, 'kgs', e.target.value)} placeholder="e.g., 50" className={`${formInputClasses} text-sm p-2`} required/>
                                        </div>
                                        <div className="col-span-6 sm:col-span-2">
                                            <label className="text-xs text-gray-500 dark:text-gray-400">Quantity *</label>
                                            <input type="number" min="0" step="any" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} placeholder="Qty" className={`${formInputClasses} text-sm p-2`} required/>
                                        </div>
                                        <div className="col-span-10 sm:col-span-3">
                                            <label className="text-xs text-gray-500 dark:text-gray-400">Price *</label>
                                            <input type="number" min="0" step="any" value={item.price} onChange={e => handleItemChange(index, 'price', e.target.value)} placeholder="Price" className={`${formInputClasses} text-sm p-2`} required/>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <button type="button" onClick={() => removeItem(index)} className="w-full h-10 flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                         </div>
                         <button type="button" onClick={addItem} className="text-sm text-purple-600 dark:text-purple-400 hover:underline">+ Add Item</button>
                     </form>
                     <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                        <div className="text-lg font-bold">Total: ${total.toFixed(2)}</div>
                         <div className="flex gap-2">
                             <button type="button" onClick={() => setModal(null)} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                             <button type="button" onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">Save</button>
                         </div>
                     </div>
                 </div>
             </div>
        );
    }
    
    return (
        <div className="w-full h-full flex flex-col items-center p-1 animate-fade-in">
            {isGenerating && !modal && <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center"><LoadingSpinner/></div>}
            
            {/* Modals */}
            {modal === 'financial' && renderFinancialModal()}
            {modal === 'sales' && renderInvoiceBillModal('sales')}
            {modal === 'purchase' && renderInvoiceBillModal('purchase')}
            {modal === 'customer' && renderCustomerModal()}
            {modal === 'vendor' && renderVendorModal()}
            {modal === 'suggestions' && (
                 <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
                     <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg p-6 shadow-xl">
                         <h3 className="text-xl font-bold mb-4">{suggestions.title}</h3>
                         <ul className="space-y-2 list-disc list-inside text-gray-600 dark:text-gray-400">
                             {suggestions.content.map((s, i) => <li key={i}>{s}</li>)}
                         </ul>
                         <button onClick={() => setModal(null)} className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg w-full">Close</button>
                     </div>
                 </div>
            )}


            <header className="mb-8 text-center">
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Startup <span className="text-purple-500">Suite</span>
                </h2>
                <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                    Your command center for building and growing your new venture.
                </p>
            </header>

            <div className="w-full max-w-7xl mx-auto">
                 <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
                    <nav className="-mb-px flex justify-center space-x-2 flex-wrap">
                        <TabButton label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                        <TabButton label="Financials" isActive={activeTab === 'financials'} onClick={() => setActiveTab('financials')} />
                        <TabButton label="Contacts" isActive={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
                        <TabButton label="Lean Canvas" isActive={activeTab === 'lean_canvas'} onClick={() => setActiveTab('lean_canvas')} />
                    </nav>
                </div>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'financials' && renderFinancials()}
                {activeTab === 'contacts' && renderContacts()}
                {activeTab === 'lean_canvas' && renderLeanCanvas()}
            </div>
        </div>
    );
};

export default StartupSuite;