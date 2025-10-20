import React, { useState, useEffect, useMemo, FC } from 'react';
import { ToastMessage } from './Dashboard';

// --- Type Definitions ---
interface Investment {
  id: number;
  date: string;
  description: string;
  type: 'Capital' | 'Asset';
  amount: number;
}
interface Sale {
  id: number;
  date: string;
  description: string;
  type: 'Product' | 'Service';
  quantity?: number;
  unitPrice?: number;
  serviceDetails?: string;
  amount: number;
}
interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
}
interface Purchase {
  id: number;
  date: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
}
interface LeanCanvasState {
  problem: string;
  solution: string;
  keyMetrics: string;
  uniqueValueProposition: string;
  unfairAdvantage: string;
  channels: string;
  customerSegments: string;
  costStructureNotes: string;
  revenueStreamsNotes: string;
}
type ModalType = 'addInvestment' | 'addSale' | 'addExpense' | 'addPurchase' | null;

const formInputClasses = "w-full rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 placeholder-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500";
const formSelectClasses = "w-full rounded-lg p-3 appearance-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200";


interface StartupSuiteProps {
  addToast: (message: string, type: ToastMessage['type']) => void;
}

// Utility for local storage
const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

const StartupSuite: React.FC<StartupSuiteProps> = ({ addToast }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'costs' | 'investments' | 'canvas'>('overview');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType>(null);
    const [currency, setCurrency] = useState('USD');
    
    useEffect(() => {
        const details = localStorage.getItem('companyDetails');
        if (details) {
            setCurrency(JSON.parse(details).billingCurrency || 'USD');
        }
    }, []);
    
    const formatCurrency = useMemo(() => (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }, [currency]);

    const [investments, setInvestments] = useStickyState<Investment[]>([], 'keystone-investments-v2');
    const [sales, setSales] = useStickyState<Sale[]>([], 'keystone-sales-v2');
    const [expenses, setExpenses] = useStickyState<Expense[]>([], 'keystone-expenses-v2');
    const [purchases, setPurchases] = useStickyState<Purchase[]>([], 'keystone-purchases-v2');
    const [leanCanvasData, setLeanCanvasData] = useStickyState<LeanCanvasState>({
        problem: '', solution: '', keyMetrics: '', uniqueValueProposition: '', unfairAdvantage: '',
        channels: '', customerSegments: '', costStructureNotes: '', revenueStreamsNotes: ''
    }, 'keystone-lean-canvas-v2');

    const overviewData = useMemo(() => {
        const totalInvestment = investments.reduce((sum, item) => sum + item.amount, 0);
        const totalSales = sales.reduce((sum, item) => sum + item.amount, 0);
        const totalPurchases = purchases.reduce((sum, item) => sum + item.totalCost, 0); // COGS
        const totalOpEx = expenses.reduce((sum, item) => sum + item.amount, 0);
        const totalCosts = totalPurchases + totalOpEx;
        const netProfit = totalSales - totalCosts;
        const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
        return { totalInvestment, totalSales, totalPurchases, totalOpEx, netProfit, roi };
    }, [investments, sales, expenses, purchases]);

    const handleOpenModal = (type: ModalType) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalType(null);
    };

    const handleSaveFinancial = (data: any) => {
        const timestamp = Date.now();
        switch (modalType) {
            case 'addInvestment':
                setInvestments(prev => [...prev, { ...data, id: timestamp, amount: parseFloat(data.amount) }]);
                break;
            case 'addSale':
                const saleAmount = data.type === 'Product' 
                    ? parseFloat(data.quantity) * parseFloat(data.unitPrice) 
                    : parseFloat(data.amount);
                setSales(prev => [...prev, { ...data, id: timestamp, amount: saleAmount, quantity: data.quantity ? parseFloat(data.quantity) : undefined, unitPrice: data.unitPrice ? parseFloat(data.unitPrice) : undefined }]);
                break;
            case 'addExpense':
                setExpenses(prev => [...prev, { ...data, id: timestamp, amount: parseFloat(data.amount) }]);
                break;
            case 'addPurchase':
                const totalCost = parseFloat(data.quantity) * parseFloat(data.unitPrice);
                setPurchases(prev => [...prev, { ...data, id: timestamp, totalCost, quantity: parseFloat(data.quantity), unitPrice: parseFloat(data.unitPrice) }]);
                break;
        }
        addToast('Entry saved locally!', 'success');
        handleCloseModal();
    };
    
    const handleSaveCanvas = (data: LeanCanvasState) => {
        setLeanCanvasData(data);
    };
    
    const renderContent = () => {
        switch(activeTab) {
            case 'overview': return <OverviewTab data={overviewData} formatCurrency={formatCurrency} />;
            case 'sales': return <SalesTab sales={sales} onAddSale={() => handleOpenModal('addSale')} formatCurrency={formatCurrency} />;
            case 'costs': return <ExpensesPurchasesTab expenses={expenses} purchases={purchases} onAddExpense={() => handleOpenModal('addExpense')} onAddPurchase={() => handleOpenModal('addPurchase')} formatCurrency={formatCurrency} />;
            case 'investments': return <InvestmentsTab investments={investments} onAddInvestment={() => handleOpenModal('addInvestment')} formatCurrency={formatCurrency} />;
            case 'canvas': return <LeanCanvasTab data={leanCanvasData} onSave={handleSaveCanvas} financialData={overviewData} addToast={addToast} formatCurrency={formatCurrency} />;
            default: return null;
        }
    }

    return (
        <div className="w-full h-full flex flex-col p-1 animate-fade-in">
            <header className="mb-8">
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Startup <span className="text-purple-500">Suite</span></h2>
                 <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Essential tools for planning and tracking your new venture.</p>
            </header>
            
            <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    <TabButton label="Overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <TabButton label="Sales" isActive={activeTab === 'sales'} onClick={() => setActiveTab('sales')} />
                    <TabButton label="Costs" isActive={activeTab === 'costs'} onClick={() => setActiveTab('costs')} />
                    <TabButton label="Investments" isActive={activeTab === 'investments'} onClick={() => setActiveTab('investments')} />
                    <TabButton label="Lean Canvas" isActive={activeTab === 'canvas'} onClick={() => setActiveTab('canvas')} />
                </nav>
            </div>

            <div className="flex-grow">
                {renderContent()}
            </div>
            {isModalOpen && <Modal onClose={handleCloseModal} onSave={handleSaveFinancial} type={modalType} currency={currency} />}
        </div>
    );
};

