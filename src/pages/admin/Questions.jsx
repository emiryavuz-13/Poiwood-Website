import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageCircleQuestion, Send, Loader2, CheckCircle2, Clock,
  Eye, EyeOff, Search, ExternalLink,
} from 'lucide-react';
import { getAdminQuestions, answerQuestion, toggleQuestionVisibility } from '../../api/admin';

const Questions = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminQuestions', filter, searchQuery, page],
    queryFn: () => getAdminQuestions({
      answered: filter === 'all' ? undefined : filter === 'answered' ? 'true' : 'false',
      search: searchQuery || undefined,
      page,
      limit: 15,
    }),
  });

  const questions = data?.questions || [];
  const total = data?.pagination?.total || 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2914]">Soru Yönetimi</h1>
          <p className="text-sm text-[#8B5A2B] mt-0.5">Müşteri sorularını görüntüleyin ve yanıtlayın.</p>
        </div>
        <div className="flex items-center gap-1 text-xs bg-white rounded-lg border border-[#E8D5C4]/50 p-1">
          {[
            { key: 'all', label: 'Tümü' },
            { key: 'unanswered', label: 'Cevaplanmamış' },
            { key: 'answered', label: 'Cevaplanmış' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filter === f.key ? 'bg-[#3D2914] text-white' : 'text-[#8B5A2B] hover:bg-[#E8D5C4]/30'
              }`}
            >
              {f.label}
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
          placeholder="Ürün adı, kullanıcı veya soru içeriği ara..."
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
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <MessageCircleQuestion className="w-12 h-12 text-[#E8D5C4] mx-auto mb-3" />
          <p className="text-[#8B5A2B]">Bu filtreye uygun soru bulunamadı.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
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

const QuestionCard = ({ question }) => {
  const queryClient = useQueryClient();
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerText, setAnswerText] = useState(question.answer_text || '');

  const answerMutation = useMutation({
    mutationFn: () => answerQuestion(question.id, answerText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
      setShowAnswer(false);
    },
  });

  const visibilityMutation = useMutation({
    mutationFn: () => toggleQuestionVisibility(question.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminQuestions'] }),
  });

  const isAnswered = !!question.answer_text;

  return (
    <div className="bg-white rounded-xl border border-[#E8D5C4]/50 p-4 sm:p-5">
      <div className="flex gap-3">
        {/* Product image */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-[#FAF6F0] shrink-0">
          <img
            src={question.product_image || 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=80&h=80&fit=crop'}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#3D2914]">{question.product_name}</p>
                <Link
                  to={`/product/${question.product_slug}`}
                  target="_blank"
                  className="text-[#C67D4A] hover:text-[#C67D4A]/70 transition-colors"
                  title="Ürün sayfasına git"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                {!question.is_visible && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Gizli</span>
                )}
              </div>
              <p className="text-xs text-[#8B5A2B] mt-0.5">
                {question.user_name || question.user_email || 'Anonim'} • {new Date(question.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {isAnswered ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-green-700 bg-green-50">Cevaplandı</span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-amber-700 bg-amber-50">Bekliyor</span>
              )}
            </div>
          </div>

          {/* Question text */}
          <div className="bg-[#FAF6F0] rounded-lg p-3 mt-2">
            <p className="text-sm text-[#3D2914] leading-relaxed">
              <span className="font-semibold text-[#8B5A2B]">S: </span>
              {question.question_text}
            </p>
          </div>

          {/* Existing answer */}
          {question.answer_text && !showAnswer && (
            <div className="mt-2 pl-3 border-l-2 border-[#4A5D23]">
              <p className="text-xs font-semibold text-[#4A5D23] mb-0.5">Cevap</p>
              <p className="text-xs text-[#3D2914]">{question.answer_text}</p>
              {question.answered_at && (
                <p className="text-[10px] text-[#8B5A2B] mt-1">
                  {new Date(question.answered_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          )}

          {/* Answer form */}
          {showAnswer && (
            <div className="mt-3 p-3 bg-[#FAF6F0] rounded-lg">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Cevabınızı yazın..."
                rows={3}
                className="w-full text-sm text-[#3D2914] px-3 py-2 rounded-lg border border-[#E8D5C4] focus:outline-none focus:border-[#4A5D23] resize-none mb-2"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAnswer(false)} className="px-3 py-1.5 text-xs text-[#8B5A2B] hover:bg-[#E8D5C4]/30 rounded-lg">
                  İptal
                </button>
                <button
                  onClick={() => answerMutation.mutate()}
                  disabled={!answerText.trim() || answerMutation.isPending}
                  className="px-3 py-1.5 text-xs bg-[#4A5D23] text-white font-medium rounded-lg hover:bg-[#4A5D23]/90 disabled:opacity-40 flex items-center gap-1"
                >
                  {answerMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  {isAnswered ? 'Güncelle' : 'Cevapla'}
                </button>
              </div>
              {answerMutation.isError && (
                <p className="text-xs text-red-500 mt-1">{answerMutation.error?.response?.data?.message || 'Hata oluştu'}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#E8D5C4]/30">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#4A5D23] bg-[#4A5D23]/10 rounded-lg hover:bg-[#4A5D23]/20 transition-colors"
            >
              <Send className="w-3 h-3" />
              {isAnswered ? 'Cevabı Düzenle' : 'Cevapla'}
            </button>
            <button
              onClick={() => visibilityMutation.mutate()}
              disabled={visibilityMutation.isPending}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 ml-auto ${
                question.is_visible
                  ? 'text-[#8B5A2B] bg-[#E8D5C4]/30 hover:bg-[#E8D5C4]/50'
                  : 'text-[#C67D4A] bg-[#C67D4A]/10 hover:bg-[#C67D4A]/20'
              }`}
            >
              {visibilityMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : question.is_visible ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
              {question.is_visible ? 'Gizle' : 'Göster'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questions;
