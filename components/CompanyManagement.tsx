import React, { useState, useEffect, useCallback, FC, useRef } from 'react';
import { ToastMessage } from './Dashboard';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface CompanyManagementProps {
  addToast: (message: string, type: ToastMessage['type']) => void;
  companyDetails?: {
      businessName?: string;
      logo?: string;
      billingCurrency?: string;
      address?: string;
      city?: string;
      country?: string;
      email?: string;
      phone?: string;
      [key: string]: any;
  } | null;
}

// --- Data Types ---
type View = 'dashboard' | 'sales' | 'purchases' | 'inventory' | 'contacts' | 'hr' | 'reports' | 'taxes' | 'cashbook';
type TransactionStatus = 'Paid' | 'Unpaid';
type InvoiceItem = { description: string; quantity: number; price: number; kgs?: number; };
type Transaction = { id: string; type: 'Sale' | 'Purchase'; date: string; party: string; items: InvoiceItem[]; subtotal: number; taxRateId?: string; taxAmount: number; total: number; status: TransactionStatus; };
type CashbookEntry = { id: string; date: string; description: string; type: 'Revenue' | 'Expense'; category: string; amount: number; };
type TaxRate = { id: string; name: string; rate: number; country: string; };
type PayType = 'Monthly' | 'Weekly';
type Employee = { id: string; name: string; position: string; payType: PayType; payRate: number; };
type Customer = { id: string; name: string; email: string; phone: string; address: string; };
type Vendor = { id: string; name: string; email: string; phone: string; service: string; };
type InventoryItem = { id: string; name: string; type: 'Raw Material' | 'Finished Good'; quantity: number; unitCost: number; };
type ContactsSubTab = 'customers' | 'vendors';

// --- Class Constants ---
const formInputClasses = "w-full rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 placeholder-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500";
const formSelectClasses = "w-full rounded-lg p-3 appearance-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200";

// --- Suggested Tax Rates ---
const suggestedTaxRates: { [key: string]: { name: string; rate: number } } = {
    'PK': { name: "GST", rate: 17 }, 'GB': { name: "VAT", rate: 20 }, 'US': { name: "Sales Tax (Avg)", rate: 7.5 }, 'CA': { name: "GST/HST (Avg)", rate: 13 },
    'IN': { name: "GST", rate: 18 }, 'DE': { name: "VAT", rate: 19 }, 'FR': { name: "VAT", rate: 20 }, 'AU': { name: "GST", rate: 10 }
};

// --- Reusable Components ---
const StatCard: FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
        <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 p-3 rounded-lg">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);
const ModuleHeader: FC<{ title: string; subtitle: string; children?: React.ReactNode }> = ({ title, subtitle, children }) => (
    <header className="mb-6 flex justify-between items-start">
        <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{title}</h2>
            <p className="mt-1 text-md text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        <div>{children}</div>
    </header>
);

