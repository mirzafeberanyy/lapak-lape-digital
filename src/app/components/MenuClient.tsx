'use client';

import { useState } from 'react';
import { Search, MapPin, Coffee, Utensils, CupSoda, CheckCircle2, Sparkles } from 'lucide-react';

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
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

// Parent Group definitions
const MINUMAN_KEYWORDS = ['coffee', 'kopi', 'mocktail', 'powder', 'teh', 'tea', 'minuman', 'drink', 'beverage', 'jus', 'juice'];
const MAKANAN_KEYWORDS = ['makanan', 'cemilan', 'snack', 'dimsum', 'ramen', 'mie', 'nasi', 'food', 'krispy'];

function getParentGroup(categoryName: string): 'Minuman' | 'Makanan & Cemilan' {
  const lowerName = categoryName.toLowerCase();

  // Check Minuman
  if (MINUMAN_KEYWORDS.some(kw => lowerName.includes(kw))) {
    return 'Minuman';
  }
  // Check Makanan
  if (MAKANAN_KEYWORDS.some(kw => lowerName.includes(kw))) {
    return 'Makanan & Cemilan';
  }

  // Fallback heuristic: If not found, default to Makanan
  return 'Makanan & Cemilan';
}

function getCategoryIcon(categoryName: string) {
  const lowerName = categoryName.toLowerCase();
  if (lowerName.includes('coffee') || lowerName.includes('kopi')) return <Coffee className="w-4 h-4" />;
  if (lowerName.includes('mocktail') || lowerName.includes('teh') || lowerName.includes('powder')) return <CupSoda className="w-4 h-4" />;
  if (lowerName.includes('dimsum') || lowerName.includes('ramen') || lowerName.includes('makanan') || lowerName.includes('snack') || lowerName.includes('cemilan')) return <Utensils className="w-4 h-4" />;
  return <Sparkles className="w-4 h-4" />;
}

