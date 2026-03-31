import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { optimizeImage } from '../../utils/imageOptimizer';
import {
  User, Package, Star, ChevronRight, Truck, Clock, CheckCircle2,
  XCircle, CreditCard, MapPin, Phone, Mail, Edit3, Save, X,
  ShoppingBag, MessageSquare, AlertCircle, Camera, Loader2, Trash2,
} from 'lucide-react';
import { getMyOrders } from '../../api/orders';
import { getMyReviews, createReview, addReviewImage } from '../../api/reviews';
import { updateProfile } from '../../api/profile';
import { login as loginAction } from '../../store/slices/authSlice';
import ReviewLightbox from '../../components/ReviewLightbox';
import { Skeleton } from '../../components/ui/skeleton';

const TABS = [
  { id: 'profile', label: 'Profilim', icon: User },
  { id: 'orders', label: 'Siparişlerim', icon: Package },
  { id: 'reviews', label: 'Değerlendirmelerim', icon: Star },
];

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-[#FAF6F0] animate-page-in">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#E8D5C4]/40 to-transparent">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#C67D4A] to-[#D4A574] flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
              {user?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#3D2914]">
                {user?.display_name || 'Kullanıcı'}
              </h1>
              <p className="text-sm text-[#8B5A2B]">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pb-12">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl card-shadow p-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap px-3 ${
                  isActive
                    ? 'bg-[#C67D4A] text-white shadow-md'
                    : 'text-[#8B5A2B] hover:bg-[#E8D5C4]/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'reviews' && <ReviewsTab />}
      </div>
    </div>
  );
};

/* ============================================================
   PROFİL SEKMESİ
   ============================================================ */
const ProfileTab = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    display_name: user?.display_name || '',
    phone: user?.phone || '',
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      dispatch(loginAction({ user: { ...user, ...data }, token: null }));
      setEditing(false);
    },
  });

  const handleSave = () => {
    mutation.mutate({ display_name: form.display_name, phone: form.phone });
  };

  return (
    <div className="bg-white rounded-2xl card-shadow p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-heading font-bold text-[#3D2914]">Kişisel Bilgiler</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm text-[#C67D4A] font-medium hover:underline"
          >
            <Edit3 className="w-4 h-4" /> Düzenle
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(false); setForm({ display_name: user?.display_name || '', phone: user?.phone || '' }); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E8D5C4] text-[#8B5A2B] text-sm hover:bg-[#E8D5C4]/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> İptal
            </button>
            <button
              onClick={handleSave}
              disabled={mutation.isPending}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4A5D23] text-white text-sm font-medium hover:bg-[#4A5D23]/90 transition-colors disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" /> {mutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <InfoRow icon={User} label="Ad Soyad" value={form.display_name} editing={editing} onChange={(v) => setForm(f => ({ ...f, display_name: v }))} />
        <InfoRow icon={Mail} label="E-posta" value={user?.email || ''} />
        <InfoRow icon={Phone} label="Telefon" value={form.phone} editing={editing} onChange={(v) => setForm(f => ({ ...f, phone: v }))} placeholder="05XX XXX XX XX" />
      </div>

      {mutation.isError && (
        <p className="text-red-500 text-sm mt-4">{mutation.error?.response?.data?.message || 'Güncelleme başarısız'}</p>
      )}
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value, editing, onChange, placeholder }) => (
  <div className="flex items-center gap-3 py-2 border-b border-[#E8D5C4]/30 last:border-0">
    <Icon className="w-4 h-4 text-[#C67D4A] shrink-0" />
    <span className="text-sm text-[#8B5A2B] w-24 shrink-0">{label}</span>
    {editing && onChange ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-sm text-[#3D2914] px-3 py-1.5 rounded-lg border border-[#E8D5C4] focus:outline-none focus:border-[#C67D4A] transition-colors"
      />
    ) : (
      <span className="text-sm font-medium text-[#3D2914]">{value || '—'}</span>
    )}
  </div>
);

/* ============================================================
   SİPARİŞLERİM SEKMESİ
   ============================================================ */
const STATUS_MAP = {
  pending: { label: 'Onay Bekliyor', color: 'text-amber-600 bg-amber-50', icon: Clock },
  paid: { label: 'Ödeme Alındı', color: 'text-blue-600 bg-blue-50', icon: CreditCard },
  processing: { label: 'Hazırlanıyor', color: 'text-indigo-600 bg-indigo-50', icon: Package },
  shipped: { label: 'Kargoda', color: 'text-purple-600 bg-purple-50', icon: Truck },
  delivered: { label: 'Teslim Edildi', color: 'text-[#4A5D23] bg-[#4A5D23]/10', icon: CheckCircle2 },
  cancelled: { label: 'İptal Edildi', color: 'text-red-600 bg-red-50', icon: XCircle },
  refunded: { label: 'İade Edildi', color: 'text-gray-600 bg-gray-100', icon: XCircle },
};

