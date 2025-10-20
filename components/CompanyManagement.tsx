import React, { useState, useEffect, useMemo, FC, useRef } from 'react';
import { ToastMessage } from './Dashboard';

// --- Type Definitions ---
type PayType = 'Monthly Salary' | 'Weekly Salary' | 'Hourly' | 'By Production';
interface Employee {
  id: number;
  name: string;
  role: string;
  payType: PayType;
  monthlySalary?: number;
  weeklySalary?: number;
  hourlyRate?: number;
  productionRate?: number; // per unit
}
interface Attendance {
    id: number;
    employeeId: number;
    date: string;
    hoursWorked: number;
}
interface Production {
    id: number;
    employeeId: number;
    date: string;
    unitsProduced: number;
}
interface BillItem {
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
}
interface Transaction {
  id: number;
  date: string;
  type: 'Sale' | 'Purchase' | 'Expense' | 'Payroll' | 'Payment';
  description: string;
  amount: number;
  customerId?: number;
  customerName?: string;
  supplierId?: number;
  supplierName?: string;
  items?: BillItem[];
  status?: 'Paid' | 'Unpaid';
}
interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
}
interface Supplier {
    id: number;
    name: string;
    email: string;
    phone: string;
}
interface RawMaterial {
  id: number;
  name: string;
  quantity: number;
  purchasePrice: number;
}
interface FinishedGood {
  id: number;
  name: string;
  quantity: number;
  price: number; // per unit
}
interface MarketingCampaign {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  cost: number;
}
interface CashBookEntry {
  id: number;
  date: string;
  description: string;
  type: 'in' | 'out';
  amount: number;
  balance: number;
}

type ModalType = 'addEmployee' | 'logAttendance' | 'logProduction' | 'addTransaction' | 'addStock' | 'addCampaign' | 'updateStock' | 'addCustomer' | 'viewLedger' | 'addSupplier' | 'viewSupplierLedger' | 'addCashEntry' | null;

const formInputClasses = "w-full rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 placeholder-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500";
const formSelectClasses = "w-full rounded-lg p-3 appearance-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 bg-white border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200";


// --- Utility for Local Storage ---
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

// --- Main Component ---
interface CompanyManagementProps {
  addToast: (message: string, type: ToastMessage['type']) => void;
  companyDetails: any;
}

