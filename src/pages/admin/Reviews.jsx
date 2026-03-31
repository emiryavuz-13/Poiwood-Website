import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star, CheckCircle2, Clock, Trash2, MessageSquare, Send, Loader2,
  Search, ExternalLink,
} from 'lucide-react';
import { getAdminReviews, approveReview, replyReview, deleteReview } from '../../api/admin';

const Reviews = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminReviews', filter, searchQuery, page],
    queryFn: () => getAdminReviews({
      is_approved: filter === 'all' ? undefined : filter === 'approved' ? 'true' : 'false',
      search: searchQuery || undefined,
      page,
      limit: 15,
    }),
  });

  const reviews = Array.isArray(data) ? data : data?.reviews || [];
  const total = data?.pagination?.total || 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2914]">Yorum Yönetimi</h1>
          <p className="text-sm text-[#8B5A2B] mt-0.5">Müşteri yorumlarını onaylayın, yanıtlayın veya silin.</p>
        </div>
        <div className="flex items-center gap-1 text-xs bg-white rounded-lg border border-[#E8D5C4]/50 p-1">
          {[
            { key: 'all', label: 'Tümü' },
            { key: 'pending', label: 'Bekleyen' },
            { key: 'approved', label: 'Onaylı' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filter === f.key ? 'bg-[#3D2914] text-white' : 'text-[#8B5A2B] hover:bg-[#E8D5C4]/30'
              }`}
            >
              {f.label}
              {f.key === 'pending' && filter === 'pending' && total > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">
                  {total}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B5A2B]/50" />
        <input
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          placeholder="Ürün adı, kullanıcı veya yorum içeriği ara..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E8D5C4]/50 text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-[#E8D5C4]/30 rounded w-1/3 mb-2" />
              <div className="h-3 bg-[#E8D5C4]/20 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-[#E8D5C4] mx-auto mb-3" />
          <p className="text-[#8B5A2B]">Bu filtreye uygun yorum bulunamadı.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Pagination */}
          {total > 15 && (
            <div className="flex justify-center gap-2 mt-6">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-lg bg-white border border-[#E8D5C4] text-sm text-[#3D2914] disabled:opacity-40">
                Önceki
              </button>
              <span className="px-4 py-2 text-sm text-[#8B5A2B]">Sayfa {page} / {Math.ceil(total / 15)}</span>
              <button disabled={page >= Math.ceil(total / 15)} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-lg bg-white border border-[#E8D5C4] text-sm text-[#3D2914] disabled:opacity-40">
                Sonraki
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const queryClient = useQueryClient();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState(review.admin_reply || '');

  const approveMutation = useMutation({
    mutationFn: () => approveReview(review.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminReviews'] }),
  });

  const replyMutation = useMutation({
    mutationFn: () => replyReview(review.id, replyText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      setShowReply(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteReview(review.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminReviews'] }),
  });

  const handleDelete = () => {
    if (window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate();
    }
  };

  const images = typeof review.images === 'string' ? JSON.parse(review.images) : (review.images || []);

  return (
    <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-4 sm:p-5">
      <div className="flex gap-3">
        {/* Product image */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-[#FAF6F0] shrink-0">
          <img
            src={review.product_image || 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=80&h=80&fit=crop'}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#3D2914]">{review.product_name}</p>
                <Link
                  to={`/product/${review.product_slug}`}
                  target="_blank"
                  className="text-[#C67D4A] hover:text-[#C67D4A]/70 transition-colors"
                  title="Ürün sayfasına git"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              <p className="text-xs text-[#8B5A2B] mt-0.5">
                {review.user_name || review.user_email || 'Anonim'} • {new Date(review.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {review.is_approved ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-green-700 bg-green-50">Onaylı</span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-amber-700 bg-amber-50">Bekliyor</span>
              )}
            </div>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-0.5 mt-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5" fill={i < review.rating ? '#D4A574' : 'transparent'} color="#D4A574" />
            ))}
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-sm text-[#3D2914] mt-2 leading-relaxed">{review.comment}</p>
          )}

          {/* Review images */}
          {images.length > 0 && (
            <div className="flex gap-2 mt-2">
              {images.map((img) => (
                <a key={img.id} href={img.firebase_url} target="_blank" rel="noopener noreferrer">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#FAF6F0] hover:opacity-80 transition-opacity">
                    <img src={img.firebase_url} alt="" className="w-full h-full object-cover" />
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Admin reply */}
          {review.admin_reply && !showReply && (
            <div className="mt-3 pl-3 border-l-2 border-[#C67D4A]">
              <p className="text-xs font-semibold text-[#C67D4A] mb-0.5">Satıcı Yanıtı</p>
              <p className="text-xs text-[#8B5A2B]">{review.admin_reply}</p>
            </div>
          )}

          {/* Reply form */}
          {showReply && (
            <div className="mt-3 p-3 bg-[#FAF6F0] rounded-lg">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Yanıtınızı yazın..."
                rows={2}
                className="w-full text-sm text-[#3D2914] px-3 py-2 rounded-lg border border-[#E8D5C4] focus:outline-none focus:border-[#C67D4A] resize-none mb-2"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowReply(false)} className="px-3 py-1.5 text-xs text-[#8B5A2B] hover:bg-[#E8D5C4]/30 rounded-lg">İptal</button>
                <button
                  onClick={() => replyMutation.mutate()}
                  disabled={!replyText.trim() || replyMutation.isPending}
                  className="px-3 py-1.5 text-xs bg-[#C67D4A] text-white font-medium rounded-lg hover:bg-[#C67D4A]/90 disabled:opacity-40 flex items-center gap-1"
                >
                  {replyMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Yanıtla
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#E8D5C4]/30">
            {!review.is_approved && (
              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#4A5D23] bg-[#4A5D23]/10 rounded-lg hover:bg-[#4A5D23]/20 transition-colors disabled:opacity-40"
              >
                {approveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                Onayla
              </button>
            )}
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#C67D4A] bg-[#C67D4A]/10 rounded-lg hover:bg-[#C67D4A]/20 transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              {review.admin_reply ? 'Yanıtı Düzenle' : 'Yanıtla'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-40 ml-auto"
            >
              <Trash2 className="w-3 h-3" /> Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
