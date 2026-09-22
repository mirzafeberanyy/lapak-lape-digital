import { Leaf } from 'lucide-react';

export type Menu = {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_best_seller: boolean;
  is_available: boolean;
  image_url: string | null;
  created_at?: string;
};

interface MenuCardProps {
  menu: Menu;
}

export default function MenuCard({ menu }: MenuCardProps) {
  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isAvailable = menu.is_available;

  return (
    <div
      className={`flex items-start gap-4 p-4 mb-4 rounded-xl transition-all duration-300 ${
        isAvailable ? 'bg-white border border-stone-200 shadow-sm' : 'bg-stone-200/70 border border-stone-300/80 opacity-60'
      }`}
    >
      {/* Menu Image */}
      <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-[#F7F4EE] border border-[#E8E2D2] flex items-center justify-center relative">
        {menu.image_url ? (
          <img
            src={menu.image_url}
            alt={menu.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Leaf className="w-8 h-8 text-[#A39E93]" />
        )}
      </div>

      {/* Menu Info */}
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start gap-2">
          {/* Name and Badges */}
          <div className="flex flex-col min-w-0">
            <h3 className={`font-bold text-slate-800 break-words whitespace-normal leading-snug ${!isAvailable && 'line-through opacity-70'}`}>
              {menu.name}
              {menu.is_best_seller && (
                <span className="ml-1.5 inline-flex items-center text-amber-500 text-sm align-middle" title="Best Seller">
                  ★
                </span>
              )}
            </h3>
            
            {/* Description */}
            {menu.description ? (
              <p className="text-[#5C5346] text-xs leading-relaxed mt-1 line-clamp-2">
                {menu.description}
              </p>
            ) : isAvailable ? (
              <p className="text-[#5C5346] text-xs leading-relaxed mt-1 italic opacity-70">
                Tersedia
              </p>
            ) : null}
            
            {/* Unavailable Text */}
            {!isAvailable && (
              <span className="inline-block mt-1.5 bg-stone-300 text-stone-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-max">
                Tidak Tersedia
              </span>
            )}
          </div>

          {/* Price */}
          <div className="shrink-0 ml-3 text-right">
            <span className={`font-bold text-[#3E2723] whitespace-nowrap ${!isAvailable && 'line-through opacity-70'}`}>
              {formatRupiah(menu.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
