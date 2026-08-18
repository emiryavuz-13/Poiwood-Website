import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { answerBrandQuestion, getBrandQuestions, toggleBrandQuestion } from '../../api/brand';
import { useBrand } from '../../contexts/BrandContext';

export default function BrandQuestions() {
  const { brandId } = useBrand(); const queryClient = useQueryClient(); const [answers, setAnswers] = useState({});
  const { data, isLoading } = useQuery({ queryKey: ['brandQuestions', brandId], queryFn: () => getBrandQuestions(brandId), enabled: Boolean(brandId) });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['brandQuestions', brandId] });
  const answer = useMutation({ mutationFn: (id) => answerBrandQuestion(brandId, id, answers[id]), onSuccess: refresh });
  const toggle = useMutation({ mutationFn: (id) => toggleBrandQuestion(brandId, id), onSuccess: refresh });
  const rows = data?.questions || [];
  return <div><div className="mb-5"><h1 className="font-heading text-2xl font-bold text-walnut">Sorular</h1><p className="text-sm text-coffee">Yalnızca kendi ürünlerinizle ilgili soruları yönetin.</p></div>{isLoading ? <div className="h-28 animate-pulse rounded-xl bg-white" /> : !rows.length ? <div className="rounded-xl bg-white p-10 text-center text-sm text-coffee">Henüz soru yok.</div> : <div className="space-y-3">{rows.map((row) => <div key={row.id} className="rounded-xl border border-light-wood/60 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-walnut">{row.product_name}</p><p className="text-xs text-coffee">{row.user_name}</p></div><button onClick={() => toggle.mutate(row.id)} className={`rounded-full px-2.5 py-1 text-xs ${row.is_visible ? 'bg-olive/10 text-olive' : 'bg-gray-100 text-gray-600'}`}>{row.is_visible ? 'Görünür' : 'Gizli'}</button></div><p className="mt-3 text-sm text-walnut">{row.question_text}</p>{row.answer_text ? <p className="mt-3 rounded-lg bg-cream p-3 text-sm text-coffee">Yanıtınız: {row.answer_text}</p> : <div className="mt-3 flex gap-2"><input value={answers[row.id] || ''} onChange={(e) => setAnswers({ ...answers, [row.id]: e.target.value })} placeholder="Yanıt yazın" className="flex-1 rounded-lg border border-light-wood px-3 py-2 text-sm" /><button disabled={!answers[row.id]} onClick={() => answer.mutate(row.id)} className="rounded-lg bg-walnut px-3 py-2 text-xs font-medium text-white disabled:opacity-40">Yanıtla</button></div>}</div>)}</div>}</div>;
}