export default function MenuClient({ initialMenus, categories, tableNumber }: MenuClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [activeParentTab, setActiveParentTab] = useState<'Semua' | 'Minuman' | 'Makanan & Cemilan'>('Semua');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Group categories
  const minumanCategories = categories.filter(c => getParentGroup(c.name) === 'Minuman');
  const makananCategories = categories.filter(c => getParentGroup(c.name) === 'Makanan & Cemilan');

  const getVisibleCategories = () => {
    if (activeParentTab === 'Minuman') return minumanCategories;
    if (activeParentTab === 'Makanan & Cemilan') return makananCategories;
    return categories;
  };

  const visibleCategories = getVisibleCategories();

  const handleParentTabChange = (tab: 'Semua' | 'Minuman' | 'Makanan & Cemilan') => {
    setActiveParentTab(tab);
    setActiveCategory('all');
  };

  const filteredMenus = initialMenus.filter((menu) => {
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (menu.description && menu.description.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesParent = true;
    if (activeParentTab !== 'Semua') {
      const menuCategory = categories.find(c => c.id === menu.category_id);
      if (menuCategory) {
        matchesParent = getParentGroup(menuCategory.name) === activeParentTab;
      } else {
        matchesParent = false;
      }
    }

    const matchesCategory = activeCategory === 'all' || menu.category_id === activeCategory;
    return matchesSearch && matchesParent && matchesCategory;
  }).sort((a, b) => {
    if (a.is_best_seller && !b.is_best_seller) return -1;
    if (!a.is_best_seller && b.is_best_seller) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#3E2723] selection:bg-[#1E3A2B] selection:text-white flex flex-col">
      {/* Header section */}
      <header className="px-5 pt-12 pb-8 flex flex-col items-center text-center">
        {/* Logo or Fallback */}
        <div className="mb-4">
          {!logoError ? (
            <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
              <Image
                src="/logo.png"
                alt="Lapak Lape Logo"
                fill
                sizes="(max-width: 768px) 112px, 112px"
                className="object-cover"
                onError={() => setLogoError(true)}
                priority
              />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full bg-[#1E3A2B] flex items-center justify-center shadow-md">
              <span className="text-white font-serif font-bold text-3xl">LL</span>
            </div>
          )}
        </div>

        <h1 className="text-4xl font-serif font-bold text-[#1E3A2B] tracking-tight mb-2">
          Lapak Lape
        </h1>

        <p className="text-[#8B7355] font-medium text-xs tracking-[0.3em] uppercase mb-4">
          • Food Court •
        </p>

        {/* Contact & Location Info */}
        <div className="flex flex-col items-center gap-3 mt-2 mb-4 text-[#5C5346]">
          <a
            href="https://www.instagram.com/lapak_lape"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium hover:text-[#1E3A2B] transition-colors"
          >
            <InstagramIcon className="w-4 h-4 text-[#1E3A2B]" />
            <span>@lapak_lape</span>
          </a>

          <a
            href="https://maps.app.goo.gl/miFYZsi4MVHjDiLX7?g_st=ic"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium hover:text-[#1E3A2B] transition-colors text-center"
          >
            <MapPin className="w-4 h-4 text-[#1E3A2B] shrink-0" />
            <span>Wih Kuning Simpang Balek (Depan Alfamart)</span>
          </a>
        </div>

        {tableNumber && (
          <div className="mt-2 bg-[#1E3A2B]/5 border border-[#1E3A2B]/20 px-4 py-2 rounded-full inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1E3A2B]" />
            <p className="text-[#1E3A2B] font-bold text-sm">
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
            className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#E8E2D2] rounded-2xl text-[#3E2723] placeholder-[#A39E93] focus:bg-white focus:border-[#1E3A2B] focus:ring-1 focus:ring-[#1E3A2B] transition-all outline-none shadow-sm font-medium"
            placeholder="Cari minuman atau cemilan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Parent Group Navigation (Pill Tabs) */}
      <div className="flex justify-center flex-wrap gap-2 px-4 mb-4 max-w-3xl mx-auto w-full">
        <button
          onClick={() => handleParentTabChange('Semua')}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 shadow-sm ${activeParentTab === 'Semua' ? 'bg-[#1E3A2B] text-white ring-2 ring-[#1E3A2B] ring-offset-2 ring-offset-[#FDFBF7]' : 'bg-white text-[#5C5346] border border-[#E8E2D2] hover:bg-stone-50'}`}
        >
          Semua
        </button>
        <button
          onClick={() => handleParentTabChange('Minuman')}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 shadow-sm ${activeParentTab === 'Minuman' ? 'bg-[#1E3A2B] text-white ring-2 ring-[#1E3A2B] ring-offset-2 ring-offset-[#FDFBF7]' : 'bg-white text-[#5C5346] border border-[#E8E2D2] hover:bg-stone-50'}`}
        >
          Minuman
        </button>
        <button
          onClick={() => handleParentTabChange('Makanan & Cemilan')}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 shadow-sm ${activeParentTab === 'Makanan & Cemilan' ? 'bg-[#1E3A2B] text-white ring-2 ring-[#1E3A2B] ring-offset-2 ring-offset-[#FDFBF7]' : 'bg-white text-[#5C5346] border border-[#E8E2D2] hover:bg-stone-50'}`}
        >
          Makanan
        </button>
      </div>

      {/* Sub-Category Navigation */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeParentTab === 'Semua' ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
        <div className="flex flex-wrap justify-center gap-2 px-4 mb-6 max-w-3xl mx-auto w-full">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm ${activeCategory === 'all' ? 'bg-[#3E2723] text-white' : 'bg-white text-[#5C5346] border border-[#E8E2D2] hover:bg-stone-50'}`}
          >
            Semua {activeParentTab !== 'Semua' ? activeParentTab : ''}
          </button>
          {visibleCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm ${activeCategory === category.id ? 'bg-[#3E2723] text-white' : 'bg-white text-[#5C5346] border border-[#E8E2D2] hover:bg-stone-50'}`}
            >
              {getCategoryIcon(category.name)}
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <main className="flex-grow px-5 pb-10 max-w-3xl w-full mx-auto">
        {filteredMenus.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMenus.map((menu) => (
              <MenuCard key={menu.id} menu={menu} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-[#A39E93] flex flex-col items-center bg-white rounded-2xl border border-[#E8E2D2] shadow-sm">
            <Utensils className="h-12 w-12 mb-4 opacity-30 text-[#1E3A2B]" />
            <p className="text-base font-medium text-[#5C5346]">Yah, menu tidak ditemukan.</p>
            <p className="text-xs mt-1 text-[#A39E93]">Coba kata kunci atau kategori lain.</p>
          </div>
        )}
      </main>

      {/* Footer / Info Section */}
      <footer className="w-full px-5 mt-auto">
        <div className="bg-[#1b3b2b] rounded-2xl p-5 text-center shadow-md max-w-md mx-auto my-6 flex flex-col items-center justify-center">
          <a
            href="https://www.instagram.com/lapak_lape"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
          >
            <Coffee className="w-5 h-5 text-white" />
            <span className="font-bold text-white text-base">@Lapak_Lape</span>
          </a>
          <p className="text-[#e2d9cc] text-sm">
            Silahkan pesan di kasir Lapak Lape
          </p>
        </div>

        <div className="text-xs text-stone-400 text-center pb-8 pt-2 leading-relaxed">
          © 2026 Lapak Lape. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
