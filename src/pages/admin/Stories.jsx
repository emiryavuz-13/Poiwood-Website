import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminStories, createStoryGroup, updateStoryGroup, deleteStoryGroup,
  createStory, updateStory, deleteStory,
} from '../../api/admin';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { optimizeImage } from '../../utils/imageOptimizer';
import {
  Plus, Trash2, Edit3, Eye, EyeOff, GripVertical, Image as ImageIcon,
  ChevronDown, ChevronUp, X, Save, Loader2,
} from 'lucide-react';

const AdminStories = () => {
  const queryClient = useQueryClient();
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [groupForm, setGroupForm] = useState(null); // null | { mode: 'create' } | { mode: 'edit', id, ... }
  const [storyForm, setStoryForm] = useState(null); // null | { mode: 'create', groupId } | { mode: 'edit', id, groupId, ... }
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const coverInputRef = useRef(null);
  const storyImageRef = useRef(null);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['adminStories'],
    queryFn: getAdminStories,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['adminStories'] });

  // === GROUP MUTATIONS ===
  const createGroupMut = useMutation({ mutationFn: createStoryGroup, onSuccess: invalidate });
  const updateGroupMut = useMutation({ mutationFn: ({ id, data }) => updateStoryGroup(id, data), onSuccess: invalidate });
  const deleteGroupMut = useMutation({ mutationFn: deleteStoryGroup, onSuccess: invalidate });

  // === STORY MUTATIONS ===
  const createStoryMut = useMutation({ mutationFn: ({ groupId, data }) => createStory(groupId, data), onSuccess: invalidate });
  const updateStoryMut = useMutation({ mutationFn: ({ id, data }) => updateStory(id, data), onSuccess: invalidate });
  const deleteStoryMut = useMutation({ mutationFn: deleteStory, onSuccess: invalidate });

  // === UPLOAD HELPER ===
  const uploadImage = async (file, folder, maxSize = 1200) => {
    const { blob } = await optimizeImage(file, { maxSize, quality: 0.88 });
    const ts = Date.now();
    const path = `stories/${folder}/${ts}.webp`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob, { contentType: 'image/webp' });
    return getDownloadURL(storageRef);
  };

  // === GROUP FORM HANDLERS ===
  const openGroupCreate = () => {
    setGroupForm({ mode: 'create', name: '', cover_image: '', display_order: groups.length, is_visible: true });
    setStoryForm(null);
  };

  const openGroupEdit = (g) => {
    setGroupForm({ mode: 'edit', id: g.id, name: g.name, cover_image: g.cover_image, display_order: g.display_order, is_visible: g.is_visible });
    setStoryForm(null);
  };

  const handleGroupCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('Kapak yükleniyor...');
    try {
      const url = await uploadImage(file, 'covers', 800);
      setGroupForm((f) => ({ ...f, cover_image: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      setUploadMsg('');
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const saveGroup = async () => {
    if (!groupForm.name.trim() || !groupForm.cover_image) return;
    const data = {
      name: groupForm.name.trim(),
      cover_image: groupForm.cover_image,
      display_order: Number(groupForm.display_order) || 0,
      is_visible: groupForm.is_visible,
    };
    if (groupForm.mode === 'create') await createGroupMut.mutateAsync(data);
    else await updateGroupMut.mutateAsync({ id: groupForm.id, data });
    setGroupForm(null);
  };

  const removeGroup = async (id) => {
    if (!confirm('Bu grubu ve tüm hikayelerini silmek istediğinize emin misiniz?')) return;
    await deleteGroupMut.mutateAsync(id);
    if (expandedGroup === id) setExpandedGroup(null);
  };

  // === STORY FORM HANDLERS ===
  const openStoryCreate = (groupId) => {
    const groupStories = groups.find((g) => g.id === groupId)?.stories || [];
    setStoryForm({ mode: 'create', groupId, title: '', image_url: '', description: '', display_order: groupStories.length, is_visible: true });
    setGroupForm(null);
  };

  const openStoryEdit = (s, groupId) => {
    setStoryForm({ mode: 'edit', id: s.id, groupId, title: s.title || '', image_url: s.image_url, description: s.description || '', display_order: s.display_order, is_visible: s.is_visible });
    setGroupForm(null);
  };

  const handleStoryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('Hikaye görseli yükleniyor...');
    try {
      const url = await uploadImage(file, 'items', 1600);
      setStoryForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      setUploadMsg('');
      if (storyImageRef.current) storyImageRef.current.value = '';
    }
  };

  const saveStory = async () => {
    if (!storyForm.image_url) return;
    const data = {
      title: (storyForm.title || '').trim() || null,
      image_url: storyForm.image_url,
      description: storyForm.description.trim() || null,
      display_order: Number(storyForm.display_order) || 0,
      is_visible: storyForm.is_visible,
    };
    if (storyForm.mode === 'create') await createStoryMut.mutateAsync({ groupId: storyForm.groupId, data });
    else await updateStoryMut.mutateAsync({ id: storyForm.id, data });
    setStoryForm(null);
  };

  const removeStory = async (id) => {
    if (!confirm('Bu hikayeyi silmek istediğinize emin misiniz?')) return;
    await deleteStoryMut.mutateAsync(id);
  };

  const isSaving = createGroupMut.isPending || updateGroupMut.isPending || createStoryMut.isPending || updateStoryMut.isPending;

  // === RENDER ===
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-[#E8D5C4]/50 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#3D2914]">Öne Çıkanlar (Hikayeler)</h1>
        <button
          onClick={openGroupCreate}
          className="flex items-center gap-2 bg-[#3D2914] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2a1c0d] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Grup
        </button>
      </div>

      {/* Upload overlay */}
      {uploading && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl px-6 py-4 flex items-center gap-3 shadow-lg">
            <Loader2 className="w-5 h-5 animate-spin text-[#C67D4A]" />
            <span className="text-sm text-[#3D2914]">{uploadMsg}</span>
          </div>
        </div>
      )}

      {/* GROUP FORM */}
      {groupForm && (
        <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#3D2914]">
            {groupForm.mode === 'create' ? 'Yeni Grup Oluştur' : 'Grubu Düzenle'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8B5A2B] mb-1">Grup Adı</label>
              <input
                type="text"
                value={groupForm.name}
                onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-[#E8D5C4] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C67D4A]/30 focus:border-[#C67D4A] outline-none"
                placeholder="Örn: Yeni Ürünler"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8B5A2B] mb-1">Sıra</label>
              <input
                type="number"
                value={groupForm.display_order}
                onChange={(e) => setGroupForm((f) => ({ ...f, display_order: e.target.value }))}
                className="w-full border border-[#E8D5C4] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C67D4A]/30 focus:border-[#C67D4A] outline-none"
              />
            </div>
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-xs font-medium text-[#8B5A2B] mb-1">Kapak Görseli</label>
            <div className="flex items-center gap-4">
              {groupForm.cover_image ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#E8D5C4] shrink-0">
                  <img src={groupForm.cover_image} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#FAF6F0] border-2 border-dashed border-[#E8D5C4] flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5 text-[#D4A574]" />
                </div>
              )}
              <div>
                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleGroupCoverUpload} className="hidden" />
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="text-sm text-[#C67D4A] hover:text-[#8B5A2B] font-medium"
                >
                  {groupForm.cover_image ? 'Değiştir' : 'Görsel Yükle'}
                </button>
              </div>
            </div>
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGroupForm((f) => ({ ...f, is_visible: !f.is_visible }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${groupForm.is_visible ? 'bg-[#4A5D23]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${groupForm.is_visible ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm text-[#3D2914]">{groupForm.is_visible ? 'Görünür' : 'Gizli'}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={saveGroup}
              disabled={!groupForm.name.trim() || !groupForm.cover_image || isSaving}
              className="flex items-center gap-2 bg-[#3D2914] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2a1c0d] transition-colors disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              Kaydet
            </button>
            <button
              onClick={() => setGroupForm(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#8B5A2B] hover:bg-[#E8D5C4]/30 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* STORY FORM */}
      {storyForm && (
        <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#3D2914]">
            {storyForm.mode === 'create' ? 'Yeni Hikaye Ekle' : 'Hikayeyi Düzenle'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8B5A2B] mb-1">Başlık</label>
              <input
                type="text"
                value={storyForm.title}
                onChange={(e) => setStoryForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-[#E8D5C4] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C67D4A]/30 focus:border-[#C67D4A] outline-none"
                placeholder="Hikaye başlığı"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8B5A2B] mb-1">Sıra</label>
              <input
                type="number"
                value={storyForm.display_order}
                onChange={(e) => setStoryForm((f) => ({ ...f, display_order: e.target.value }))}
                className="w-full border border-[#E8D5C4] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C67D4A]/30 focus:border-[#C67D4A] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8B5A2B] mb-1">Açıklama (opsiyonel)</label>
            <textarea
              value={storyForm.description}
              onChange={(e) => setStoryForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border border-[#E8D5C4] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C67D4A]/30 focus:border-[#C67D4A] outline-none resize-none"
              placeholder="Kısa bir açıklama..."
            />
          </div>

          {/* Story image */}
          <div>
            <label className="block text-xs font-medium text-[#8B5A2B] mb-1">Hikaye Görseli</label>
            <div className="flex items-start gap-4">
              {storyForm.image_url ? (
                <div className="w-24 h-40 rounded-lg overflow-hidden border border-[#E8D5C4] shrink-0">
                  <img src={storyForm.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-40 rounded-lg bg-[#FAF6F0] border-2 border-dashed border-[#E8D5C4] flex items-center justify-center shrink-0">
                  <ImageIcon className="w-6 h-6 text-[#D4A574]" />
                </div>
              )}
              <div>
                <input ref={storyImageRef} type="file" accept="image/*" onChange={handleStoryImageUpload} className="hidden" />
                <button
                  onClick={() => storyImageRef.current?.click()}
                  className="text-sm text-[#C67D4A] hover:text-[#8B5A2B] font-medium"
                >
                  {storyForm.image_url ? 'Değiştir' : 'Görsel Yükle'}
                </button>
                <p className="text-[10px] text-[#8B5A2B]/60 mt-1">Dikey (9:16) görsel önerilir</p>
              </div>
            </div>
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStoryForm((f) => ({ ...f, is_visible: !f.is_visible }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${storyForm.is_visible ? 'bg-[#4A5D23]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${storyForm.is_visible ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm text-[#3D2914]">{storyForm.is_visible ? 'Görünür' : 'Gizli'}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={saveStory}
              disabled={!storyForm.image_url || isSaving}
              className="flex items-center gap-2 bg-[#3D2914] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2a1c0d] transition-colors disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              Kaydet
            </button>
            <button
              onClick={() => setStoryForm(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#8B5A2B] hover:bg-[#E8D5C4]/30 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* GROUPS LIST */}
      {groups.length === 0 && !groupForm ? (
        <div className="text-center py-16 text-[#8B5A2B]/60">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Henüz hikaye grubu yok.</p>
          <p className="text-xs mt-1">Yukarıdaki "Yeni Grup" butonuyla başlayın.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => {
            const isOpen = expandedGroup === g.id;
            const stories = g.stories || [];
            return (
              <div key={g.id} className="bg-white rounded-xl border border-[#E8D5C4]/50 overflow-hidden">
                {/* Group header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#FAF6F0]/50 transition-colors"
                  onClick={() => setExpandedGroup(isOpen ? null : g.id)}
                >
                  <GripVertical className="w-4 h-4 text-[#D4A574]/50 shrink-0 hidden sm:block" />
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#E8D5C4] shrink-0">
                    <img src={g.cover_image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#3D2914] truncate">{g.name}</span>
                      {!g.is_visible && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Gizli</span>
                      )}
                    </div>
                    <span className="text-xs text-[#8B5A2B]/60">{stories.length} hikaye · Sıra: {g.display_order}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); openGroupEdit(g); }}
                      className="p-1.5 rounded-lg text-[#8B5A2B] hover:bg-[#E8D5C4]/30 transition-colors"
                      title="Düzenle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeGroup(g.id); }}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#8B5A2B]" /> : <ChevronDown className="w-4 h-4 text-[#8B5A2B]" />}
                  </div>
                </div>

                {/* Stories inside group */}
                {isOpen && (
                  <div className="border-t border-[#E8D5C4]/30 bg-[#FAF6F0]/30">
                    {stories.length === 0 ? (
                      <p className="text-center text-sm text-[#8B5A2B]/50 py-6">Bu grupta henüz hikaye yok.</p>
                    ) : (
                      <div className="divide-y divide-[#E8D5C4]/20">
                        {stories.map((s) => (
                          <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                            <div className="w-10 h-16 rounded-md overflow-hidden border border-[#E8D5C4] shrink-0">
                              <img src={s.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#3D2914] truncate">{s.title}</span>
                                {!s.is_visible && <EyeOff className="w-3 h-3 text-gray-400 shrink-0" />}
                              </div>
                              {s.description && (
                                <p className="text-xs text-[#8B5A2B]/60 truncate">{s.description}</p>
                              )}
                              <span className="text-[10px] text-[#8B5A2B]/40">Sıra: {s.display_order}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => openStoryEdit(s, g.id)}
                                className="p-1.5 rounded-lg text-[#8B5A2B] hover:bg-[#E8D5C4]/30 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => removeStory(s.id)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add story button */}
                    <div className="px-4 py-3 border-t border-[#E8D5C4]/20">
                      <button
                        onClick={() => openStoryCreate(g.id)}
                        className="flex items-center gap-2 text-sm text-[#C67D4A] hover:text-[#8B5A2B] font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Hikaye Ekle
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminStories;
