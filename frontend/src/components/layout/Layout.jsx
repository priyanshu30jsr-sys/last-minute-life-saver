import Sidebar from './Sidebar';
import PageTransition from '../../animations/PageTransition';

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-navy">
    <Sidebar />
    <main className="flex-1 ml-[72px] relative z-10">
      <PageTransition>
        {children}
      </PageTransition>
    </main>
  </div>
);

export default Layout;