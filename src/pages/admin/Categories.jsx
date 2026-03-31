import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit3, Trash2, X, Save, Loader2, FolderTree } from 'lucide-react';
import { getAllCategories } from '../../api/categories';
import { createCategory, updateCategory, deleteCategory } from '../../api/admin';

const Categories = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', parent_id: '' });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCreate(false);
      setForm({ name: '', slug: '', description: '', parent_id: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const toSlug = (str) =>
    str.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleCreate = () => {
    const data = {
      name: form.name,
      slug: form.slug || toSlug(form.name),
      description: form.description || undefined,
    };
    if (form.parent_id) data.parent_id = form.parent_id;
    createMutation.mutate(data);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Flatten categories for display
  const flatCategories = [];
  const flatten = (cats, depth = 0) => {
    (cats || []).forEach((cat) => {
      flatCategories.push({ ...cat, depth });
      if (cat.children) flatten(cat.children, depth + 1);
    });
  };
  flatten(categories);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2914]">Kategori Yönetimi</h1>
          <p className="text-sm text-[#8B5A2B] mt-0.5">Ürün kategorilerini oluşturun ve düzenleyin.</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setForm({ name: '', slug: '', description: '', parent_id: '' }); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C67D4A] text-white text-sm font-medium hover:bg-[#C67D4A]/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Yeni Kategori
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-5 mb-4">
          <h3 className="text-sm font-bold text-[#3D2914] mb-3">Yeni Kategori Ekle</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Kategori adı *"
              className="px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
            />
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="Slug (otomatik oluşturulur)"
              className="px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
            />
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Açıklama (opsiyonel)"
              className="px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
            />
            <select
              value={form.parent_id}
              onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] bg-white focus:outline-none focus:border-[#C67D4A]"
            >
              <option value="">Üst kategori yok (Ana)</option>
              {flatCategories.map((c) => (
                <option key={c.id} value={c.id}>{'—'.repeat(c.depth)} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-sm text-[#8B5A2B] hover:bg-[#E8D5C4]/20 rounded-lg">İptal</button>
            <button
              onClick={handleCreate}
              disabled={!form.name || createMutation.isPending}
              className="px-4 py-1.5 text-sm bg-[#4A5D23] text-white font-medium rounded-lg hover:bg-[#4A5D23]/90 disabled:opacity-40 flex items-center gap-1.5"
            >
              {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Kaydet
            </button>
          </div>
          {createMutation.isError && <p className="text-xs text-red-500 mt-2">{createMutation.error?.response?.data?.message || 'Hata'}</p>}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-[#E8D5C4]/30 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : flatCategories.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <FolderTree className="w-12 h-12 text-[#E8D5C4] mx-auto mb-3" />
          <p className="text-[#8B5A2B]">Henüz kategori oluşturulmamış.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8D5C4]/50 divide-y divide-[#E8D5C4]/30">
          {flatCategories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              editing={editingId === cat.id}
              onEdit={() => setEditingId(cat.id)}
              onCancel={() => setEditingId(null)}
              onSave={(data) => updateMutation.mutate({ id: cat.id, data })}
              onDelete={() => handleDelete(cat.id, cat.name)}
              saving={updateMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryRow = ({ category, editing, onEdit, onCancel, onSave, onDelete, saving }) => {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || '');

  if (editing) {
    return (
      <div className="px-4 py-3 flex items-center gap-3">
        <div style={{ width: category.depth * 20 }} className="shrink-0" />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-3 py-1.5 rounded-lg border border-[#C67D4A] text-sm text-[#3D2914] focus:outline-none"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Açıklama"
          className="flex-1 px-3 py-1.5 rounded-lg border border-[#E8D5C4] text-sm text-[#3D2914] focus:outline-none focus:border-[#C67D4A]"
        />
        <button onClick={() => onSave({ name, description: description || undefined })} disabled={saving} className="p-1.5 rounded-lg bg-[#4A5D23] text-white hover:bg-[#4A5D23]/90">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        </button>
        <button onClick={onCancel} className="p-1.5 rounded-lg text-[#8B5A2B] hover:bg-[#E8D5C4]/30">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 flex items-center gap-3 hover:bg-[#FAF6F0]/50 transition-colors">
      <div style={{ width: category.depth * 20 }} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-[#3D2914]">{category.name}</span>
        {category.description && <span className="text-xs text-[#8B5A2B] ml-2">— {category.description}</span>}
        <span className="text-xs text-[#8B5A2B]/50 ml-2 font-mono">/{category.slug}</span>
      </div>
      <button onClick={onEdit} className="p-1.5 rounded-lg text-[#8B5A2B] hover:bg-[#E8D5C4]/30 hover:text-[#C67D4A]">
        <Edit3 className="w-4 h-4" />
      </button>
      <button onClick={onDelete} className="p-1.5 rounded-lg text-[#8B5A2B] hover:bg-red-50 hover:text-red-500">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Categories;
