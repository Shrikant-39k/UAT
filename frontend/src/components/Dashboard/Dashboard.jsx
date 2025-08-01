import {
  Box,
  Container,
} from '@mui/material';
import BalanceSection from './BalanceSection';
import TransferSection from './TransferSection';
import RiskManagementSection from './RiskManagementSection';
import HistorySection from './HistorySection';
// import DebugPanel from '../Debug/DebugPanel'; // Temporarily disabled - uncomment for debugging

const Dashboard = () => {
  return (
    <Container maxWidth="xxl" sx={{ py: 3 }}>
      {/* <DebugPanel /> */}
      <Box sx={{ mb: 3 }}>
        <BalanceSection />
      </Box>
      <Box sx={{ mb: 3 }}>
        <TransferSection />
      </Box>
      <Box sx={{ mb: 3 }}>
        <RiskManagementSection />
      </Box>
      <Box sx={{ mb: 3 }}>
        <HistorySection />
      </Box>
    </Container>
  );
};

export default Dashboard;