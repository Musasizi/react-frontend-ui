import { Container } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './AppRouter';
import './App.css';

function App() {
  return (
    <Router>
      <Container maxWidth="sm" style={{ marginTop: 40 }}>
        <AppRouter />
      </Container>
    </Router>
  );
}

export default App;
