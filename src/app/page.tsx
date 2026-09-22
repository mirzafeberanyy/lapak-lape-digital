import { supabase } from '@/lib/supabaseClient';
import MenuClient from './components/MenuClient';

// Ensure the page can be dynamically rendered to capture URL searchParams
export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const tableNumber = resolvedSearchParams?.table as string | null;

  const [{ data: categories }, { data: menus }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('menus').select('*').order('is_best_seller', { ascending: false }).order('name')
  ]);

  return (
    <MenuClient 
      initialMenus={menus || []} 
      categories={categories || []} 
      tableNumber={tableNumber} 
    />
  );
}