const CompanyManagement: React.FC<CompanyManagementProps> = ({ addToast, companyDetails }) => {
    const [view, setView] = useState<View>('dashboard');
    const [contactsSubTab, setContactsSubTab] = useState<ContactsSubTab>('customers');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [cashbook, setCashbook] = useState<CashbookEntry[]>([]);
    const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    
    const [modal, setModal] = useState<'transaction' | 'tax' | 'employee' | 'customer' | 'vendor' | 'inventory' | 'cashbook' | null>(null);
    const [currentTransaction, setCurrentTransaction] = useState<Partial<Transaction>>({ items: [{ description: '', quantity: 1, price: 0, kgs: 1 }] });
    const [currentCashbookEntry, setCurrentCashbookEntry] = useState<Partial<CashbookEntry>>({});
    const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({});
    const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer>>({});
    const [currentVendor, setCurrentVendor] = useState<Partial<Vendor>>({});
    const [currentInventoryItem, setCurrentInventoryItem] = useState<Partial<InventoryItem>>({});
    const [currentTaxRate, setCurrentTaxRate] = useState<Partial<TaxRate>>({});

    useEffect(() => {
        const load = (key: string, setter: (data: any) => void) => {
            try {
                const data = localStorage.getItem(`company_${key}`);
                if (data) setter(JSON.parse(data));
            } catch (e) { console.error(`Failed to load ${key}`, e)}
        };
        ['transactions', 'cashbook', 'taxRates', 'employees', 'customers', 'vendors', 'inventory'].forEach(key => load(key, eval(`set${key.charAt(0).toUpperCase() + key.slice(1)}`)));
    }, []);

    useEffect(() => { localStorage.setItem('company_transactions', JSON.stringify(transactions)); }, [transactions]);
    useEffect(() => { localStorage.setItem('company_cashbook', JSON.stringify(cashbook)); }, [cashbook]);
    useEffect(() => { localStorage.setItem('company_taxRates', JSON.stringify(taxRates)); }, [taxRates]);
    useEffect(() => { localStorage.setItem('company_employees', JSON.stringify(employees)); }, [employees]);
    useEffect(() => { localStorage.setItem('company_customers', JSON.stringify(customers)); }, [customers]);
    useEffect(() => { localStorage.setItem('company_vendors', JSON.stringify(vendors)); }, [vendors]);
    useEffect(() => { localStorage.setItem('company_inventory', JSON.stringify(inventory)); }, [inventory]);

    const getSales = () => transactions.filter(t => t.type === 'Sale');
    const getPurchases = () => transactions.filter(t => t.type === 'Purchase');
    
    const markAsPaid = (txId: string) => {
        const tx = transactions.find(t => t.id === txId);
        if(!tx || tx.status === 'Paid') return;
        setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'Paid' } : t));
        setCashbook(prev => [...prev, {
            id: Date.now().toString(), date: new Date().toISOString().split('T')[0],
            description: `Payment for ${tx.type === 'Sale' ? 'Invoice' : 'Bill'} #${txId.slice(-5)}`,
            type: tx.type === 'Sale' ? 'Revenue' : 'Expense', category: tx.type === 'Sale' ? 'Sales' : 'Purchases', amount: tx.total
        }]);
        addToast(`${tx.type} marked as paid and recorded in cashbook.`, 'success');
    };

    const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: companyDetails?.billingCurrency || 'USD' });

    const DashboardView = () => {
        const grossSales = getSales().reduce((sum, t) => sum + t.subtotal, 0);
        const receivables = getSales().filter(t => t.status === 'Unpaid').reduce((sum, t) => sum + t.total, 0);
        const payables = getPurchases().filter(t => t.status === 'Unpaid').reduce((sum, t) => sum + t.total, 0);
        const cashOnHand = cashbook.reduce((sum, entry) => sum + (entry.type === 'Revenue' ? entry.amount : -entry.amount), 0);
        return (
            <div className="space-y-6">
                <ModuleHeader title="Dashboard" subtitle={`An overview of ${companyDetails?.businessName || 'your company'}.`} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Gross Sales" value={currencyFormatter.format(grossSales)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
                    <StatCard title="Receivables" value={currencyFormatter.format(receivables)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>} />
                    <StatCard title="Payables" value={currencyFormatter.format(payables)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                    <StatCard title="Cash on Hand" value={currencyFormatter.format(cashOnHand)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>} />
                </div>
            </div>
        );
    };

    const TransactionListView: FC<{ type: 'Sale' | 'Purchase' }> = ({ type }) => (
        <div className="space-y-6">
            <ModuleHeader title={type === 'Sale' ? 'Sales Invoices' : 'Purchase Bills'} subtitle={type === 'Sale' ? 'Manage your customer invoices.' : 'Track your vendor bills.'}>
                <button onClick={() => { setCurrentTransaction({ type, items: [{ description: '', quantity: 1, price: 0, kgs: 1 }], date: new Date().toISOString().split('T')[0], status: 'Unpaid' }); setModal('transaction'); }} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm">{type === 'Sale' ? 'New Invoice' : 'New Bill'}</button>
            </ModuleHeader>
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400"><tr>
                        <th scope="col" className="px-6 py-3">Date</th><th scope="col" className="px-6 py-3">{type === 'Sale' ? 'Customer' : 'Vendor'}</th>
                        <th scope="col" className="px-6 py-3">Status</th><th scope="col" className="px-6 py-3 text-right">Total</th><th scope="col" className="px-6 py-3"></th>
                    </tr></thead><tbody>
                        {(type === 'Sale' ? getSales() : getPurchases()).map(tx => (<tr key={tx.id} className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
                            <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td><td className="px-6 py-4">{tx.party}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'Paid' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'}`}>{tx.status}</span></td>
                            <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">{currencyFormatter.format(tx.total)}</td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">{tx.status === 'Unpaid' && <button onClick={() => markAsPaid(tx.id)} className="text-blue-600 hover:underline">Mark Paid</button>}</td>
                        </tr>))}</tbody>
                </table></div>
            </div>
        </div>
    );

    const InventoryListView = () => (
        <div className="space-y-6">
            <ModuleHeader title="Inventory" subtitle="Track your raw materials and finished goods.">
                <button onClick={() => { setCurrentInventoryItem({}); setModal('inventory'); }} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm">New Item</button>
            </ModuleHeader>
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800"><div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400"><tr>
                    <th scope="col" className="px-6 py-3">Item Name</th><th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3 text-right">Quantity</th><th scope="col" className="px-6 py-3 text-right">Unit Cost</th><th scope="col" className="px-6 py-3 text-right">Total Value</th>
                </tr></thead><tbody>
                    {inventory.map(item => (<tr key={item.id} className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
                        <td className="px-6 py-4 font-semibold">{item.name}</td><td className="px-6 py-4">{item.type}</td>
                        <td className="px-6 py-4 text-right">{item.quantity}</td><td className="px-6 py-4 text-right">{currencyFormatter.format(item.unitCost)}</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">{currencyFormatter.format(item.quantity * item.unitCost)}</td>
                    </tr>))}</tbody>
            </table></div></div>
        </div>
    );
    
    const ContactsListView = () => {
        const customerData = customers.map(customer => ({
            ...customer,
            receivables: getSales().filter(inv => inv.party === customer.name && inv.status === 'Unpaid').reduce((sum, inv) => sum + inv.total, 0),
        }));
        return(
        <div className="space-y-6">
            <ModuleHeader title="Contacts" subtitle="Manage your customers and vendors." />
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4"><nav className="-mb-px flex space-x-4">
                    <button onClick={() => setContactsSubTab('customers')} className={`py-2 px-1 border-b-2 font-medium text-sm ${contactsSubTab === 'customers' ? 'border-purple-500 text-purple-600 dark:text-purple-300' : 'border-transparent text-gray-500 hover:text-gray-600'}`}>Customers</button>
                    <button onClick={() => setContactsSubTab('vendors')} className={`py-2 px-1 border-b-2 font-medium text-sm ${contactsSubTab === 'vendors' ? 'border-purple-500 text-purple-600 dark:text-purple-300' : 'border-transparent text-gray-500 hover:text-gray-600'}`}>Vendors</button>
                </nav></div>
                {contactsSubTab === 'customers' ? (<div>
                    <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Customers</h3><button onClick={() => { setCurrentCustomer({}); setModal('customer'); }} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm">New Customer</button></div>
                    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>
                        <th className="px-6 py-3">Name</th><th className="px-6 py-3">Contact</th><th className="px-6 py-3 text-right">Receivables</th>
                    </tr></thead><tbody>
                        {customerData.map(c => <tr key={c.id}><td className="px-6 py-4 font-semibold">{c.name}</td><td className="px-6 py-4">{c.email}</td><td className="px-6 py-4 text-right font-bold text-red-500">{currencyFormatter.format(c.receivables)}</td></tr>)}
                    </tbody></table></div>
                </div>) : (<div>
                    <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Vendors</h3><button onClick={() => { setCurrentVendor({}); setModal('vendor'); }} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm">New Vendor</button></div>
                    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>
                        <th className="px-6 py-3">Name</th><th className="px-6 py-3">Service</th><th className="px-6 py-3">Contact</th>
                    </tr></thead><tbody>
                        {vendors.map(v => <tr key={v.id}><td className="px-6 py-4 font-semibold">{v.name}</td><td className="px-6 py-4">{v.service}</td><td className="px-6 py-4">{v.email}</td></tr>)}
                    </tbody></table></div>
                </div>)}
            </div>
        </div>
    )};

    const HrPayrollView = () => {
        const runPayroll = (type: PayType) => {
            const payrollEmployees = employees.filter(e => e.payType === type);
            if(payrollEmployees.length === 0) {
                addToast(`No ${type.toLowerCase()} employees to pay.`, 'error');
                return;
            }
            const totalPayroll = payrollEmployees.reduce((sum, e) => sum + e.payRate, 0);
            const confirmation = window.confirm(`This will run payroll for all ${type.toLowerCase()} employees, totaling ${currencyFormatter.format(totalPayroll)}. This will create an expense in your cashbook. Continue?`);
            if (confirmation) {
                setCashbook(prev => [...prev, {
                    id: Date.now().toString(), date: new Date().toISOString().split('T')[0],
                    description: `${type} Payroll Run`, amount: totalPayroll, type: 'Expense', category: 'Payroll'
                }]);
                addToast(`${type} payroll processed successfully.`, 'success');
            }
        };
        return (
        <div className="space-y-6">
            <ModuleHeader title="HR & Payroll" subtitle="Manage your employees and run payroll.">
                <button onClick={() => { setCurrentEmployee({}); setModal('employee'); }} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm">New Employee</button>
            </ModuleHeader>
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex justify-end gap-4 mb-4"><button onClick={()=>runPayroll('Weekly')} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm">Run Weekly Payroll</button><button onClick={()=>runPayroll('Monthly')} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm">Run Monthly Payroll</button></div>
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>
                    <th className="px-6 py-3">Name</th><th className="px-6 py-3">Position</th><th className="px-6 py-3">Pay Type</th><th className="px-6 py-3 text-right">Pay Rate</th>
                </tr></thead><tbody>
                    {employees.map(e => <tr key={e.id}><td className="px-6 py-4 font-semibold">{e.name}</td><td className="px-6 py-4">{e.position}</td><td className="px-6 py-4">{e.payType}</td><td className="px-6 py-4 text-right">{currencyFormatter.format(e.payRate)}</td></tr>)}
                </tbody></table></div>
            </div>
        </div>
    )};

    const ReportsGeneratorView = () => {
        const [startDate, setStartDate] = useState('');
        const [endDate, setEndDate] = useState('');

        const handleDownloadReport = () => {
            const doc = new jsPDF();
            const filteredSales = getSales().filter(t => t.date >= startDate && t.date <= endDate);
            const filteredPurchases = getPurchases().filter(t => t.date >= startDate && t.date <= endDate);
            const revenue = filteredSales.reduce((s, t) => s + t.subtotal, 0);
            const cogs = filteredPurchases.reduce((s, t) => s + t.subtotal, 0);
            const grossProfit = revenue - cogs;
            
            doc.setFontSize(18); doc.text('Profit & Loss Statement', 14, 22);
            (doc as any).autoTable({
                startY: 50, head: [['Description', 'Amount']],
                body: [['Total Revenue', currencyFormatter.format(revenue)],['Cost of Goods Sold', currencyFormatter.format(cogs)],['Gross Profit', currencyFormatter.format(grossProfit)]],
            });
            doc.save(`pnl_report_${startDate}_to_${endDate}.pdf`);
        };
        return(
        <div className="space-y-6">
            <ModuleHeader title="Reports" subtitle="Generate financial reports for your business." />
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <h4 className="font-bold text-lg mb-4">Monthly Profit & Loss</h4>
                <div className="flex gap-4 mb-4"><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={formInputClasses}/><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={formInputClasses}/></div>
                <button onClick={handleDownloadReport} disabled={!startDate || !endDate} className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-2 px-4 rounded-lg text-sm">Download P&L Report</button>
            </div>
        </div>
    )};
    
    const TaxesManagerView = () => {
        const [selectedCountry, setSelectedCountry] = useState(companyDetails?.country || 'US');
        const addSuggestedTax = () => {
            const suggested = suggestedTaxRates[selectedCountry];
            if(suggested && !taxRates.some(t => t.country === selectedCountry)) {
                setTaxRates(prev => [...prev, {id: Date.now().toString(), country: selectedCountry, ...suggested}]);
                addToast(`Added ${suggested.name} for ${selectedCountry}.`, 'success');
            } else {
                addToast('Tax rate for this country already exists or is not available.', 'error');
            }
        };
        return(
        <div className="space-y-6">
            <ModuleHeader title="Taxes" subtitle="Manage tax rates for your sales and purchases." />
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border mb-6 space-y-4">
                     <div>
                        <h5 className="font-semibold mb-2">Add Suggested Tax Rate by Country</h5>
                        <div className="flex gap-4"><select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className={formSelectClasses}>{Object.keys(suggestedTaxRates).map(c => <option key={c} value={c}>{c}</option>)}</select><button onClick={addSuggestedTax} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Add Rate</button></div>
                    </div>
                     <div>
                        <h5 className="font-semibold mb-2">Or, Add a Custom Tax Rate</h5>
                        <button onClick={() => { setCurrentTaxRate({}); setModal('tax'); }} className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg text-sm">Add Custom Tax</button>
                    </div>
                </div>
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>
                    <th className="px-6 py-3">Name</th><th className="px-6 py-3">Country</th><th className="px-6 py-3 text-right">Rate</th>
                </tr></thead><tbody>
                    {taxRates.map(r => <tr key={r.id}><td className="px-6 py-4 font-semibold">{r.name}</td><td className="px-6 py-4">{r.country}</td><td className="px-6 py-4 text-right">{r.rate}%</td></tr>)}
                </tbody></table></div>
            </div>
        </div>
    )};

    const CashbookView = () => (
        <div className="space-y-6">
            <ModuleHeader title="Cashbook" subtitle="Manually record your revenues and expenses.">
                <button onClick={() => { setCurrentCashbookEntry({ date: new Date().toISOString().split('T')[0] }); setModal('cashbook'); }} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm">New Entry</button>
            </ModuleHeader>
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400"><tr>
                        <th scope="col" className="px-6 py-3">Date</th><th scope="col" className="px-6 py-3">Description</th>
                        <th scope="col" className="px-6 py-3">Category</th><th scope="col" className="px-6 py-3 text-right">Amount</th>
                    </tr></thead><tbody>
                        {cashbook.map(entry => (<tr key={entry.id} className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
                            <td className="px-6 py-4">{new Date(entry.date).toLocaleDateString()}</td><td className="px-6 py-4">{entry.description}</td>
                            <td className="px-6 py-4">{entry.category}</td>
                            <td className={`px-6 py-4 text-right font-semibold ${entry.type === 'Revenue' ? 'text-green-500' : 'text-red-500'}`}>{currencyFormatter.format(entry.amount)}</td>
                        </tr>))}</tbody>
                </table></div>
            </div>
        </div>
    );

    const renderCurrentView = () => {
        switch (view) {
            case 'dashboard': return <DashboardView />; case 'sales': return <TransactionListView type="Sale" />; case 'purchases': return <TransactionListView type="Purchase" />;
            case 'inventory': return <InventoryListView />; case 'contacts': return <ContactsListView />; case 'hr': return <HrPayrollView />;
            case 'reports': return <ReportsGeneratorView />; case 'taxes': return <TaxesManagerView />; case 'cashbook': return <CashbookView />; default: return <DashboardView />;
        }
    };
    
    const NavItem: FC<{ viewName: View; label: string; icon: React.ReactNode; }> = ({ viewName, label, icon }) => (
        <button onClick={() => setView(viewName)} className={`flex items-center w-full px-3 py-2.5 text-sm transition-all duration-200 rounded-lg group relative ${view === viewName ? 'bg-purple-600/10 text-purple-500 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800/50'}`}>
            {view === viewName && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-r-full"></div>}
            <div className="w-6 h-6">{icon}</div><span className="ml-4 font-semibold flex-grow text-left">{label}</span>
        </button>
    );

    const renderModals = () => {
        if (!modal) return null;
        const closeModal = () => setModal(null);

        switch(modal) {
            case 'transaction':
                const isSales = currentTransaction.type === 'Sale';
                const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
                    const items = [...(currentTransaction.items || [])];
                    items[index] = { ...items[index], [field]: value };
                    setCurrentTransaction({ ...currentTransaction, items });
                };
                const handleSubmitTx = (e: React.FormEvent) => {
                    e.preventDefault();
                    const subtotal = (currentTransaction.items || []).reduce((sum, item) => sum + ((item.kgs || 1) * item.quantity * item.price), 0);
                    const taxRate = taxRates.find(t => t.id === currentTransaction.taxRateId);
                    const taxAmount = taxRate ? subtotal * (taxRate.rate / 100) : 0;
                    const total = subtotal + taxAmount;
                    const newTx = { ...currentTransaction, id: Date.now().toString(), subtotal, taxAmount, total } as Transaction;
                    setTransactions(prev => [...prev, newTx]);
                    addToast(`${isSales ? 'Invoice' : 'Bill'} created.`, 'success');
                    closeModal();
                };
                return (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl p-6 shadow-xl max-h-[90vh] flex flex-col">
                     <h3 className="text-xl font-bold mb-4">{isSales ? 'New Invoice' : 'New Bill'}</h3>
                     <form onSubmit={handleSubmitTx} className="space-y-4 overflow-y-auto pr-2 flex-grow">
                         <div className="grid grid-cols-3 gap-4">
                             <input type="date" value={currentTransaction.date || ''} onChange={e => setCurrentTransaction({...currentTransaction, date: e.target.value})} className={formInputClasses} required />
                             <input type="text" list={isSales ? 'customer-list':'vendor-list'} value={currentTransaction.party || ''} onChange={e => setCurrentTransaction({...currentTransaction, party: e.target.value})} className={formInputClasses} placeholder={isSales ? "Customer Name" : "Vendor Name"} required />
                             <datalist id="customer-list">{customers.map(c => <option key={c.id} value={c.name} />)}</datalist>
                             <datalist id="vendor-list">{vendors.map(v => <option key={v.id} value={v.name} />)}</datalist>
                             <select value={currentTransaction.taxRateId || ''} onChange={e => setCurrentTransaction({...currentTransaction, taxRateId: e.target.value})} className={formSelectClasses}><option value="">No Tax</option>{taxRates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>)}</select>
                         </div>
                         {(currentTransaction.items || []).map((item, index) => <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg grid grid-cols-12 gap-2 items-end">
                            <textarea value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} placeholder="Description" className={`${formInputClasses} text-sm col-span-12`} rows={2} required />
                            <div className="col-span-4"><label className="text-xs">Weight(Kgs)*</label><input type="number" step="any" value={item.kgs || ''} onChange={e => handleItemChange(index, 'kgs', parseFloat(e.target.value))} className={`${formInputClasses} p-2 text-sm`} required/></div>
                            <div className="col-span-4"><label className="text-xs">Quantity*</label><input type="number" step="any" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value))} className={`${formInputClasses} p-2 text-sm`} required/></div>
                            <div className="col-span-4"><label className="text-xs">Unit Price*</label><input type="number" step="any" value={item.price} onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value))} className={`${formInputClasses} p-2 text-sm`} required/></div>
                         </div>)}
                         <button type="button" onClick={() => setCurrentTransaction(p => ({...p, items: [...(p.items || []), {description:'',quantity:1,price:0,kgs:1}]}))} className="text-sm text-purple-600 hover:underline">+ Add Item</button>
                     </form>
                     <div className="flex justify-end gap-2 pt-4 mt-4 border-t"><button type="button" onClick={closeModal} className="bg-gray-200 hover:bg-gray-300 font-bold py-2 px-4 rounded-lg">Cancel</button><button type="button" onClick={handleSubmitTx} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">Save</button></div>
                </div></div>);
            case 'customer':
                return (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg p-6 shadow-xl">
                    <h3 className="text-xl font-bold mb-4">Add Customer</h3>
                    <form onSubmit={e => { e.preventDefault(); setCustomers(p => [...p, {...currentCustomer, id: Date.now().toString()} as Customer]); addToast('Customer added.', 'success'); closeModal(); }} className="space-y-4">
                        <input type="text" value={currentCustomer.name || ''} onChange={e => setCurrentCustomer({...currentCustomer, name: e.target.value})} placeholder="Full Name" className={formInputClasses} required />
                        <input type="email" value={currentCustomer.email || ''} onChange={e => setCurrentCustomer({...currentCustomer, email: e.target.value})} placeholder="Email" className={formInputClasses} />
                        <input type="tel" value={currentCustomer.phone || ''} onChange={e => setCurrentCustomer({...currentCustomer, phone: e.target.value})} placeholder="Phone" className={formInputClasses} />
                        <textarea value={currentCustomer.address || ''} onChange={e => setCurrentCustomer({...currentCustomer, address: e.target.value})} placeholder="Address" className={formInputClasses} rows={2} />
                        <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={closeModal} className="bg-gray-200 py-2 px-4 rounded-lg">Cancel</button><button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded-lg">Save</button></div>
                    </form>
                </div></div>);
            case 'vendor':
                return (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg p-6 shadow-xl">
                    <h3 className="text-xl font-bold mb-4">Add Vendor</h3>
                    <form onSubmit={e => { e.preventDefault(); setVendors(p => [...p, {...currentVendor, id: Date.now().toString()} as Vendor]); addToast('Vendor added.', 'success'); closeModal(); }} className="space-y-4">
                        <input type="text" value={currentVendor.name || ''} onChange={e => setCurrentVendor({...currentVendor, name: e.target.value})} placeholder="Vendor Name" className={formInputClasses} required />
                        <input type="text" value={currentVendor.service || ''} onChange={e => setCurrentVendor({...currentVendor, service: e.target.value})} placeholder="Service/Product" className={formInputClasses} />
                        <input type="email" value={currentVendor.email || ''} onChange={e => setCurrentVendor({...currentVendor, email: e.target.value})} placeholder="Email" className={formInputClasses} />
                        <input type="tel" value={currentVendor.phone || ''} onChange={e => setCurrentVendor({...currentVendor, phone: e.target.value})} placeholder="Phone" className={formInputClasses} />
                        <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={closeModal} className="bg-gray-200 py-2 px-4 rounded-lg">Cancel</button><button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded-lg">Save</button></div>
                    </form>
                </div></div>);
            case 'employee':
                return (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg p-6 shadow-xl">
                    <h3 className="text-xl font-bold mb-4">Add Employee</h3>
                    <form onSubmit={e => { e.preventDefault(); setEmployees(p => [...p, {...currentEmployee, id: Date.now().toString()} as Employee]); addToast('Employee added.', 'success'); closeModal(); }} className="space-y-4">
                        <input type="text" value={currentEmployee.name || ''} onChange={e => setCurrentEmployee({...currentEmployee, name: e.target.value})} placeholder="Full Name" className={formInputClasses} required />
                        <input type="text" value={currentEmployee.position || ''} onChange={e => setCurrentEmployee({...currentEmployee, position: e.target.value})} placeholder="Position / Job Title" className={formInputClasses} required />
                        <div className="grid grid-cols-2 gap-4">
                            <select value={currentEmployee.payType || ''} onChange={e => setCurrentEmployee({...currentEmployee, payType: e.target.value as PayType})} className={formSelectClasses} required>
                                <option value="" disabled>Pay Type</option><option value="Monthly">Monthly</option><option value="Weekly">Weekly</option>
                            </select>
                            <input type="number" step="any" min="0" value={currentEmployee.payRate || ''} onChange={e => setCurrentEmployee({...currentEmployee, payRate: parseFloat(e.target.value)})} placeholder="Pay Rate" className={formInputClasses} required />
                        </div>
                        <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={closeModal} className="bg-gray-200 py-2 px-4 rounded-lg">Cancel</button><button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded-lg">Save Employee</button></div>
                    </form>
                </div></div>);
            case 'inventory':
                return (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg p-6 shadow-xl">
                    <h3 className="text-xl font-bold mb-4">Add Inventory Item</h3>
                    <form onSubmit={e => { e.preventDefault(); setInventory(p => [...p, {...currentInventoryItem, id: Date.now().toString()} as InventoryItem]); addToast('Inventory item added.', 'success'); closeModal(); }} className="space-y-4">
                        <input type="text" value={currentInventoryItem.name || ''} onChange={e => setCurrentInventoryItem({...currentInventoryItem, name: e.target.value})} placeholder="Item Name" className={formInputClasses} required />
                        <select value={currentInventoryItem.type || ''} onChange={e => setCurrentInventoryItem({...currentInventoryItem, type: e.target.value as 'Raw Material' | 'Finished Good'})} className={formSelectClasses} required>
                            <option value="" disabled>Item Type</option><option value="Raw Material">Raw Material</option><option value="Finished Good">Finished Good</option>
                        </select>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" min="0" value={currentInventoryItem.quantity || ''} onChange={e => setCurrentInventoryItem({...currentInventoryItem, quantity: parseInt(e.target.value)})} placeholder="Quantity on Hand" className={formInputClasses} required />
                            <input type="number" step="any" min="0" value={currentInventoryItem.unitCost || ''} onChange={e => setCurrentInventoryItem({...currentInventoryItem, unitCost: parseFloat(e.target.value)})} placeholder="Unit Cost" className={formInputClasses} required />
                        </div>
                        <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={closeModal} className="bg-gray-200 py-2 px-4 rounded-lg">Cancel</button><button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded-lg">Save Item</button></div>
                    </form>
                </div></div>);
            case 'cashbook':
                return (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg p-6 shadow-xl">
                    <h3 className="text-xl font-bold mb-4">New Cashbook Entry</h3>
                    <form onSubmit={e => { e.preventDefault(); setCashbook(p => [...p, {...currentCashbookEntry, id: Date.now().toString()} as CashbookEntry]); addToast('Cashbook entry added.', 'success'); closeModal(); }} className="space-y-4">
                        <input type="date" value={currentCashbookEntry.date || ''} onChange={e => setCurrentCashbookEntry({...currentCashbookEntry, date: e.target.value})} className={formInputClasses} required />
                        <input type="text" value={currentCashbookEntry.description || ''} onChange={e => setCurrentCashbookEntry({...currentCashbookEntry, description: e.target.value})} placeholder="Description" className={formInputClasses} required />
                        <div className="grid grid-cols-2 gap-4">
                            <select value={currentCashbookEntry.type || ''} onChange={e => setCurrentCashbookEntry({...currentCashbookEntry, type: e.target.value as 'Revenue' | 'Expense'})} className={formSelectClasses} required>
                                <option value="" disabled>Type</option><option value="Revenue">Revenue</option><option value="Expense">Expense</option>
                            </select>
                            <input type="text" value={currentCashbookEntry.category || ''} onChange={e => setCurrentCashbookEntry({...currentCashbookEntry, category: e.target.value})} placeholder="Category (e.g., Office Supplies)" className={formInputClasses} required />
                        </div>
                        <input type="number" step="any" min="0" value={currentCashbookEntry.amount || ''} onChange={e => setCurrentCashbookEntry({...currentCashbookEntry, amount: parseFloat(e.target.value)})} placeholder="Amount" className={formInputClasses} required />
                        <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={closeModal} className="bg-gray-200 py-2 px-4 rounded-lg">Cancel</button><button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded-lg">Save Entry</button></div>
                    </form>
                </div></div>);
            case 'tax':
                return (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg p-6 shadow-xl">
                    <h3 className="text-xl font-bold mb-4">Add Custom Tax Rate</h3>
                    <form onSubmit={e => { e.preventDefault(); setTaxRates(p => [...p, {...currentTaxRate, id: Date.now().toString()} as TaxRate]); addToast('Tax rate added.', 'success'); closeModal(); }} className="space-y-4">
                        <input type="text" value={currentTaxRate.name || ''} onChange={e => setCurrentTaxRate({...currentTaxRate, name: e.target.value})} placeholder="Tax Name (e.g., VAT)" className={formInputClasses} required />
                        <input type="text" value={currentTaxRate.country || ''} onChange={e => setCurrentTaxRate({...currentTaxRate, country: e.target.value})} placeholder="Country Code (e.g., US)" className={formInputClasses} required />
                        <input type="number" step="any" min="0" value={currentTaxRate.rate || ''} onChange={e => setCurrentTaxRate({...currentTaxRate, rate: parseFloat(e.target.value)})} placeholder="Rate (%)" className={formInputClasses} required />
                        <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={closeModal} className="bg-gray-200 py-2 px-4 rounded-lg">Cancel</button><button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded-lg">Save Rate</button></div>
                    </form>
                </div></div>);
        }
        return null;
    };


    return (
        <div className="w-full h-full flex flex-row p-1 gap-6 animate-fade-in">
            <aside className="w-64 bg-white/50 dark:bg-gray-900/50 p-4 border border-gray-200 dark:border-gray-800 rounded-xl flex-col hidden lg:flex">
                <nav className="flex flex-col space-y-2 flex-grow">
                    <NavItem viewName="dashboard" label="Dashboard" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} />
                    <NavItem viewName="cashbook" label="Cashbook" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>} />
                    <NavItem viewName="sales" label="Sales" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
                    <NavItem viewName="purchases" label="Purchases" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} />
                    <NavItem viewName="inventory" label="Inventory" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} />
                    <NavItem viewName="contacts" label="Contacts" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>} />
                    <NavItem viewName="hr" label="HR & Payroll" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                    <NavItem viewName="reports" label="Reports" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
                    <NavItem viewName="taxes" label="Taxes" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 14l-6-6m5.5.5h.01M4.707 4.707a1 1 0 00-1.414 1.414l16 16a1 1 0 001.414-1.414l-16-16z" /></svg>} />
                </nav>
            </aside>
            <main className="flex-1">
                {renderCurrentView()}
            </main>
            {renderModals()}
        </div>
    );
};

export default CompanyManagement;