const OrdersTab = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: getMyOrders,
  });

  const { data: myReviews } = useQuery({
    queryKey: ['myReviews'],
    queryFn: getMyReviews,
  });

  const reviewedProductIds = new Set(
    (myReviews || []).map((r) => r.product_id)
  );

  if (isLoading) return <TabSkeleton rows={3} />;

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl card-shadow p-8 text-center">
        <ShoppingBag className="w-12 h-12 text-[#E8D5C4] mx-auto mb-3" />
        <p className="text-[#8B5A2B] mb-4">Henüz siparişiniz bulunmuyor.</p>
        <Link to="/products" className="text-sm text-[#C67D4A] font-semibold hover:underline">
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} reviewedProductIds={reviewedProductIds} />
      ))}
    </div>
  );
};

const OrderCard = ({ order, reviewedProductIds }) => {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const StatusIcon = status.icon;

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['orderDetail', order.id],
    queryFn: () => import('../../api/orders').then(m => m.getOrderDetail(order.id)),
    enabled: expanded,
  });

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      {/* Summary */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 sm:p-5 flex items-center gap-3 sm:gap-4 text-left hover:bg-[#FAF6F0]/50 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${status.color}`}>
          <StatusIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-[#3D2914] font-mono">{order.order_number}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-[#8B5A2B]">
            <span>{new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>{order.item_count} ürün</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-base font-bold text-[#C67D4A]">
            {Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
          </span>
        </div>
        <ChevronRight className={`w-4 h-4 text-[#8B5A2B]/40 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Detail */}
      {expanded && (
        <div className="border-t border-[#E8D5C4]/50 px-4 sm:px-5 py-4 bg-[#FAF6F0]/30">
          {detailLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : detail?.items ? (
            <>
              {/* Items */}
              <div className="space-y-2 mb-4">
                {detail.items.map((item) => {
                  const alreadyReviewed = reviewedProductIds.has(item.product_id);
                  return (
                    <div key={item.id} className="bg-white rounded-xl p-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#FAF6F0] shrink-0">
                          <img
                            src={item.product_image_url || 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=100&h=100&fit=crop'}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#3D2914] line-clamp-1">{item.product_name}</p>
                          <p className="text-xs text-[#8B5A2B]">{item.quantity} adet × {Number(item.unit_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺</p>
                        </div>
                        <span className="text-sm font-semibold text-[#3D2914] shrink-0">
                          {Number(item.total_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
                        </span>
                      </div>

                      {/* Review button per item */}
                      {order.status === 'delivered' && item.product_id && (
                        alreadyReviewed ? (
                          <div className="mt-2 ml-15 flex items-center gap-1.5 text-xs text-[#4A5D23] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Değerlendirildi
                          </div>
                        ) : (
                          <ReviewButton item={item} orderId={order.id} />
                        )
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Shipping info */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#8B5A2B]">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {detail.shipping_city}, {detail.shipping_district}</span>
                {detail.cargo_company && (
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> {detail.cargo_company} — Takip No: <span className="font-mono font-medium text-[#3D2914]">{detail.cargo_tracking_no}</span></span>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   YORUM YAZMA BUTONU
   ============================================================ */
const ReviewButton = ({ item, orderId }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]); // { file, preview }
  const [uploading, setUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      // 1. Yorumu oluştur
      const review = await createReview(data);

      // 2. Resim varsa Firebase'e yükle ve backend'e kaydet
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const { blob } = await optimizeImage(img.file, { maxSize: 1200, quality: 0.92 });
          const storagePath = `reviews/${review.id}/${Date.now()}_${i}.webp`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, blob, { contentType: 'image/webp' });
          const firebaseUrl = await getDownloadURL(storageRef);
          await addReviewImage(review.id, {
            firebase_url: firebaseUrl,
            storage_path: storagePath,
            display_order: i,
          });
        }
      }

      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
      setShowForm(false);
      setImages([]);
    },
    onMutate: () => setUploading(true),
    onSettled: () => setUploading(false),
  });

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) return;

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, 3));
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  if (!item.product_id) return null;

  return (
    <div className="mt-2 ml-15">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-xs text-[#C67D4A] font-medium hover:underline"
        >
          <Star className="w-3.5 h-3.5" /> Değerlendir
        </button>
      ) : (
        <div className="bg-[#FAF6F0] rounded-xl p-3 mt-1">
          <p className="text-xs font-medium text-[#3D2914] mb-2">{item.product_name}</p>

          {/* Stars */}
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} type="button">
                <Star className="w-5 h-5" fill={s <= rating ? '#D4A574' : 'transparent'} color="#D4A574" />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Yorumunuzu yazın (opsiyonel)"
            rows={2}
            className="w-full text-sm text-[#3D2914] px-3 py-2 rounded-lg border border-[#E8D5C4] focus:outline-none focus:border-[#C67D4A] resize-none mb-2"
          />

          {/* Image upload */}
          <div className="mb-3">
            {images.length > 0 && (
              <div className="flex gap-2 mb-2">
                {images.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 3 && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-[#8B5A2B] hover:text-[#C67D4A] transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Fotoğraf Ekle ({images.length}/3)
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setImages([]); }}
              className="px-3 py-1.5 text-xs text-[#8B5A2B] hover:bg-[#E8D5C4]/20 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              onClick={() => mutation.mutate({ product_id: item.product_id, order_id: orderId, rating, comment: comment || null })}
              disabled={mutation.isPending || uploading}
              className="px-4 py-1.5 text-xs bg-[#C67D4A] text-white font-medium rounded-lg hover:bg-[#C67D4A]/90 transition-colors disabled:opacity-60 flex items-center gap-1.5"
            >
              {(mutation.isPending || uploading) && <Loader2 className="w-3 h-3 animate-spin" />}
              {(mutation.isPending || uploading) ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>

          {mutation.isError && (
            <p className="text-red-500 text-xs mt-1">
              {mutation.error?.response?.data?.message || 'Yorum gönderilemedi'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   DEĞERLENDİRMELERİM SEKMESİ
   ============================================================ */
const ReviewsTab = () => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['myReviews'],
    queryFn: getMyReviews,
  });
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

  if (isLoading) return <TabSkeleton rows={2} />;

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl card-shadow p-8 text-center">
        <MessageSquare className="w-12 h-12 text-[#E8D5C4] mx-auto mb-3" />
        <p className="text-[#8B5A2B] mb-2">Henüz değerlendirme yapmadınız.</p>
        <p className="text-xs text-[#8B5A2B]/60">Teslim edilen siparişlerinizden yorum yapabilirsiniz.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl card-shadow p-4 sm:p-5">
            <div className="flex gap-3">
              {/* Product image */}
              <Link to={`/product/${review.product_slug}`} className="shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#FAF6F0]">
                  <img
                    src={review.product_image || 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=100&h=100&fit=crop'}
                    alt={review.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/product/${review.product_slug}`} className="text-sm font-semibold text-[#3D2914] hover:text-[#C67D4A] transition-colors line-clamp-1">
                  {review.product_name}
                </Link>

                {/* Stars */}
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5" fill={i < review.rating ? '#D4A574' : 'transparent'} color="#D4A574" />
                  ))}
                  <span className="text-xs text-[#8B5A2B] ml-1">
                    {new Date(review.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {review.comment && (
                  <p className="text-sm text-[#3D2914] mt-2 leading-relaxed">{review.comment}</p>
                )}

                {/* Review images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {review.images.map((img, imgIndex) => (
                      <button
                        key={img.id}
                        onClick={() => setLightbox({ open: true, images: review.images, index: imgIndex })}
                        className="shrink-0"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#FAF6F0] hover:opacity-80 transition-opacity">
                          <img src={img.firebase_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Approval status */}
                <div className="mt-2">
                  {review.is_approved ? (
                    <span className="inline-flex items-center gap-1 text-xs text-[#4A5D23] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Yayında
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                      <Clock className="w-3.5 h-3.5" /> Onay bekliyor
                    </span>
                  )}
                </div>

                {/* Admin reply */}
                {review.admin_reply && (
                  <div className="mt-2 pl-3 border-l-2 border-[#C67D4A]">
                    <p className="text-xs font-semibold text-[#C67D4A] mb-0.5">Satıcı Yanıtı</p>
                    <p className="text-xs text-[#8B5A2B]">{review.admin_reply}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightbox.open && (
        <ReviewLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox({ open: false, images: [], index: 0 })}
        />
      )}
    </>
  );
};

/* ============================================================
   SKELETON
   ============================================================ */
const TabSkeleton = ({ rows = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl card-shadow p-5">
        <div className="flex gap-4">
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default Profile;
