import { useNavigate } from 'react-router-dom';

export default function Landing({ onOpenAuth }) {
  const navigate = useNavigate();
  
  return (
    <div className="relative min-h-screen w-full font-sans">
   
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-black via-violet-800 to-teal-800" aria-hidden="true" />
      <div className="relative flex-1 w-full z-10">
        
        <header className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center px-4 sm:px-8 py-14 sm:py-20 md:py-28">
          <img src="/logo.svg" alt="Logo" className="w-24 h-24 sm:w-28 sm:h-28 mb-1 drop-shadow-2xl bg-gradient-to-br from-teal-700 to-violet-700 rounded-full p-2 border-4 border-violet-400/30" />
          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight bg-gradient-to-r from-teal-300 via-violet-400 to-violet-100 bg-clip-text text-transparent drop-shadow-2xl max-w-4xl mx-auto">
           Upload & Enjoy Your Music
          </h1>
          <p className="mt-8 text-lg xs:text-xl sm:text-2xl text-gray-200 max-w-2xl mx-auto">
            Build playlists, and manage your music library.  
            <span className="text-teal-300 font-semibold"> Cloud Music</span> keeps your rhythm in sync.
          </p>
          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-10 py-3 bg-gradient-to-r from-teal-600 to-violet-600 hover:from-teal-500 hover:to-violet-500 text-white font-bold rounded-2xl shadow-xl transition w-full sm:w-auto border-2 border-transparent hover:border-teal-300"
            >
            ✨ Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="px-10 py-3 border-2 border-violet-400 text-violet-200 font-bold rounded-2xl hover:bg-violet-800/40 hover:text-white transition w-full sm:w-auto shadow-xl"
            >
             🚀 Get Started
            </button>
          </div>
        </header>

        <section className="w-full max-w-7xl mx-auto py-14 sm:py-20 px-4 grid gap-8 sm:gap-10 md:gap-12 grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 text-center">
          <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-br from-black/60 via-violet-900/60 to-teal-900/60 border-2 border-teal-700/40 shadow-2xl hover:shadow-3xl transition flex flex-col items-center">
            <div className="text-teal-300 text-4xl sm:text-5xl mb-4">🎵</div>
           <h3 className="text-lg sm:text-xl font-bold text-white">
          Smart Playlists
          </h3>
            <p className="mt-3 text-gray-300 text-sm sm:text-base">
              Create, edit, and manage playlists.
            </p>
          </div>
          <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-br from-black/60 via-violet-900/60 to-teal-900/60 border-2 border-violet-700/40 shadow-2xl hover:shadow-3xl transition flex flex-col items-center">
            <div className="text-violet-300 text-4xl sm:text-5xl mb-4">📱</div>
        <h3 className="text-lg sm:text-xl font-bold text-white">
         Play Your Playlists
        </h3>

         <p className="mt-3 text-white text-sm">
         Access your music anytime, on your hand.
        </p>
          </div>
          <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-br from-black/60 via-violet-900/60 to-teal-900/60 border-2 border-pink-600/40 shadow-2xl hover:shadow-3xl transition flex flex-col items-center">
            <div className="text-pink-300 text-4xl sm:text-5xl mb-4">⚡</div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Easy and enjoyable</h3>
            <p className="mt-3 text-gray-300 text-sm sm:text-base">
              Built for want play you want.
            </p>
          </div>
        </section>

        <section className="w-full max-w-5xl mx-auto py-14 sm:py-20 px-4 bg-gradient-to-r from-violet-800/80 to-teal-800/80 rounded-3xl shadow-2xl text-center mt-10 mb-10 border-2 border-violet-700/40">
          <h2 className="text-3xl xs:text-4xl sm:text-5xl font-extrabold mb-5 text-white drop-shadow-xl">
           Upload Your Sounds Now?
          </h2> 
          <p className="mb-8 text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto">
           create your account and enjoy the music.
          </p>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="px-10 sm:px-12 py-4 bg-white text--700 font-bold rounded-2xl shadow-xl hover:bg-gray-100 transition text-lg border-2 border-violet-400"
          >
          ✨ Sign Up Now
          </button>
        </section>
      </div>
    
      <footer className="w-full text-center py-7 text-sm sm:text-base text-gray-400 border-t border-violet-800 bg-transparent/60 px-2 mt-auto z-10 relative">
        © {new Date().getFullYear()} <span className="font-semibold text-violet-300">NLEX Music</span>. All rights reserved.
      </footer>
    </div>
  );
}
