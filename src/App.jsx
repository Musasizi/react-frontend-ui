// App.jsx – Root component.
// It renders the AppRouter, which already contains its own BrowserRouter,
// so we do NOT add another <Router> wrapper here.
import AppRouter from './AppRouter';
import './App.css';

function App() {
  return <AppRouter />;
}

export default App;
