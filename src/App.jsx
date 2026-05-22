import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
// Add page imports here
import Home from './pages/Home';
import DataSourceDaily from './pages/DataSourceDaily';
import Menu from './pages/Menu';
import DataSourceManual from './pages/DataSourceManual';
import DataSourceRefresh5min from './pages/DataSourceRefresh5min';
import DataSourceLive from './pages/DataSourceLive';
import GoogleFormTemplate from './pages/GoogleFormTemplate';
import GoogleMenu from './pages/GoogleMenu';
import GoogleSheetsMenu from './pages/GoogleSheetsMenu';
import GoogleSheetsManualSheetId from './pages/GoogleSheetsManualSheetId';
import GoogleSheetsHardcodeId from './pages/GoogleSheetsHardcodeId';
import GoogleSheetsSecurity from './pages/GoogleSheetsSecurity';
import GoogleFirebase from './pages/GoogleFirebase';
import GoogleSQL from './pages/GoogleSQL';
import GoogleObjectStorage from './pages/GoogleObjectStorage';
import AzureMenu from './pages/AzureMenu';
import Base44Menu from './pages/Base44Menu';


const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/datasourcedaily" element={<DataSourceDaily />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/datasourcemanual" element={<DataSourceManual />} />
      <Route path="/datasourcerefresh5min" element={<DataSourceRefresh5min />} />
      <Route path="/datasourcelistener" element={<DataSourceLive />} />
      <Route path="/googlemenu" element={<GoogleMenu />} />
      <Route path="/googleformtemplate" element={<GoogleFormTemplate />} />
      <Route path="/googlesheetsMenu" element={<GoogleSheetsMenu />} />
      <Route path="/googlesheetsmanualsheetid" element={<GoogleSheetsManualSheetId />} />
      <Route path="/googlesheetshardcodeid" element={<GoogleSheetsHardcodeId />} />
      <Route path="/googlesheetssecurity" element={<GoogleSheetsSecurity />} />
      <Route path="/googlefirebase" element={<GoogleFirebase />} />
      <Route path="/googlesql" element={<GoogleSQL />} />
      <Route path="/googleobjectstorage" element={<GoogleObjectStorage />} />
      <Route path="/azuremenu" element={<AzureMenu />} />
      <Route path="/base44menu" element={<Base44Menu />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App