const CompanyManagement: React.FC<CompanyManagementProps> = ({ addToast, companyDetails }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'cashbook' | 'customers' | 'suppliers' | 'hr' | 'inventory' | 'marketing' | 'reports'>('overview');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<any>(null); 
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

  const [employees, setEmployees] = useStickyState<Employee[]>([], 'keystone-employees-v3');
  const [attendance, setAttendance] = useStickyState<Attendance[]>([], 'keystone-attendance-v3');
  const [productions, setProductions] = useStickyState<Production[]>([], 'keystone-productions-v3');
  const [transactions, setTransactions] = useStickyState<Transaction[]>([], 'keystone-transactions-v6');
  const [customers, setCustomers] = useStickyState<Customer[]>([], 'keystone-customers-v1');
  const [suppliers, setSuppliers] = useStickyState<Supplier[]>([], 'keystone-suppliers-v1');
  const [rawMaterials, setRawMaterials] = useStickyState<RawMaterial[]>([], 'keystone-raw-materials-v4');
  const [finishedGoods, setFinishedGoods] = useStickyState<FinishedGood[]>([], 'keystone-finished-goods-v3');
  const [marketingCampaigns, setMarketingCampaigns] = useStickyState<MarketingCampaign[]>([], 'keystone-marketing-v1');
  const [cashBook, setCashBook] = useStickyState<CashBookEntry[]>([], 'keystone-cashbook-v1');

  const handleOpenModal = (type: ModalType, data: any = null) => {
    setModalData(data);
    setModalType(type);
  };
  const handleCloseModal = () => {
    setModalType(null);
    setModalData(null);
  };
  
  const generateBillPDF = (invoiceData: Transaction) => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    const billNo = `INV-${invoiceData.id.toString().slice(-6)}`;
    const billDate = new Date(new Date(invoiceData.date).valueOf() + new Date(invoiceData.date).getTimezoneOffset() * 60 * 1000).toLocaleDateString();

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 14, 22);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Keystone Inc.', 14, 32);
    
    doc.setFontSize(10);
    doc.text(`Bill No: ${billNo}`, 145, 22);
    doc.text(`Date: ${billDate}`, 145, 28);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 14, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceData.customerName || 'N/A', 14, 56);
    
    (doc as any).autoTable({
        startY: 70,
        head: [['Description', 'Quantity', 'Unit Price', 'Total']],
        body: invoiceData.items?.map(item => [
            item.itemName, 
            item.quantity.toLocaleString(), 
            formatCurrency(item.unitPrice), 
            formatCurrency(item.quantity * item.unitPrice)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [49, 46, 129] }
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', 145, finalY + 15);
    doc.text(formatCurrency(invoiceData.amount), 190, finalY + 15, { align: 'right' });

    doc.setFontSize(10);
    doc.text('Thank you for your business!', 14, doc.internal.pageSize.height - 10);
    
    doc.save(`${invoiceData.customerName?.replace(/\s/g, '_')}-invoice-${billNo}.pdf`);
  };

  const handleMarkAsPaid = (invoiceId: number) => {
      setTransactions(prev => prev.map(t => t.id === invoiceId ? { ...t, status: 'Paid' } : t));
      addToast('Bill marked as paid!', 'success');
  };

  const handleSave = (data: any) => {
    const timestamp = Date.now();
    switch (modalType) {
        case 'addEmployee':
            setEmployees(prev => [...prev, { ...data, id: timestamp }]);
            break;
        case 'addCustomer':
            setCustomers(prev => [...prev, { ...data, id: timestamp }]);
            break;
        case 'addSupplier':
            setSuppliers(prev => [...prev, { ...data, id: timestamp }]);
            break;
        case 'logAttendance':
            setAttendance(prev => [...prev, { ...data, id: timestamp, hoursWorked: parseFloat(data.hoursWorked) }]);
            break;
        case 'logProduction':
            setProductions(prev => [...prev, { ...data, id: timestamp, unitsProduced: parseFloat(data.unitsProduced) }]);
            break;
        case 'addCashEntry':
            const sortedCashBook = [...cashBook].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const lastBalance = sortedCashBook.length > 0 ? sortedCashBook[sortedCashBook.length - 1].balance : 0;
            const amount = parseFloat(data.amount);
            const newBalance = data.type === 'in' ? lastBalance + amount : lastBalance - amount;
            const newEntry: CashBookEntry = { ...data, id: timestamp, amount, balance: newBalance };
            setCashBook(prev => [...prev, newEntry]);
            break;
        case 'addTransaction':
            if (data.type === 'Sale') {
                const customer = customers.find(c => c.id === parseInt(data.customerId));
                const newInvoice: Transaction = {
                    ...data,
                    id: timestamp,
                    description: `Invoice for ${customer?.name || 'N/A'}`,
                    customerName: customer?.name,
                    status: 'Unpaid',
                };
                setTransactions(prev => [...prev, newInvoice]);
                
                setFinishedGoods(prevGoods => {
                    const goodsCopy = [...prevGoods];
                    newInvoice.items?.forEach(item => {
                        const productIndex = goodsCopy.findIndex(p => p.id === item.itemId);
                        if (productIndex !== -1) {
                            goodsCopy[productIndex].quantity -= item.quantity;
                        }
                    });
                    return goodsCopy;
                });

                generateBillPDF(newInvoice);
                addToast('Sales invoice created & PDF downloaded!', 'success');
            } else if (data.type === 'Purchase') {
                 const supplier = suppliers.find(s => s.id === parseInt(data.supplierId));
                 const newBill: Transaction = {
                    ...data,
                    id: timestamp,
                    description: `Purchase from ${supplier?.name || 'N/A'}`,
                    supplierName: supplier?.name,
                    status: 'Unpaid',
                 };
                 setTransactions(prev => [...prev, newBill]);
                 setRawMaterials(prevMats => {
                     const matsCopy = [...prevMats];
                     newBill.items?.forEach(item => {
                        const matIndex = matsCopy.findIndex(p => p.id === item.itemId);
                        if (matIndex !== -1) {
                            matsCopy[matIndex].quantity += item.quantity;
                        } else {
                            matsCopy.push({ id: item.itemId, name: item.itemName, quantity: item.quantity, purchasePrice: item.unitPrice });
                        }
                     });
                     return matsCopy;
                 });
                 addToast('Purchase bill created!', 'success');
            } else {
                 setTransactions(prev => [...prev, { ...data, id: timestamp, amount: parseFloat(data.amount) }]);
            }
            break;
        case 'addStock':
            if (data.stockType === 'raw') {
                setRawMaterials(prev => [...prev, { ...data, id: timestamp, quantity: parseFloat(data.quantity), purchasePrice: parseFloat(data.purchasePrice) }]);
            } else {
                setFinishedGoods(prev => [...prev, { ...data, id: timestamp, quantity: parseFloat(data.quantity), price: parseFloat(data.price) }]);
            }
            break;
        case 'addCampaign':
            setMarketingCampaigns(prev => [...prev, { ...data, id: timestamp, cost: parseFloat(data.cost) }]);
            break;
        case 'updateStock':
            setFinishedGoods(prev => prev.map(item => 
                item.id === parseInt(data.productId) 
                    ? { ...item, quantity: item.quantity + parseFloat(data.quantityToAdd) }
                    : item
            ));
            break;
    }
    addToast('Entry saved successfully!', 'success');
    handleCloseModal();
  };
  
  const overviewData = useMemo(() => {
    const revenue = transactions.filter(t => t.type === 'Sale').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type !== 'Sale').reduce((sum, t) => sum + t.amount, 0);
    const purchases = transactions.filter(t => t.type === 'Purchase').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = revenue - expenses;
    return { revenue, expenses, netProfit, purchases };
  }, [transactions]);

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return <OverviewTab overviewData={overviewData} transactions={transactions} finishedGoods={finishedGoods} formatCurrency={formatCurrency} companyDetails={companyDetails} addToast={addToast} />;
      case 'accounts': return <AccountsTab transactions={transactions} onOpenModal={handleOpenModal} formatCurrency={formatCurrency} />;
      case 'cashbook': return <CashBookTab cashBook={cashBook} onOpenModal={handleOpenModal} formatCurrency={formatCurrency} />;
      case 'customers': return <CustomersTab customers={customers} transactions={transactions} onOpenModal={handleOpenModal} formatCurrency={formatCurrency} />;
      case 'suppliers': return <SuppliersTab suppliers={suppliers} transactions={transactions} onOpenModal={handleOpenModal} formatCurrency={formatCurrency} />;
      case 'hr': return <HrTab employees={employees} onOpenModal={handleOpenModal} formatCurrency={formatCurrency} />;
      case 'inventory': return <InventoryTab rawMaterials={rawMaterials} finishedGoods={finishedGoods} onOpenModal={handleOpenModal} formatCurrency={formatCurrency} />;
      case 'marketing': return <MarketingTab campaigns={marketingCampaigns} onOpenModal={handleOpenModal} formatCurrency={formatCurrency} />;
      case 'reports': return <ReportsTab transactions={transactions} formatCurrency={formatCurrency} />;
      default: return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-1 animate-fade-in">
        <header className="mb-8">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Enterprise <span className="text-purple-500">Hub</span></h2>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">The central dashboard for your entire business operation.</p>
        </header>

        <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
                <TabButton label="Overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <TabButton label="Accounts" isActive={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} />
                <TabButton label="Cash Book" isActive={activeTab === 'cashbook'} onClick={() => setActiveTab('cashbook')} />
                <TabButton label="Customers" isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
                <TabButton label="Suppliers" isActive={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} />
                <TabButton label="Human Resources" isActive={activeTab === 'hr'} onClick={() => setActiveTab('hr')} />
                <TabButton label="Inventory" isActive={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
                <TabButton label="Marketing" isActive={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} />
                <TabButton label="Reports" isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
            </nav>
        </div>
        
        <div className="flex-grow">{renderContent()}</div>
        
        <DataSecurityNotice />

        {modalType && <Modal onClose={handleCloseModal} onSave={handleSave} onMarkAsPaid={handleMarkAsPaid} type={modalType} modalData={modalData} employees={employees} finishedGoods={finishedGoods} rawMaterials={rawMaterials} customers={customers} suppliers={suppliers} transactions={transactions} currency={currency} />}
    </div>
  );
};

