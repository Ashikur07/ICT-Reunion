'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ১. নতুন স্টেট (পাসওয়ার্ড দেখা/লুকানোর জন্য)
  const router = useRouter();

  const handleLogin = async (type) => {
    setLoading(true);
    try {
      if (type === 'viewer') {
        localStorage.setItem('user_role', 'viewer');
        Cookies.set('app_role', 'viewer', { expires: 1 });
        window.location.href = '/';
        return;
      }

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, type }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('user_role', data.role);
        Cookies.set('app_role', data.role, { expires: 1 });
        
        Swal.fire({
            icon: 'success',
            title: `Welcome, ${data.role.toUpperCase()}!`,
            timer: 1500,
            showConfirmButton: false,
            backdrop: `rgba(0,0,123,0.4)`
        });
        
        window.location.href = '/'; 
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'The passkey you entered is incorrect.',
          confirmButtonColor: '#d33',
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Something went wrong!', 'error');
    } finally {
      if (type !== 'viewer') setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-white flex items-center justify-center p-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="bg-white/80 backdrop-blur-xl w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/50 text-center relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header Icon */}
        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30 transform rotate-3 hover:rotate-0 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">Kit Manager</h1>
        <p className="text-slate-500 mb-8 text-sm font-medium">Secure Access Portal</p>

        {/* Password Input Area */}
        <div className="relative mb-6 group">
            {/* Left Lock Icon */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
            </div>

            {/* Input Field - ২. টাইপ চেঞ্জ এবং প্যাডিং আপডেট */}
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter Access Key" 
              className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm hover:bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* ৩. Right Eye Icon (Toggle Button) */}
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
            >
                {showPassword ? (
                    // Eye Slash Icon (Hide)
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                        <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
                        <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
                    </svg>
                ) : (
                    // Eye Icon (Show)
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.489 4.467-5.705 7.69-10.675 7.69-4.97 0-9.185-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                    </svg>
                )}
            </button>
        </div>

        {/* Login Button */}
        <button 
          onClick={() => handleLogin('auth')}
          disabled={loading || !password}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
             <>
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Verifying...
             </>
          ) : (
            'Unlock Access'
          )}
        </button>

        {/* Divider */}
        <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold tracking-wider">OR CONTINUE AS</span>
            <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Guest Button */}
        <button 
          onClick={() => handleLogin('viewer')}
          className="w-full bg-white border-2 border-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-xl">👀</span>
          View as Guest
        </button>

      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-6 text-slate-400 text-xs text-center w-full">
        Protected System • Authorized Personnel Only
      </div>
    </div>
  );
}