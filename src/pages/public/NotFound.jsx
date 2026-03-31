import { Link } from 'react-router-dom';
import { Home, ArrowLeft, TreePine } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center px-4 animate-page-in">
      <div className="text-center max-w-md">
        {/* 404 */}
        <div className="mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#E8D5C4]/50 flex items-center justify-center mx-auto mb-4">
            <TreePine className="w-10 h-10 sm:w-12 sm:h-12 text-[#8B5A2B]" />
          </div>
          <span className="text-[100px] sm:text-[140px] font-heading font-bold text-[#E8D5C4]/50 leading-none select-none">
            404
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#3D2914] mb-3">
          Sayfa Bulunamadı
        </h1>
        <p className="text-[#8B5A2B] mb-8 leading-relaxed">
          Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı olabilir.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C67D4A] text-white font-semibold hover:bg-[#C67D4A]/90 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Ana Sayfa
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-[#E8D5C4] text-[#3D2914] font-semibold hover:border-[#C67D4A] hover:text-[#C67D4A] transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Geri Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