// --- Tabs ---
const OverviewTab: FC<{ overviewData: any, transactions: Transaction[], finishedGoods: FinishedGood[], formatCurrency: (amount: number) => string, companyDetails: any, addToast: (message: string, type: ToastMessage['type']) => void }> = ({ overviewData, transactions, finishedGoods, formatCurrency, companyDetails, addToast }) => {
    const chartData = useMemo(() => {
        const sorted = [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const labels = [...new Set(sorted.map(t => new Date(new Date(t.date).valueOf() + new Date(t.date).getTimezoneOffset() * 60 * 1000).toLocaleDateString()))];
        
        const revenueByDate = new Map<string, number>();
        const expensesByDate = new Map<string, number>();

        sorted.forEach(t => {
             const dateStr = new Date(new Date(t.date).valueOf() + new Date(t.date).getTimezoneOffset() * 60 * 1000).toLocaleDateString();
             if(t.type === 'Sale') {
                 revenueByDate.set(dateStr, (revenueByDate.get(dateStr) || 0) + t.amount);
             } else {
                 expensesByDate.set(dateStr, (expensesByDate.get(dateStr) || 0) + t.amount);
             }
        });

        return {
            labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: labels.map(l => revenueByDate.get(l) || 0),
                    borderColor: '#a78bfa',
                    backgroundColor: 'rgba(167, 139, 250, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Expenses',
                    data: labels.map(l => expensesByDate.get(l) || 0),
                    borderColor: '#f87171',
                    backgroundColor: 'rgba(248, 113, 113, 0.2)',
                    fill: true,
                    tension: 0.4,
                }
            ]
        }
    }, [transactions]);
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value={overviewData.revenue} icon="revenue" formatCurrency={formatCurrency} />
                <StatCard title="Total Expenses" value={overviewData.expenses} icon="expense" formatCurrency={formatCurrency} isExpense />
                <StatCard title="Net Profit / Loss" value={overviewData.netProfit} icon="profit" formatCurrency={formatCurrency} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Financial Performance</h3>
                  <div className="h-80">
                      <ChartComponent data={chartData} />
                  </div>
              </div>
              <div className="space-y-6">
                <CompanyProfileCard companyDetails={companyDetails} addToast={addToast} />
                <DataTable
                    title="Available Stock"
                    headers={['Product', 'Qty']}
                    data={finishedGoods}
                    renderRow={(item: FinishedGood) => (
                        <>
                            <td className="px-6 py-4">{item.name}</td>
                            <td className="px-6 py-4 font-semibold text-right">{item.quantity.toLocaleString()}</td>
                        </>
                    )}
                    compact
                />
              </div>
            </div>
        </div>
    );
};
const AccountsTab: FC<{ transactions: Transaction[], onOpenModal: (type: ModalType) => void, formatCurrency: (amount: number) => string }> = ({ transactions, onOpenModal, formatCurrency }) => (
    <DataTable
        title="Accounts Ledger"
        headers={['Date', 'Type', 'Description', 'Amount', 'Status']}
        data={transactions}
        onAdd={() => onOpenModal('addTransaction')}
        addButtonLabel="Add Transaction"
        renderRow={(item: Transaction) => (
            <>
                <td className="px-6 py-4">{new Date(new Date(item.date).valueOf() + new Date(item.date).getTimezoneOffset() * 60 * 1000).toLocaleDateString()}</td>
                <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    item.type === 'Sale' ? 'bg-green-100 dark:bg-green-600/20 text-green-800 dark:text-green-300' :
                    item.type === 'Purchase' ? 'bg-yellow-100 dark:bg-yellow-600/20 text-yellow-800 dark:text-yellow-300' :
                    'bg-red-100 dark:bg-red-600/20 text-red-800 dark:text-red-300'
                }`}>{item.type}</span></td>
                <td className="px-6 py-4">{item.description}</td>
                <td className={`px-6 py-4 font-semibold ${item.type === 'Sale' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {`${item.type === 'Sale' ? '+' : '-'}${formatCurrency(item.amount)}`}
                </td>
                <td className="px-6 py-4">
                    {(item.type === 'Sale' || item.type === 'Purchase') && (
                         <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${item.status === 'Paid' ? 'bg-green-100 dark:bg-green-600/20 text-green-800 dark:text-green-300' : 'bg-orange-100 dark:bg-orange-600/20 text-orange-800 dark:text-orange-300'}`}>
                            {item.status}
                        </span>
                    )}
                </td>
            </>
        )}
    />
);
const CashBookTab: FC<{ cashBook: CashBookEntry[], onOpenModal: (type: ModalType) => void, formatCurrency: (amount: number) => string }> = ({ cashBook, onOpenModal, formatCurrency }) => {
    return (
        <DataTable
            title="Cash Book"
            headers={['Date', 'Description', 'Cash In', 'Cash Out', 'Balance']}
            data={cashBook}
            onAdd={() => onOpenModal('addCashEntry')}
            addButtonLabel="Add Entry"
            renderRow={(item: CashBookEntry) => (
                <>
                    <td className="px-6 py-4">{new Date(new Date(item.date).valueOf() + new Date(item.date).getTimezoneOffset() * 60 * 1000).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{item.description}</td>
                    <td className="px-6 py-4 text-green-600 dark:text-green-400 font-semibold">{item.type === 'in' ? formatCurrency(item.amount) : '-'}</td>
                    <td className="px-6 py-4 text-red-600 dark:text-red-400 font-semibold">{item.type === 'out' ? formatCurrency(item.amount) : '-'}</td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(item.balance)}</td>
                </>
            )}
        />
    );
};
const CustomersTab: FC<{ customers: Customer[], transactions: Transaction[], onOpenModal: (type: ModalType, data?: any) => void, formatCurrency: (amount: number) => string }> = ({ customers, transactions, onOpenModal, formatCurrency }) => {
    const customerBalances = useMemo(() => {
        const balances = new Map<number, number>();
        transactions.forEach(t => {
            if (t.type === 'Sale' && t.status === 'Unpaid' && t.customerId) {
                balances.set(t.customerId, (balances.get(t.customerId) || 0) + t.amount);
            }
        });
        return balances;
    }, [transactions]);

    return (
        <DataTable
            title="Customer Directory"
            headers={['Name', 'Email & Phone', 'Outstanding Balance', 'Actions']}
            data={customers}
            onAdd={() => onOpenModal('addCustomer')}
            addButtonLabel="Add Customer"
            renderRow={(item: Customer) => {
                const balance = customerBalances.get(item.id) || 0;
                return (
                    <>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{item.name}</td>
                        <td className="px-6 py-4"><div>{item.email}</div><div className="text-gray-500 dark:text-gray-500 text-xs">{item.phone}</div></td>
                        <td className={`px-6 py-4 font-semibold ${balance > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {formatCurrency(balance)}
                        </td>
                        <td className="px-6 py-4">
                            <button onClick={() => onOpenModal('viewLedger', { customer: item })} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-semibold">View Ledger</button>
                        </td>
                    </>
                );
            }}
        />
    );
};
const SuppliersTab: FC<{ suppliers: Supplier[], transactions: Transaction[], onOpenModal: (type: ModalType, data?: any) => void, formatCurrency: (amount: number) => string }> = ({ suppliers, transactions, onOpenModal, formatCurrency }) => {
    const supplierBalances = useMemo(() => {
        const balances = new Map<number, number>();
        transactions.forEach(t => {
            if (t.type === 'Purchase' && t.status === 'Unpaid' && t.supplierId) {
                balances.set(t.supplierId, (balances.get(t.supplierId) || 0) + t.amount);
            }
        });
        return balances;
    }, [transactions]);

    return (
        <DataTable
            title="Supplier Directory"
            headers={['Name', 'Email & Phone', 'Amount Payable', 'Actions']}
            data={suppliers}
            onAdd={() => onOpenModal('addSupplier')}
            addButtonLabel="Add Supplier"
            renderRow={(item: Supplier) => {
                const balance = supplierBalances.get(item.id) || 0;
                return (
                     <>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{item.name}</td>
                        <td className="px-6 py-4"><div>{item.email}</div><div className="text-gray-500 dark:text-gray-500 text-xs">{item.phone}</div></td>
                        <td className={`px-6 py-4 font-semibold ${balance > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {formatCurrency(balance)}
                        </td>
                        <td className="px-6 py-4">
                            <button onClick={() => onOpenModal('viewSupplierLedger', { supplier: item })} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-semibold">View Ledger</button>
                        </td>
                    </>
                );
            }}
        />
    );
};
const HrTab: FC<{ employees: Employee[], onOpenModal: (type: ModalType, data?: any) => void, formatCurrency: (amount: number) => string }> = ({ employees, onOpenModal, formatCurrency }) => (
    <div className="space-y-6">
        <DataTable
            title="Employee Directory"
            headers={['Name', 'Role', 'Pay Type', 'Rate/Salary']}
            data={employees}
            onAdd={() => onOpenModal('addEmployee')}
            addButtonLabel="Add Employee"
            renderRow={(item: Employee) => {
                let payDetail = '-';
                switch (item.payType) {
                    case 'Monthly Salary': payDetail = `${formatCurrency(item.monthlySalary || 0)}/mo`; break;
                    case 'Weekly Salary': payDetail = `${formatCurrency(item.weeklySalary || 0)}/wk`; break;
                    case 'Hourly': payDetail = `${formatCurrency(item.hourlyRate || 0)}/hr`; break;
                    case 'By Production': payDetail = `${formatCurrency(item.productionRate || 0)}/unit`; break;
                }
                return (
                    <>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{item.name}</td>
                        <td className="px-6 py-4">{item.role}</td>
                        <td className="px-6 py-4">{item.payType}</td>
                        <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">{payDetail}</td>
                    </>
                );
            }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => onOpenModal('logAttendance')} className="w-full bg-white dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/60 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-bold py-4 px-6 rounded-lg transition-colors text-left">
                <h3 className="text-lg font-bold">Log Attendance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Record hours worked for hourly employees.</p>
            </button>
            <button onClick={() => onOpenModal('logProduction')} className="w-full bg-white dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/60 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-bold py-4 px-6 rounded-lg transition-colors text-left">
                <h3 className="text-lg font-bold">Log Production</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Record units produced for piece-rate employees.</p>
            </button>
        </div>
    </div>
);
const InventoryTab: FC<{ rawMaterials: RawMaterial[], finishedGoods: FinishedGood[], onOpenModal: (type: ModalType, data?: any) => void, formatCurrency: (amount: number) => string }> = ({ rawMaterials, finishedGoods, onOpenModal, formatCurrency }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable 
            title="Raw Materials" 
            headers={['Item Name', 'Quantity', 'Purchase Price']} 
            data={rawMaterials} 
            onAdd={() => onOpenModal('addStock', {stockType: 'raw'})} 
            addButtonLabel="Add Material" 
            renderRow={(item: RawMaterial) => (
                <>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{item.name}</td>
                    <td className="px-6 py-4">{item.quantity.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(item.purchasePrice || 0)}</td>
                </>
            )} />
        <DataTable 
            title="Finished Goods" 
            headers={['Product Name', 'Quantity', 'Sale Price']} 
            data={finishedGoods} 
            onAdd={() => onOpenModal('addStock', {stockType: 'finished'})} 
            addButtonLabel="Add Product"
            headerActions={
                <button onClick={() => onOpenModal('updateStock')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Update Quantity</button>
            }
            renderRow={(item: FinishedGood) => (
            <>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{item.name}</td>
                <td className="px-6 py-4">{item.quantity.toLocaleString()}</td>
                <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">{formatCurrency(item.price)}</td>
            </>
        )} />
    </div>
);
const MarketingTab: FC<{ campaigns: MarketingCampaign[], onOpenModal: (type: ModalType) => void, formatCurrency: (amount: number) => string }> = ({ campaigns, onOpenModal, formatCurrency }) => (
    <DataTable
        title="Marketing Campaigns"
        headers={['Campaign Name', 'Date Range', 'Cost']}
        data={campaigns}
        onAdd={() => onOpenModal('addCampaign')}
        addButtonLabel="Add Campaign"
        renderRow={(item: MarketingCampaign) => (
            <>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{item.name}</td>
                <td className="px-6 py-4">{new Date(new Date(item.startDate).valueOf() + new Date(item.startDate).getTimezoneOffset() * 60 * 1000).toLocaleDateString()} - {new Date(new Date(item.endDate).valueOf() + new Date(item.endDate).getTimezoneOffset() * 60 * 1000).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-red-600 dark:text-red-400 font-semibold">{formatCurrency(item.cost)}</td>
            </>
        )}
    />
);

const ReportsTab: FC<{ transactions: Transaction[], formatCurrency: (amount: number) => string }> = ({ transactions, formatCurrency }) => {
    const pnlData = useMemo(() => {
        const revenue = transactions.filter(t => t.type === 'Sale').reduce((sum, t) => sum + t.amount, 0);
        const cogs = transactions.filter(t => t.type === 'Purchase').reduce((sum, t) => sum + t.amount, 0);
        const grossProfit = revenue - cogs;
        const opEx = transactions.filter(t => t.type === 'Expense' || t.type === 'Payroll').reduce((sum, t) => sum + t.amount, 0);
        const netIncome = grossProfit - opEx;
        return { revenue, cogs, grossProfit, opEx, netIncome };
    }, [transactions]);

    return (
         <div className="bg-white dark:bg-gray-900/50 p-8 rounded-xl border border-gray-200 dark:border-gray-800 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Profit & Loss Statement</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 font-medium">
                <ReportRow label="Total Revenue" value={formatCurrency(pnlData.revenue)} />
                <ReportRow label="Cost of Goods Sold (COGS)" value={`(${formatCurrency(pnlData.cogs)})`} isSubtractor />
                <hr className="border-gray-200 dark:border-gray-700 my-3" />
                <ReportRow label="Gross Profit" value={formatCurrency(pnlData.grossProfit)} isBold />
                <hr className="border-gray-200 dark:border-gray-700 my-3" />
                <ReportRow label="Operating Expenses" value={`(${formatCurrency(pnlData.opEx)})`} isSubtractor />
                 <hr className="border-t-2 border-gray-300 dark:border-gray-600 my-3" />
                <ReportRow label="Net Income" value={formatCurrency(pnlData.netIncome)} isBold isFinal />
            </div>
        </div>
    );
};


// --- Reusable Components ---
const DataSecurityNotice: FC = React.memo(() => (
    <div className="mt-4 p-3 bg-green-50 dark:bg-gray-900/60 border border-green-200 dark:border-gray-800 rounded-lg text-center text-xs text-green-800 dark:text-green-400/80 flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
        </svg>
        <span>All your company data is end-to-end protected and stored only on your local device.</span>
    </div>
));
const CompanyProfileCard: FC<{ companyDetails: any, addToast: (message: string, type: ToastMessage['type']) => void }> = React.memo(({ companyDetails, addToast }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const updatedDetails = { ...companyDetails, logo: base64String };
                localStorage.setItem('companyDetails', JSON.stringify(updatedDetails));
                window.dispatchEvent(new CustomEvent('companyDetailsChanged'));
                addToast('Company logo updated!', 'success');
            };
            reader.readAsDataURL(file);
        } else if (file) {
            addToast('Please select a valid image file.', 'error');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Company Profile</h3>
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    {companyDetails?.logo ? (
                        <img src={companyDetails.logo} alt="Company Logo" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    )}
                </div>
                <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{companyDetails?.businessName}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{companyDetails?.email}</p>
                    <button onClick={handleUploadClick} className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold mt-2 transition-colors">
                        {companyDetails?.logo ? 'Change logo' : 'Upload logo'}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
            </div>
        </div>
    );
});
const ChartComponent: FC<{ data: any }> = React.memo(({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (chartRef.current && (window as any).Chart) {
      const isDarkMode = document.documentElement.classList.contains('dark');
      const textColor = isDarkMode ? '#9CA3AF' : '#6B7280';
      const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
      const legendColor = isDarkMode ? '#D1D5DB' : '#374151';

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        chartInstance.current = new (window as any).Chart(ctx, {
          type: 'line',
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                y: { ticks: { color: textColor }, grid: { color: gridColor } }
            },
            plugins: { legend: { labels: { color: legendColor } } }
          }
        });
      }
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef}></canvas>;
});
const ReportRow: FC<{label: string, value: string, isBold?: boolean, isSubtractor?: boolean, isFinal?: boolean}> = React.memo(({label, value, isBold, isSubtractor, isFinal}) => (
    <div className={`flex justify-between items-center py-1 ${isBold ? 'font-bold' : ''} ${isFinal ? 'text-lg' : ''}`}>
        <span>{label}</span>
        <span className={`${isSubtractor ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'} font-mono`}>{value}</span>
    </div>
));
const StatCard: FC<{ title: string; value: string | number; formatCurrency?: (amount: number) => string; isExpense?: boolean, icon: 'revenue' | 'expense' | 'profit' }> = React.memo(({ title, value, formatCurrency, isExpense = false, icon }) => {
  const displayValue = formatCurrency ? formatCurrency(Number(value)) : value;
  const numValue = typeof value === 'number' ? value : 0;
  const valueColor = isExpense ? 'text-red-600 dark:text-red-400' : (numValue < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white');
  const icons = {
    revenue: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    expense: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>,
    profit: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>,
  };
  return (
    <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 flex items-start justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className={`mt-2 text-3xl font-semibold ${valueColor}`}>{displayValue}</p>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full text-purple-500 dark:text-purple-400">
        {icons[icon]}
      </div>
    </div>
  );
});
const TabButton: FC<{ label: string; isActive: boolean; onClick: () => void }> = React.memo(({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${isActive ? 'border-purple-500 text-purple-600 dark:text-purple-300' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}>{label}</button>
));
const DataTable: FC<{ title: string, headers: string[], data: any[], onAdd?: () => void, addButtonLabel?: string, renderRow: (item: any) => React.ReactNode, headerActions?: React.ReactNode, compact?: boolean }> = React.memo(({ title, headers, data, onAdd, addButtonLabel = 'Add New', renderRow, headerActions, compact = false }) => (
    <div className={`bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 ${!compact ? 'h-full flex flex-col' : ''}`}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <div className="flex items-center gap-2">
                {headerActions}
                {onAdd && <button onClick={onAdd} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-md shadow-purple-500/10">+ {addButtonLabel}</button>}
            </div>
        </div>
        <div className={`overflow-x-auto ${!compact ? 'flex-grow' : ''}`}>
            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/70">
                    <tr>{headers.map(h => <th key={h} scope="col" className="px-6 py-3">{h}</th>)}</tr>
                </thead>
                <tbody>
                    {data.length > 0 ? [...data].sort((a, b) => (b.date && a.date) ? new Date(b.date).getTime() - new Date(a.date).getTime() : 0).map((item, index) => (
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
const Modal: FC<{onClose: () => void, onSave: (data: any) => void, type: ModalType, modalData: any, employees: Employee[], finishedGoods: FinishedGood[], rawMaterials: RawMaterial[], customers: Customer[], suppliers: Supplier[], transactions: Transaction[], onMarkAsPaid: (id: number) => void, currency: string}> = ({ onClose, onSave, type, modalData, employees, finishedGoods, rawMaterials, customers, suppliers, transactions, onMarkAsPaid, currency }) => {
    const [formData, setFormData] = useState<any>(modalData || { type: 'Expense', items: [] });
    
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({...prev, [name]: value}));
    };

    useEffect(() => {
        if (formData.type === 'Sale' || formData.type === 'Purchase') {
            const total = formData.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0) || 0;
            setFormData((prev: any) => ({ ...prev, amount: total }));
        }
    }, [formData.items, formData.type]);
    
    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        if (field === 'itemId') {
            if (formData.type === 'Sale') {
                const product = finishedGoods.find(p => p.id === parseInt(value));
                newItems[index].itemName = product?.name || '';
                newItems[index].unitPrice = product?.price || 0;
            } else if (formData.type === 'Purchase') {
                const material = rawMaterials.find(m => m.id === parseInt(value));
                newItems[index].itemName = material?.name || '';
                newItems[index].unitPrice = material?.purchasePrice || 0;
            }
        }
        setFormData((prev: any) => ({ ...prev, items: newItems }));
    };
    const addItem = () => setFormData((prev: any) => ({ ...prev, items: [...prev.items, { itemId: '', quantity: 1, unitPrice: 0 }] }));
    const removeItem = (index: number) => setFormData((prev: any) => ({ ...prev, items: prev.items.filter((_: any, i: number) => i !== index) }));

    const getModalTitle = (): string => {
        switch (type) {
            case 'addEmployee': return 'Add New Employee';
            case 'addCustomer': return 'Add New Customer';
            case 'addSupplier': return 'Add New Supplier';
            case 'addCashEntry': return 'Add Cash Book Entry';
            case 'logAttendance': return 'Log Employee Attendance';
            case 'logProduction': return 'Log Employee Production';
            case 'addTransaction': 
                if (formData.type === 'Sale') return 'Create Sales Invoice';
                if (formData.type === 'Purchase') return 'Create Purchase Bill';
                return 'Add New Transaction';
            case 'addStock': return modalData?.stockType === 'raw' ? 'Add Raw Material' : 'Add Finished Good';
            case 'addCampaign': return 'Add Marketing Campaign';
            case 'updateStock': return 'Update Stock Quantity';
            case 'viewLedger': return `Ledger for ${modalData?.customer?.name}`;
            case 'viewSupplierLedger': return `Ledger for ${modalData?.supplier?.name}`;
            default: return 'New Entry';
        }
    };

    const renderFormFields = () => {
        switch (type) {
            case 'addEmployee': return (<>
                <FormField label="Full Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                <FormField label="Role / Position" name="role" value={formData.role || ''} onChange={handleChange} required />
                <FormField label="Pay Type" name="payType" type="select" options={['Monthly Salary', 'Weekly Salary', 'Hourly', 'By Production']} value={formData.payType || ''} onChange={handleChange} required />
                {formData.payType === 'Monthly Salary' && <FormField label={`Monthly Salary (${currency})`} name="monthlySalary" type="number" value={formData.monthlySalary || ''} onChange={handleChange} required />}
                {formData.payType === 'Weekly Salary' && <FormField label={`Weekly Salary (${currency})`} name="weeklySalary" type="number" value={formData.weeklySalary || ''} onChange={handleChange} required />}
                {formData.payType === 'Hourly' && <FormField label={`Hourly Rate (${currency})`} name="hourlyRate" type="number" value={formData.hourlyRate || ''} onChange={handleChange} required />}
                {formData.payType === 'By Production' && <FormField label={`Rate per Unit (${currency})`} name="productionRate" type="number" value={formData.productionRate || ''} onChange={handleChange} required />}
            </>);
            case 'addCustomer':
            case 'addSupplier':
            return (<>
                <FormField label="Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                <FormField label="Email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required />
                <FormField label="Phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} required />
            </>);
            case 'addCashEntry': return (<>
                 <FormField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleChange} required />
                 <FormField label="Description" name="description" placeholder="e.g., Cash sale, Petty cash for supplies" value={formData.description || ''} onChange={handleChange} required />
                 <FormField label="Type" name="type" type="select" options={[{value: 'in', label: 'Cash In'}, {value: 'out', label: 'Cash Out'}]} value={formData.type || 'in'} onChange={handleChange} required />
                 <FormField label={`Amount (${currency})`} name="amount" type="number" value={formData.amount || ''} onChange={handleChange} required />
            </>);
            case 'logAttendance': return (<>
                <FormField label="Employee" name="employeeId" type="select" options={employees.filter(e => e.payType === 'Hourly').map(e => ({ value: e.id, label: e.name }))} value={formData.employeeId || ''} onChange={handleChange} required />
                <FormField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleChange} required />
                <FormField label="Hours Worked" name="hoursWorked" type="number" value={formData.hoursWorked || ''} onChange={handleChange} required />
            </>);
            case 'logProduction': return (<>
                <FormField label="Employee" name="employeeId" type="select" options={employees.filter(e => e.payType === 'By Production').map(e => ({ value: e.id, label: e.name }))} value={formData.employeeId || ''} onChange={handleChange} required />
                <FormField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleChange} required />
                <FormField label="Units Produced" name="unitsProduced" type="number" value={formData.unitsProduced || ''} onChange={handleChange} required />
            </>);
            case 'addTransaction': return (<>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleChange} required />
                  <FormField label="Transaction Type" name="type" type="select" options={['Sale', 'Purchase', 'Expense']} value={formData.type || ''} onChange={handleChange} required />
                </div>
                {formData.type === 'Sale' || formData.type === 'Purchase' ? (<>
                    {formData.type === 'Sale' && <FormField label="Customer" name="customerId" type="select" options={customers.map(c => ({value: c.id, label: c.name}))} value={formData.customerId || ''} onChange={handleChange} required />}
                    {formData.type === 'Purchase' && <FormField label="Supplier" name="supplierId" type="select" options={suppliers.map(c => ({value: c.id, label: c.name}))} value={formData.supplierId || ''} onChange={handleChange} required />}
                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2 border-t border-gray-200 dark:border-gray-700 pt-4">Items</h4>
                    {formData.items.map((item: any, index: number) => {
                        const itemOptions = formData.type === 'Sale' ? finishedGoods : rawMaterials;
                        return (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center mb-2">
                               <div className="col-span-5"><FormField type="select" options={itemOptions.map(p => ({value: p.id, label: p.name}))} value={item.itemId} onChange={(e: any) => handleItemChange(index, 'itemId', e.target.value)} /></div>
                               <div className="col-span-2"><FormField type="number" value={item.quantity} onChange={(e: any) => handleItemChange(index, 'quantity', parseFloat(e.target.value))} /></div>
                               <div className="col-span-2"><FormField type="number" value={item.unitPrice} disabled /></div>
                               <div className="col-span-2 font-semibold text-right pr-2 text-gray-800 dark:text-gray-200">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(item.quantity * item.unitPrice)}</div>
                               <div className="col-span-1"><button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-400">&times;</button></div>
                            </div>
                        )
                    })}
                    <button type="button" onClick={addItem} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-semibold mt-2">+ Add Item</button>
                    <div className="text-right mt-4 font-bold text-xl text-gray-900 dark:text-white">Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(formData.amount)}</div>
                </>) : (<>
                    <FormField label="Description" name="description" placeholder="e.g., Office utilities" value={formData.description || ''} onChange={handleChange} required />
                    <FormField label={`Amount (${currency})`} name="amount" type="number" value={formData.amount || ''} onChange={handleChange} required />
                </>)}
            </>);
             case 'addStock': return (<>
                <FormField label={modalData?.stockType === 'raw' ? 'Material Name' : 'Product Name'} name="name" value={formData.name || ''} onChange={handleChange} required />
                <FormField label="Initial Quantity" name="quantity" type="number" value={formData.quantity || ''} onChange={handleChange} required />
                {modalData?.stockType === 'raw' && <FormField label={`Purchase Price per Unit (${currency})`} name="purchasePrice" type="number" value={formData.purchasePrice || ''} onChange={handleChange} required />}
                {modalData?.stockType === 'finished' && <FormField label={`Price per Unit (${currency})`} name="price" type="number" value={formData.price || ''} onChange={handleChange} required />}
            </>);
            case 'addCampaign': return (<>
                 <FormField label="Campaign Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField label="Start Date" name="startDate" type="date" value={formData.startDate || ''} onChange={handleChange} required />
                    <FormField label="End Date" name="endDate" type="date" value={formData.endDate || ''} onChange={handleChange} required />
                 </div>
                 <FormField label={`Cost (${currency})`} name="cost" type="number" value={formData.cost || ''} onChange={handleChange} required />
            </>);
            case 'updateStock': return (<>
                <FormField label="Product" name="productId" type="select" options={finishedGoods.map(p => ({ value: p.id, label: p.name }))} value={formData.productId || ''} onChange={handleChange} required />
                <FormField label="Quantity to Add" name="quantityToAdd" type="number" placeholder="e.g., 100" value={formData.quantityToAdd || ''} onChange={handleChange} required />
            </>);
            case 'viewLedger': 
                const customerTransactions = transactions.filter(t => t.customerId === modalData.customer.id && t.type === 'Sale');
                return <LedgerTable transactions={customerTransactions} onMarkAsPaid={onMarkAsPaid} isCustomer={true} formatCurrency={(amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)} />;
            case 'viewSupplierLedger':
                const supplierTransactions = transactions.filter(t => t.supplierId === modalData.supplier.id && t.type === 'Purchase');
                return <LedgerTable transactions={supplierTransactions} onMarkAsPaid={onMarkAsPaid} isCustomer={false} formatCurrency={(amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)} />;
            default: return null;
        }
    }

    const isFormModal = !['viewLedger', 'viewSupplierLedger'].includes(type || '');

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-2xl shadow-2xl shadow-purple-900/10 relative">
                <form onSubmit={handleSubmit} className="p-8">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pr-10">{getModalTitle()}</h2>
                     <button type="button" onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                     <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">{renderFormFields()}</div>
                     <div className="mt-8 flex justify-end gap-4 border-t border-gray-200 dark:border-gray-800 pt-6">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2.5 px-5 rounded-lg transition-colors">Close</button>
                        {isFormModal && <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-5 rounded-lg transition-colors">Save</button>}
                    </div>
                </form>
            </div>
        </div>
    )
}
const LedgerTable: FC<{transactions: Transaction[], onMarkAsPaid: (id: number) => void, isCustomer: boolean, formatCurrency: (amount: number) => string}> = ({transactions, onMarkAsPaid, isCustomer, formatCurrency}) => (
     <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
                <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">{isCustomer ? 'Invoice #' : 'Bill #'}</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map(t => (
                    <tr key={t.id} className="border-b dark:border-gray-800">
                        <td className="px-4 py-3">{new Date(new Date(t.date).valueOf() + new Date(t.date).getTimezoneOffset() * 60 * 1000).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-mono">{isCustomer ? 'INV-' : 'BILL-'}{t.id.toString().slice(-6)}</td>
                        <td className="px-4 py-3 font-semibold">{formatCurrency(t.amount)}</td>
                        <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${t.status === 'Paid' ? 'bg-green-100 dark:bg-green-600/20 text-green-800 dark:text-green-300' : 'bg-orange-100 dark:bg-orange-600/20 text-orange-800 dark:text-orange-300'}`}>{t.status}</span>
                        </td>
                        <td className="px-4 py-3">
                            {t.status === 'Unpaid' && <button onClick={() => onMarkAsPaid(t.id)} className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-xs font-bold">Mark as Paid</button>}
                        </td>
                    </tr>
                ))}
                {transactions.length === 0 && <tr><td colSpan={5} className="text-center py-6">No bills for this {isCustomer ? 'customer' : 'supplier'}.</td></tr>}
            </tbody>
        </table>
    </div>
);
const FormField: FC<any> = ({ label, name, type = 'text', value, onChange, required, options, placeholder, disabled }) => {
    if (type === 'select') {
        return (
            <div>
                {label && <label htmlFor={name} className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</label>}
                <select id={name} name={name} value={value} onChange={onChange} required={required} className={formSelectClasses} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                    <option value="" disabled>Select...</option>
                    {options.map((opt: any) => <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>)}
                </select>
            </div>
        )
    }
    return (
        <div>
            {label && <label htmlFor={name} className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</label>}
            <input id={name} name={name} type={type} value={value} onChange={onChange} required={required} step={type === 'number' ? '0.01' : undefined} placeholder={placeholder} disabled={disabled} className={`${formInputClasses} disabled:bg-gray-100 dark:disabled:bg-gray-800`}/>
        </div>
    )
}

export default CompanyManagement;