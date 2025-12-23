import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { Toaster } from "react-hot-toast";

function App() {

    return (
        <div className='w-full h-screen bg-linear-to-bl from-gray-700 via-gray-600 to-gray-700 text-white overflow-x-hidden flex flex-col'>
            <Navbar />

           <Toaster
                position="top-right"
                containerStyle={{
                    top: 80,
                }}
                toastOptions={{
                    style: {
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)', // for Safari
                        color: '#0f172a',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    },

                    error: {
                        style: {
                            background: 'rgba(254, 242, 242, 0.3)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            color: '#7f1d1d',
                            border: '1px solid rgba(254, 202, 202, 0.5)',
                            borderRadius: '0.75rem',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        },
                    },
                    success: {
                        style: {
                            background: 'rgba(240, 253, 244, 0.3)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            color: '#14532d',
                            border: '1px solid rgba(187, 247, 208, 0.5)',
                            borderRadius: '0.75rem',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        },
                    },
                }}
            />
            <main className='flex-1 p-4'>
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default App;