'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Category } from '@/app/components/MenuClient';
import { Trash2, Plus } from 'lucide-react';

interface CategoryModalProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryModal({ categories, isOpen, onClose, onSuccess }: CategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  if (!isOpen) return null;

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim() }]);

      if (error) throw error;

      setNewCategoryName('');
      onSuccess();
    } catch (error: any) {
      alert('Gagal menambah kategori: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${name}"?`)) return;

    setLoading(true);
    try {
      // Periksa apakah kategori ini sedang digunakan oleh menu
      const { data: menus, error: checkError } = await supabase
        .from('menus')
        .select('id')
        .eq('category_id', id)
        .limit(1);
        
      if (checkError) throw checkError;

      if (menus && menus.length > 0) {
        alert(`Tidak dapat menghapus kategori "${name}" karena masih ada menu yang menggunakannya. Hapus atau pindahkan menu terlebih dahulu.`);
        setLoading(false);
        return;
      }

      // Aman untuk dihapus
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      onSuccess();
    } catch (error: any) {
      alert('Gagal menghapus kategori: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Kelola Kategori</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl font-bold p-2">&times;</button>
        </div>
        
        {/* Tambah Kategori */}
        <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
          <input
            type="text"
            required
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nama kategori baru..."
            className="flex-1 bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-800 placeholder:text-slate-400 font-medium outline-none"
          />
          <button
            type="submit"
            disabled={loading || !newCategoryName.trim()}
            className="bg-teal-900 text-white p-2 rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50 flex items-center justify-center"
            title="Tambah Kategori"
          >
            <Plus size={20} />
          </button>
        </form>

        {/* Daftar Kategori */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stone-500 mb-2">Daftar Kategori Saat Ini</h3>
          {categories.length === 0 ? (
            <p className="text-sm text-stone-400 italic">Belum ada kategori.</p>
          ) : (
            <ul className="divide-y divide-stone-100 border border-stone-100 rounded-lg overflow-hidden">
              {categories.map((cat) => (
                <li key={cat.id} className="flex justify-between items-center p-3 bg-stone-50/50 hover:bg-stone-50 transition-colors">
                  <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    disabled={loading}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Hapus Kategori"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-stone-100 text-stone-700 rounded-lg font-semibold hover:bg-stone-200 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
