import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Layout.css';

function Layout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;