// --- Tabs ---
const OverviewTab: FC<{ data: any, formatCurrency: (amount: number) => string }> = ({ data, formatCurrency }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Investment" value={data.totalInvestment} formatCurrency={formatCurrency} />
            <StatCard title="Gross Sales" value={data.totalSales} formatCurrency={formatCurrency} />
            <StatCard title="Net Profit / Loss" value={data.netProfit} formatCurrency={formatCurrency} />
            <StatCard title="Cost of Goods Sold (COGS)" value={data.totalPurchases} formatCurrency={formatCurrency} isExpense />
            <StatCard title="Operating Expenses" value={data.totalOpEx} formatCurrency={formatCurrency} isExpense />
            <StatCard title="Return on Investment (ROI)" value={data.roi} formatAsPercent />
        </div>
    </div>
);

const SalesTab: FC<{ sales: Sale[], onAddSale: () => void, formatCurrency: (amount: number) => string }> = ({ sales, onAddSale, formatCurrency }) => {
    return (
        <DataTable
            title="Sales Log"
            headers={['Date', 'Type', 'Description', 'Details', 'Amount']}
            data={sales}
            onAdd={onAddSale}
            addButtonLabel="Add New Sale"
            renderRow={(item: Sale) => (
                <>
                    <td className="px-6 py-4">{new Date(new Date(item.date).valueOf() + new Date(item.date).getTimezoneOffset() * 60 * 1000).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${item.type === 'Product' ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-800 dark:text-blue-300' : 'bg-green-100 dark:bg-green-600/20 text-green-800 dark:text-green-300'}`}>{item.type}</span></td>
                    <td className="px-6 py-4">{item.description}</td>
                    <td className="px-6 py-4">{item.type === 'Product' ? `${item.quantity} units @ ${formatCurrency(item.unitPrice || 0)}` : item.serviceDetails}</td>
                    <td className="px-6 py-4 text-green-600 dark:text-green-400 font-semibold">{formatCurrency(item.amount)}</td>
                </>
            )}
        />
    )
};

const ExpensesPurchasesTab: FC<{ expenses: Expense[], purchases: Purchase[], onAddExpense: () => void, onAddPurchase: () => void, formatCurrency: (amount: number) => string }> = ({ expenses, purchases, onAddExpense, onAddPurchase, formatCurrency }) => {
    const [activeSubTab, setActiveSubTab] = useState<'expenses' | 'purchases'>('expenses');

    return (
        <div className="space-y-6">
             <div className="border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-6">
                     <TabButton label="Operating Expenses" isActive={activeSubTab === 'expenses'} onClick={() => setActiveSubTab('expenses')} />
                     <TabButton label="Raw Material Purchases" isActive={activeSubTab === 'purchases'} onClick={() => setActiveSubTab('purchases')} />
                </nav>
             </div>
             {activeSubTab === 'expenses' && (
                <DataTable
                    title="Operating Expenses"
                    headers={['Date', 'Category', 'Description', 'Amount']}
                    data={expenses}
                    onAdd={onAddExpense}
                    addButtonLabel="Add New Expense"
                    renderRow={(item: Expense) => (
                        <>
                            <td className="px-6 py-4">{new Date(new Date(item.date).valueOf() + new Date(item.date).getTimezoneOffset() * 60 * 1000).toLocaleDateString()}</td>
                            <td className="px-6 py-4"><span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2.5 py-1 text-xs font-medium rounded-md">{item.category}</span></td>
                            <td className="px-6 py-4">{item.description}</td>
                            <td className="px-6 py-4 text-red-600 dark:text-red-400 font-semibold">{formatCurrency(item.amount)}</td>
                        </>
                    )}
                />
             )}
             {activeSubTab === 'purchases' && (
                 <DataTable
                    title="Raw Material Purchases (COGS)"
                    headers={['Date', 'Item Name', 'Quantity', 'Unit Price', 'Total Cost']}
                    data={purchases}
                    onAdd={onAddPurchase}
                    addButtonLabel="Add New Purchase"
                    renderRow={(item: Purchase) => (
                        <>
                            <td className="px-6 py-4">{new Date(new Date(item.date).valueOf() + new Date(item.date).getTimezoneOffset() * 60 * 1000).toLocaleDateString()}</td>
                            <td className="px-6 py-4">{item.itemName}</td>
                            <td className="px-6 py-4">{item.quantity.toLocaleString()}</td>
                            <td className="px-6 py-4">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-6 py-4 text-orange-600 dark:text-orange-400 font-semibold">{formatCurrency(item.totalCost)}</td>
                        </>
                    )}
                />
             )}
        </div>
    )
};

const InvestmentsTab: FC<{ investments: Investment[], onAddInvestment: () => void, formatCurrency: (amount: number) => string }> = ({ investments, onAddInvestment, formatCurrency }) => {
    return (
        <DataTable
            title="Investments & Asset Purchases"
            headers={['Date', 'Type', 'Description', 'Amount']}
            data={investments}
            onAdd={onAddInvestment}
            addButtonLabel="Add New Entry"
            renderRow={(item: Investment) => (
                <>
                    <td className="px-6 py-4">{new Date(new Date(item.date).valueOf() + new Date(item.date).getTimezoneOffset() * 60 * 1000).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${item.type === 'Capital' ? 'bg-purple-100 dark:bg-purple-600/20 text-purple-800 dark:text-purple-300' : 'bg-yellow-100 dark:bg-yellow-600/20 text-yellow-800 dark:text-yellow-300'}`}>{item.type}</span></td>
                    <td className="px-6 py-4">{item.description}</td>
                    <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-semibold">{formatCurrency(item.amount)}</td>
                </>
            )}
        />
    )
};

const LeanCanvasTab: FC<{data: LeanCanvasState, onSave: (data: LeanCanvasState) => void, financialData: any, addToast: (msg: string, type: 'success' | 'error') => void, formatCurrency: (amount: number) => string}> = React.memo(({data, onSave, financialData, addToast, formatCurrency}) => {
    const [canvasState, setCanvasState] = useState(data);

    useEffect(() => {
        const timer = setTimeout(() => {
            onSave(canvasState);
        }, 1500); // Debounce saving
        return () => clearTimeout(timer);
    }, [canvasState, onSave]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setCanvasState(prev => ({...prev, [name]: value}));
    };
    
    const handleExportPDF = () => {
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Lean Canvas", 14, 22);

        let y = 35;
        const addSection = (title: string, content: string) => {
            if (!content.trim()) return;
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(title, 14, y);
            y += 7;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const lines = doc.splitTextToSize(content, 180);
            doc.text(lines, 14, y);
            y += (lines.length * 4.5) + 10;
        };

        const canvasSections = {
            "Problem": canvasState.problem,
            "Solution": canvasState.solution,
            "Key Metrics": canvasState.keyMetrics,
            "Unique Value Proposition": canvasState.uniqueValueProposition,
            "Unfair Advantage": canvasState.unfairAdvantage,
            "Channels": canvasState.channels,
            "Customer Segments": canvasState.customerSegments,
        };

        for (const [title, content] of Object.entries(canvasSections)) {
            addSection(title, content);
        }

        const costContent = `AUTO-CALCULATED:\n- Cost of Goods Sold: ${formatCurrency(financialData.totalPurchases)}\n- Operating Expenses: ${formatCurrency(financialData.totalOpEx)}\n\nNOTES:\n${canvasState.costStructureNotes}`;
        addSection("Cost Structure", costContent);

        const revenueContent = `AUTO-CALCULATED:\n- Gross Sales: ${formatCurrency(financialData.totalSales)}\n\nNOTES:\n${canvasState.revenueStreamsNotes}`;
        addSection("Revenue Streams", revenueContent);

        doc.save("keystone-lean-canvas.pdf");
        addToast('Lean Canvas exported as PDF!', 'success');
    };

    const handleExportWord = () => {
        const sections = {
            "Problem": canvasState.problem, "Solution": canvasState.solution, "Key Metrics": canvasState.keyMetrics,
            "Unique Value Proposition": canvasState.uniqueValueProposition, "Unfair Advantage": canvasState.unfairAdvantage,
            "Channels": canvasState.channels, "Customer Segments": canvasState.customerSegments,
        };
        const costContent = `<p><b>AUTO-CALCULATED:</b></p><ul><li>Cost of Goods Sold: ${formatCurrency(financialData.totalPurchases)}</li><li>Operating Expenses: ${formatCurrency(financialData.totalOpEx)}</li></ul><br/><p><b>NOTES:</b></p><p>${canvasState.costStructureNotes.replace(/\n/g, '<br/>')}</p>`;
        const revenueContent = `<p><b>AUTO-CALCULATED:</b></p><ul><li>Gross Sales: ${formatCurrency(financialData.totalSales)}</li></ul><br/><p><b>NOTES:</b></p><p>${canvasState.revenueStreamsNotes.replace(/\n/g, '<br/>')}</p>`;

        let htmlBody = `<h1>Lean Canvas</h1>`;
        for (const [title, content] of Object.entries(sections)) {
            htmlBody += `<h2>${title}</h2><p>${content.replace(/\n/g, '<br/>')}</p><br/>`;
        }
        htmlBody += `<h2>Cost Structure</h2><div>${costContent}</div><br/>`;
        htmlBody += `<h2>Revenue Streams</h2><div>${revenueContent}</div><br/>`;

        const htmlContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Lean Canvas</title></head><body>${htmlBody}</body></html>`;
        
        const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(htmlContent);
        const link = document.createElement("a");
        link.href = url;
        link.download = 'keystone-lean-canvas.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast('Lean Canvas exported as Word Doc!', 'success');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Interactive Lean Canvas</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Export PDF</button>
                    <button onClick={handleExportWord} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Export Word</button>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <CanvasBox title="Problem"><CanvasTextarea name="problem" value={canvasState.problem} onChange={handleChange} placeholder="List your top 1-3 problems." /></CanvasBox>
                    <CanvasBox title="Solution"><CanvasTextarea name="solution" value={canvasState.solution} onChange={handleChange} placeholder="Outline a possible solution for each problem." /></CanvasBox>
                </div>
                <div className="lg:col-span-1 space-y-4">
                    <CanvasBox title="Key Metrics"><CanvasTextarea name="keyMetrics" value={canvasState.keyMetrics} onChange={handleChange} placeholder="List the key numbers that tell you how your business is doing." /></CanvasBox>
                    <CanvasBox title="Unique Value Proposition" isTall><CanvasTextarea name="uniqueValueProposition" value={canvasState.uniqueValueProposition} onChange={handleChange} placeholder="Single, clear, compelling message that states why you are different and worth buying." /></CanvasBox>
                </div>
                 <div className="lg:col-span-2 space-y-4">
                    <CanvasBox title="Unfair Advantage"><CanvasTextarea name="unfairAdvantage" value={canvasState.unfairAdvantage} onChange={handleChange} placeholder="Something that can't be easily copied or bought." /></CanvasBox>
                    <CanvasBox title="Channels"><CanvasTextarea name="channels" value={canvasState.channels} onChange={handleChange} placeholder="List your path to customers (inbound or outbound)." /></CanvasBox>
                    <CanvasBox title="Customer Segments"><CanvasTextarea name="customerSegments" value={canvasState.customerSegments} onChange={handleChange} placeholder="List your target customers and users." /></CanvasBox>
                 </div>
                 <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CanvasBox title="Cost Structure">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md mb-2 text-sm text-gray-700 dark:text-gray-300">
                            <p><b>COGS:</b> {formatCurrency(financialData.totalPurchases)}</p>
                            <p><b>Operating Expenses:</b> {formatCurrency(financialData.totalOpEx)}</p>
                        </div>
                        <CanvasTextarea name="costStructureNotes" value={canvasState.costStructureNotes} onChange={handleChange} placeholder="Add notes on your fixed and variable costs." />
                    </CanvasBox>
                    <CanvasBox title="Revenue Streams">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md mb-2 text-sm text-gray-700 dark:text-gray-300">
                            <p><b>Gross Sales:</b> {formatCurrency(financialData.totalSales)}</p>
                        </div>
                        <CanvasTextarea name="revenueStreamsNotes" value={canvasState.revenueStreamsNotes} onChange={handleChange} placeholder="Add notes on your sources of revenue." />
                    </CanvasBox>
                 </div>
            </div>
        </div>
    );
});

// --- Reusable Components ---
const CanvasBox: FC<{title: string, children: React.ReactNode, isTall?: boolean}> = React.memo(({title, children, isTall}) => (
    <div className={`bg-white dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col ${isTall ? 'min-h-[400px]' : 'min-h-[200px]'}`}>
        <h4 className="font-bold text-purple-600 dark:text-purple-400 mb-2">{title}</h4>
        <div className="flex-grow flex flex-col">
            {children}
        </div>
    </div>
));
const CanvasTextarea: FC<{name: keyof LeanCanvasState, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder: string}> = ({ name, value, onChange, placeholder }) => (
    <textarea 
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-full flex-grow bg-transparent text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none resize-none text-sm"
    />
);
const TabButton: FC<{ label: string; isActive: boolean; onClick: () => void }> = React.memo(({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${isActive ? 'border-purple-500 text-purple-600 dark:text-purple-300' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}>{label}</button>
));
const StatCard: FC<{ title: string; value: string | number; formatCurrency?: (amount: number) => string; formatAsPercent?: boolean; isExpense?: boolean }> = React.memo(({ title, value, formatCurrency, formatAsPercent = false, isExpense = false }) => {
  let displayValue: string;
  const numValue = typeof value === 'number' ? value : 0;

  if (formatCurrency) {
      displayValue = formatCurrency(numValue);
  } else if (formatAsPercent) {
      displayValue = `${numValue.toFixed(1)}%`;
  } else {
      displayValue = typeof value === 'number' ? value.toLocaleString() : value;
  }

  const valueColor = isExpense ? 'text-red-600 dark:text-red-400' : (numValue < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white');

  return (
    <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className={`mt-1 text-3xl font-semibold ${valueColor}`}>{displayValue}</p>
    </div>
  );
});
const DataTable: FC<{ title: string, headers: string[], data: any[], onAdd?: () => void, addButtonLabel?: string, renderRow: (item: any) => React.ReactNode }> = React.memo(({ title, headers, data, onAdd, addButtonLabel = 'Add New', renderRow }) => (
    <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            {onAdd && <button onClick={onAdd} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-md shadow-purple-500/10">+ {addButtonLabel}</button>}
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/70">
                    <tr>{headers.map(h => <th key={h} scope="col" className="px-6 py-3">{h}</th>)}</tr>
                </thead>
                <tbody>
                    {data.length > 0 ? [...data].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item, index) => (
                        <tr key={item.id || index} className={`border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-black/10' : 'bg-gray-50/50 dark:bg-black/20'}`}>
                            {renderRow(item)}
                        </tr>
                    )) : (
                        <tr><td colSpan={headers.length} className="text-center py-8">No data available.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
));
const Modal: FC<{onClose: () => void, onSave: (data: any) => void, type: ModalType, currency: string}> = ({ onClose, onSave, type, currency }) => {
    const [formData, setFormData] = useState<any>({ type: type === 'addSale' ? 'Product' : (type === 'addInvestment' ? 'Capital' : '') });

     useEffect(() => {
        if (type === 'addSale' && formData.type === 'Product' && formData.quantity && formData.unitPrice) {
            const amount = parseFloat(formData.quantity) * parseFloat(formData.unitPrice);
            if (!isNaN(amount)) {
                setFormData(prev => ({...prev, amount: amount.toFixed(2) }));
            }
        }
        if (type === 'addPurchase' && formData.quantity && formData.unitPrice) {
             const totalCost = parseFloat(formData.quantity) * parseFloat(formData.unitPrice);
             if (!isNaN(totalCost)) {
                setFormData(prev => ({...prev, totalCost: totalCost.toFixed(2) }));
            }
        }
    }, [formData.quantity, formData.unitPrice, formData.type, type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    }
    
    const renderFormFields = () => {
        switch (type) {
            case 'addInvestment': return (
                <>
                    <FormField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleChange} required />
                    <FormField label="Investment Type" name="type" type="select" options={['Capital', 'Asset']} value={formData.type || 'Capital'} onChange={handleChange} required />
                    <FormField label="Description" name="description" placeholder="e.g., Personal Savings, Purchase of new office" value={formData.description || ''} onChange={handleChange} required />
                    <FormField label={`Amount (${currency})`} name="amount" type="number" value={formData.amount || ''} onChange={handleChange} required />
                </>
            );
            case 'addSale': return (
                 <>
                    <FormField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleChange} required />
                    <FormField label="Sale Type" name="type" type="select" options={['Product', 'Service']} value={formData.type || 'Product'} onChange={handleChange} required />
                    <FormField label="Description" name="description" placeholder="e.g., 10 units of Model X" value={formData.description || ''} onChange={handleChange} required />
                    {formData.type === 'Product' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FormField label="Quantity" name="quantity" type="number" value={formData.quantity || ''} onChange={handleChange} required />
                            <FormField label={`Unit Price (${currency})`} name="unitPrice" type="number" value={formData.unitPrice || ''} onChange={handleChange} required />
                            <FormField label={`Total Amount (${currency})`} name="amount" type="number" value={formData.amount || ''} onChange={() => {}} disabled />
                        </div>
                    ) : (
                         <>
                            <FormField label="Service Details / Quality" name="serviceDetails" placeholder="e.g., Premium consultation package" value={formData.serviceDetails || ''} onChange={handleChange} />
                            <FormField label={`Amount (${currency})`} name="amount" type="number" value={formData.amount || ''} onChange={handleChange} required />
                        </>
                    )}
                </>
            );
            case 'addExpense': return (
                 <>
                    <FormField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleChange} required />
                    <FormField label="Category" name="category" placeholder="e.g., Marketing, Utilities, Rent" value={formData.category || ''} onChange={handleChange} required />
                    <FormField label="Description" name="description" value={formData.description || ''} onChange={handleChange} required />
                    <FormField label={`Amount (${currency})`} name="amount" type="number" value={formData.amount || ''} onChange={handleChange} required />
                </>
            );
            case 'addPurchase': return (
                 <>
                    <FormField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleChange} required />
                    <FormField label="Item Name" name="itemName" placeholder="e.g., Fabric, Screws, Microchips" value={formData.itemName || ''} onChange={handleChange} required />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField label="Quantity" name="quantity" type="number" value={formData.quantity || ''} onChange={handleChange} required />
                        <FormField label={`Unit Price (${currency})`} name="unitPrice" type="number" value={formData.unitPrice || ''} onChange={handleChange} required />
                        <FormField label={`Total Cost (${currency})`} name="totalCost" type="number" value={formData.totalCost || ''} onChange={() => {}} disabled />
                    </div>
                </>
            );
            default: return null;
        }
    }
    
    const titles: {[key in NonNullable<ModalType>]: string} = {
        addInvestment: 'Add Investment / Asset',
        addSale: 'Add New Sale',
        addExpense: 'Add Operating Expense',
        addPurchase: 'Add Raw Material Purchase'
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-lg shadow-2xl shadow-purple-900/10 relative">
                <form onSubmit={handleSubmit} className="p-8">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pr-10">{titles[type!]}</h2>
                     <button type="button" onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                     <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">{renderFormFields()}</div>
                     <div className="mt-8 flex justify-end gap-4 border-t border-gray-200 dark:border-gray-800 pt-6">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2.5 px-5 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-5 rounded-lg transition-colors">Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
const FormField: FC<any> = ({ label, name, type = 'text', value, onChange, required, placeholder, disabled, options }) => {
     if (type === 'textarea') {
        return (
            <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</label>
                <textarea id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={3} className={formInputClasses}/>
            </div>
        )
    }
    if (type === 'select') {
        return (
            <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</label>
                <select id={name} name={name} value={value} onChange={onChange} required={required} className={formSelectClasses} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                    {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
        )
    }
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</label>
            <input id={name} name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} step={type === 'number' ? '0.01' : undefined} disabled={disabled} className={`${formInputClasses} disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed`}/>
        </div>
    )
}

export default StartupSuite;