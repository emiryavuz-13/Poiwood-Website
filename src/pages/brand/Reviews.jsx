import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { approveBrandReview, getBrandReviews, replyBrandReview } from '../../api/brand';
import { useBrand } from '../../contexts/BrandContext';

export default function BrandReviews() {
  const { brandId } = useBrand(); const queryClient = useQueryClient(); const [reply, setReply] = useState({});
  const { data, isLoading } = useQuery({ queryKey: ['brandReviews', brandId], queryFn: () => getBrandReviews(brandId), enabled: Boolean(brandId) });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['brandReviews', brandId] });
  const approve = useMutation({ mutationFn: (id) => approveBrandReview(brandId, id), onSuccess: refresh });
  const answer = useMutation({ mutationFn: (id) => replyBrandReview(brandId, id, reply[id]), onSuccess: refresh });
  const rows = data?.reviews || [];
  return <Moderation title="Yorumlar" subtitle="Yalnızca markanızın ürünlerine gelen yorumlar." empty="Henüz yorum yok." loading={isLoading} rows={rows} render={(row) => <div key={row.id} className="rounded-xl border border-light-wood/60 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-semibold text-walnut">{row.product_name}</p><p className="text-xs text-coffee">{row.user_name}</p></div><div className="flex items-center gap-1 text-amber-600"><Star className="h-4 w-4 fill-current" />{row.rating}/5</div></div><p className="mt-3 text-sm text-walnut">{row.comment}</p>{row.admin_reply && <p className="mt-3 rounded-lg bg-cream p-3 text-sm text-coffee">Yanıtınız: {row.admin_reply}</p>}<div className="mt-3 flex flex-wrap gap-2">{!row.is_approved && <button onClick={() => approve.mutate(row.id)} className="rounded-lg bg-olive px-3 py-2 text-xs font-medium text-white">Yayınla</button>}<input value={reply[row.id] || ''} onChange={(e) => setReply({ ...reply, [row.id]: e.target.value })} placeholder="Yanıt yazın" className="min-w-56 flex-1 rounded-lg border border-light-wood px-3 py-2 text-sm" /><button disabled={!reply[row.id]} onClick={() => answer.mutate(row.id)} className="rounded-lg bg-walnut px-3 py-2 text-xs font-medium text-white disabled:opacity-40">Yanıtla</button></div></div>} />;
}

function Moderation({ title, subtitle, empty, loading, rows, render }) { return <div><div className="mb-5"><h1 className="font-heading text-2xl font-bold text-walnut">{title}</h1><p className="text-sm text-coffee">{subtitle}</p></div>{loading ? <div className="h-28 animate-pulse rounded-xl bg-white" /> : !rows.length ? <div className="rounded-xl bg-white p-10 text-center text-sm text-coffee">{empty}</div> : <div className="space-y-3">{rows.map(render)}</div>}</div>; }
