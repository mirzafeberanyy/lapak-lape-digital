'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Category } from '@/app/components/MenuClient';
import { Menu } from '@/app/components/MenuCard';
import MenuModal from './components/MenuModal';
import CategoryModal from './components/CategoryModal';
import EditMenuModal from './components/EditMenuModal';
import { Plus, Trash2, LogOut, Settings, Filter, FolderKanban, MoreVertical, Edit2 } from 'lucide-react';

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [menuToEdit, setMenuToEdit] = useState<Menu | null>(null);
  
  // Dropdown states
  const [activeMenuOptions, setActiveMenuOptions] = useState<string | null>(null);
  
  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    const [{ data: categoriesData }, { data: menusData }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('menus').select('*').order('created_at', { ascending: false })
    ]);
    
    if (categoriesData) setCategories(categoriesData);
    if (menusData) setMenus(menusData);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setAuthError(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setMenus(menus.map(m => m.id === id ? { ...m, is_available: !currentStatus } : m));
    
    const { error } = await supabase
      .from('menus')
      .update({ is_available: !currentStatus })
      .eq('id', id);
      
    if (error) {
      alert('Gagal mengubah status: ' + error.message);
      fetchData(); // revert
    }
  };

  const handleDelete = async (id: string) => {
    setActiveMenuOptions(null);
    if (window.confirm('Yakin ingin menghapus menu ini?')) {
      const { error } = await supabase.from('menus').delete().eq('id', id);
      if (error) {
        alert('Gagal menghapus: ' + error.message);
      } else {
        fetchData();
      }
    }
  };

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeMenuOptions !== null) {
        setActiveMenuOptions(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuOptions]);

  if (loading && !session) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-5">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-900">
              <Settings size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-8">Admin Lapak Lape</h1>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <input
                type="email"
                placeholder="Email Admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-800 placeholder:text-slate-400 font-medium outline-none"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-800 placeholder:text-slate-400 font-medium outline-none"
              />
            </div>
            
            {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-900 text-white rounded-xl font-bold mt-2 hover:bg-teal-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Masuk...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredMenus = menus.filter(m => filterCategory === 'all' || m.category_id === filterCategory);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-white shadow-sm border-b border-[#E8E2D2] sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Settings className="text-[#1E3A2B]" />
            <h1 className="text-xl font-bold text-[#1E3A2B]">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-[#3E2723]">Kelola Menu</h2>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Filter Category */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white text-slate-900 border border-slate-300 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-800 placeholder:text-slate-400 font-medium shadow-sm"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500">
                <Filter size={16} />
              </div>
            </div>

            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-white border border-[#E8E2D2] text-stone-800 px-4 py-2.5 rounded-xl font-semibold hover:bg-stone-50 shadow-sm transition-all"
              title="Kelola Kategori"
            >
              <FolderKanban size={18} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#1E3A2B] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-[#1E3A2B]/90 shadow-sm transition-all flex-1 sm:flex-none"
            >
              <Plus size={18} />
              <span>Menu Baru</span>
            </button>
          </div>
        </div>

        {/* Mobile-Friendly List */}
        <div className="flex flex-col gap-4">
          {filteredMenus.length === 0 ? (
            <div className="text-center py-12 text-[#A39E93] bg-white rounded-2xl border border-[#E8E2D2]">
              Belum ada data menu untuk kategori ini.
            </div>
          ) : (
            filteredMenus.map(menu => {
              const category = categories.find(c => c.id === menu.category_id);
              const isOptionsOpen = activeMenuOptions === menu.id;

              return (
                <div key={menu.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8E2D2] flex items-center gap-4 relative">
                  {/* Image */}
                  <div className="shrink-0 w-16 h-16 rounded-xl bg-[#F7F4EE] border border-[#E8E2D2] overflow-hidden flex items-center justify-center">
                    {menu.image_url ? (
                      <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-stone-400">No Img</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-[#1E3A2B] truncate pr-2">{menu.name}</h3>
                      <p className="font-bold text-[#3E2723] whitespace-nowrap">{formatRupiah(menu.price)}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md font-medium">
                        {category?.name || 'Tanpa Kategori'}
                      </span>
                      {menu.is_best_seller && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold">Best Seller</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div
                          onClick={() => toggleAvailability(menu.id, menu.is_available)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            menu.is_available ? 'bg-emerald-600' : 'bg-stone-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              menu.is_available ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </div>
                        <span className="text-xs font-semibold text-stone-600">
                          {menu.is_available ? 'Tersedia' : 'Habis'}
                        </span>
                      </label>

                      {/* Three Dots Action */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuOptions(isOptionsOpen ? null : menu.id);
                          }}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={20} />
                        </button>

                        {/* Dropdown Menu */}
                        {isOptionsOpen && (
                          <div className="absolute right-0 bottom-10 mt-2 w-36 bg-white rounded-xl shadow-lg border border-stone-100 py-1 z-30 animate-in fade-in zoom-in duration-100">
                            <button
                              onClick={() => {
                                setMenuToEdit(menu);
                                setActiveMenuOptions(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                            >
                              <Edit2 size={14} />
                              Edit Menu
                            </button>
                            <button
                              onClick={() => handleDelete(menu.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              Padam
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <MenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        onSuccess={fetchData}
      />

      <EditMenuModal
        menu={menuToEdit}
        isOpen={!!menuToEdit}
        onClose={() => setMenuToEdit(null)}
        categories={categories}
        onSuccess={fetchData}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSuccess={fetchData}
      />
    </div>
  );
}
