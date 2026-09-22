'use client';

import { useState } from 'react';
import { Search, Coffee } from 'lucide-react';
import MenuCard, { Menu } from './MenuCard';
import Image from 'next/image';

export type Category = {
  id: string;
  name: string;
};

interface MenuClientProps {
  initialMenus: Menu[];
  categories: Category[];
  tableNumber: string | null;
}

export default function MenuClient({ initialMenus, categories, tableNumber }: MenuClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [logoError, setLogoError] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredMenus = initialMenus.filter((menu) => {
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (menu.description && menu.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || menu.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#3E2723] selection:bg-[#1E3A2B] selection:text-white flex flex-col">
      {/* Header section */}
      <header className="px-5 pt-12 pb-8 flex flex-col items-center text-center">
        {/* Logo or Fallback */}
        <div className="mb-6">
          {!logoError ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border border-[#E8E2D2] shadow-sm">
              <Image
                src="/logo.png"
                alt="Lapak Lape Logo"
                fill
                className="object-cover"
                onError={() => setLogoError(true)}
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#1E3A2B] flex items-center justify-center shadow-sm">
              <span className="text-white font-serif font-bold text-2xl">LL</span>
            </div>
          )}
        </div>

        {/* Branding */}
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#1E3A2B] uppercase border border-[#1E3A2B] px-3 py-1 rounded-full mb-4">
          Brewed to Perfection
        </span>

        <h1 className="text-5xl font-serif font-bold text-[#1E3A2B] mb-2 tracking-tight">
          MENU List
        </h1>
        <h2 className="text-xl font-bold text-[#3E2723] uppercase tracking-widest mb-2">
          Lapak Lape
        </h2>

        <p className="text-[#5C5346] font-medium text-sm">
          • Food Court •
        </p>

        {tableNumber && (
          <div className="mt-4 bg-[#F7F4EE] border border-[#E8E2D2] px-4 py-2 rounded-lg inline-block">
            <p className="text-[#3E2723] font-bold text-sm">
              Meja {tableNumber}
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative w-full max-w-md mt-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#A39E93]" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-[#F7F4EE] border border-[#E8E2D2] rounded-xl text-[#3E2723] placeholder-[#A39E93] focus:bg-white focus:border-[#1E3A2B] focus:ring-1 focus:ring-[#1E3A2B] transition-all outline-none shadow-sm"
            placeholder="Cari minuman atau cemilan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Category Navigation */}
      <div className="flex flex-wrap justify-center gap-2 px-4 mb-6 max-w-3xl mx-auto w-full">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors shadow-sm ${activeCategory === 'all' ? 'bg-[#1E3A2B] text-white' : 'bg-white/80 text-stone-700 border border-stone-300 hover:bg-stone-50'}`}
        >
          Semua
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors shadow-sm ${activeCategory === category.id ? 'bg-[#1E3A2B] text-white' : 'bg-white/80 text-stone-700 border border-stone-300 hover:bg-stone-50'}`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu List */}
      <main className="flex-grow px-5 pb-10 max-w-3xl w-full mx-auto">
        {filteredMenus.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredMenus.map((menu) => (
              <MenuCard key={menu.id} menu={menu} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-[#A39E93] flex flex-col items-center">
            <Search className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-base font-medium">Yah, menu tidak ditemukan.</p>
          </div>
        )}
      </main>

      {/* Footer Banner */}
      <footer className="px-5 pb-8 pt-4 mt-auto">
        <div className="max-w-3xl mx-auto bg-[#1E3A2B] text-[#FDFBF7] rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
          <a href="https://www.instagram.com/lapak_lape" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mb-3 hover:text-amber-400 transition-colors">
            <Coffee size={20} />
            <span className="font-bold tracking-wide">@lapaklape</span>
          </a>
          <p className="text-sm text-[#E8E2D2]">
            Silahkan pesan di kasir Lapak Lape
          </p>
        </div>
      </footer>
    </div>
  );
}
