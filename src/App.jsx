import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/Layout/BottomNav';

// Lazy load pages for performance
const DashboardPage = React.lazy(() => import('./components/Dashboard/DashboardPage').catch(() => ({ default: () => <div className="page">Dashboard Content (Stub)</div> })));
const ExpensesPage = React.lazy(() => import('./components/Expenses/ExpensesPage').catch(() => ({ default: () => <div className="page">Expenses Content (Stub)</div> })));
const AddExpensePage = React.lazy(() => import('./components/AddExpense/AddExpensePage').catch(() => ({ default: () => <div className="page">Add Expense Content (Stub)</div> })));
const AnalyticsPage = React.lazy(() => import('./components/Analytics/AnalyticsPage').catch(() => ({ default: () => <div className="page">Analytics Content (Stub)</div> })));
const SettingsPage = React.lazy(() => import('./components/Settings/SettingsPage').catch(() => ({ default: () => <div className="page">Settings Content (Stub)</div> })));

const LoadingFallback = () => (
  <div className="page flex flex-col items-center justify-start gap-4">
    <div className="skeleton skeleton-title mt-4"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text" style={{width: '80%'}}></div>
    <div className="w-full card skeleton mt-4" style={{height: '150px'}}></div>
    <div className="w-full card skeleton mt-4" style={{height: '250px'}}></div>
  </div>
);

function App() {
  return (
    <div className="app">
      <main className="app__content">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/add" element={<AddExpensePage />} />
            <Route path="/add/:id" element={<AddExpensePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
