import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Tabs, Tab, Container } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Dashboard from './pages/Dashboard';
import ProductsTable from './pages/ProductsTable';
import UploadPage from './pages/UploadPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1565C0' },
    secondary: { main: '#FF6F00' },
    background: { default: '#F5F7FA' },
  },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: { styleOverrides: { root: { boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 12 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

function App() {
  const [tab, setTab] = useState(0);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static" elevation={0} sx={{ background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)' }}>
          <Toolbar>
            <BarChartIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, letterSpacing: 0.5 }}>
              Product Analytics Dashboard
            </Typography>
          </Toolbar>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ px: 2, '& .MuiTab-root': { fontWeight: 600, minWidth: 140 } }}
          >
            <Tab icon={<BarChartIcon />} iconPosition="start" label="Dashboard" />
            <Tab icon={<TableChartIcon />} iconPosition="start" label="Products" />
            <Tab icon={<UploadFileIcon />} iconPosition="start" label="Upload Data" />
          </Tabs>
        </AppBar>
        <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 112px)', py: 3 }}>
          <Container maxWidth="xl">
            {tab === 0 && <Dashboard />}
            {tab === 1 && <ProductsTable />}
            {tab === 2 && <UploadPage />}
          </Container>
        </Box>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
