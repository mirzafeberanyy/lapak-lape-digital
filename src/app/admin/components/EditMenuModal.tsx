'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Category } from '@/app/components/MenuClient';
import { Menu } from '@/app/components/MenuCard';

interface EditMenuModalProps {
  categories: Category[];
  menu: Menu | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMenuModal({ categories, menu, isOpen, onClose, onSuccess }: EditMenuModalProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_best_seller: false,
    is_available: true,
  });

  // Populate form when menu changes or modal opens
  useEffect(() => {
    if (menu) {
      setFormData({
        name: menu.name,
        description: menu.description || '',
        price: menu.price.toString(),
        category_id: menu.category_id,
        is_best_seller: menu.is_best_seller,
        is_available: menu.is_available,
      });
      setFile(null); // reset file input
    }
  }, [menu, isOpen]);

  if (!isOpen || !menu) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = menu.image_url;

      // Upload new file if selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('menu-images')
          .getPublicUrl(uploadData.path);
          
        imageUrl = publicUrlData.publicUrl;
      }

      // Update database
      const { error: updateError } = await supabase
        .from('menus')
        .update({
          name: formData.name,
          description: formData.description,
          price: parseInt(formData.price),
          category_id: formData.category_id,
          is_best_seller: formData.is_best_seller,
          is_available: formData.is_available,
          image_url: imageUrl,
        })
        .eq('id', menu.id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4 text-[#1E3A2B]">Edit Menu</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Menu</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-800 placeholder:text-slate-400 font-medium outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-800 placeholder:text-slate-400 font-medium outline-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rp)</label>
            <input
              type="number"
              name="price"
              required
              min="0"
              value={formData.price}
              onChange={handleChange}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-800 placeholder:text-slate-400 font-medium outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
            <select
              name="category_id"
              required
              value={formData.category_id}
              onChange={handleChange}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-800 placeholder:text-slate-400 font-medium outline-none"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Foto Menu <span className="text-xs text-stone-500 font-normal">(Kosongkan jika tidak ingin mengubah)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-800 placeholder:text-slate-400 font-medium outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="is_best_seller"
              id="edit_is_best_seller"
              checked={formData.is_best_seller}
              onChange={handleChange}
              className="w-4 h-4 text-[#1E3A2B] rounded focus:ring-[#1E3A2B]"
            />
            <label htmlFor="edit_is_best_seller" className="text-sm text-slate-700">Best Seller</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_available"
              id="edit_is_available"
              checked={formData.is_available}
              onChange={handleChange}
              className="w-4 h-4 text-[#1E3A2B] rounded focus:ring-[#1E3A2B]"
            />
            <label htmlFor="edit_is_available" className="text-sm text-slate-700">Tersedia</label>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#1E3A2B] text-white rounded-lg font-semibold hover:bg-[#1E3A2B]/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
