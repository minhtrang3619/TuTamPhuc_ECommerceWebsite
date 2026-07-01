import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, User, Eye, Tag } from 'lucide-react';
import { blogService } from '@/services';
import type { BlogPost } from '@/types';
import { format } from 'date-fns';
import { getImageUrl } from '@/utils/productMapper';
import { vi } from 'date-fns/locale';


export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';
  };

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await blogService.getBySlug(slug);
        setPost(data);
      } catch (err: any) {
        console.error("Lỗi khi tải bài viết:", err);
        setError(err.response?.data?.detail || "Không tìm thấy bài viết.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-[#fcfaf7]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm font-medium">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center bg-[#fcfaf7] px-6 text-center">
        <h2 className="text-2xl font-serif font-bold text-primary mb-4">Opps!</h2>
        <p className="text-on-surface-variant text-sm mb-6">{error || "Bài viết không tồn tại hoặc đã bị xóa."}</p>
        <Link 
          to="/blog"
          className="px-6 py-2.5 bg-primary text-white text-xs uppercase font-bold tracking-widest rounded-sm hover:bg-[#2c160e] transition-colors"
        >
          Quay lại trang Blog
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="bg-[#fcfaf7] min-h-screen pt-24 pb-24 font-sans"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-12 w-full font-sans">
        
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mb-10 transition-all">
          <ChevronLeft size={16} /> Quay lại danh sách
        </Link>

        {post.tags && post.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-[10px] bg-[#ece0dc] text-[#5d4037] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="font-serif text-3xl md:text-5xl text-primary font-bold mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-on-surface-variant/70 font-semibold uppercase tracking-wider mb-10 border-b border-[#eeeeee] pb-6">
          <div className="flex items-center gap-1.5">
            <User size={14} />
            <span>{post.author?.full_name || 'Từ Tâm Phục'}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{post.created_at ? format(new Date(post.created_at), 'dd MMM, yyyy', { locale: vi }) : ''}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Eye size={14} />
            <span>{post.view_count || 0} lượt xem</span>
          </div>
        </div>

        {post.thumbnail && (
          <div className="aspect-video w-full rounded-lg overflow-hidden mb-12 shadow-sm border border-[#eeeeee]">
            <img src={getImageUrl(post.thumbnail)} alt={post.title} className="w-full h-full object-cover" onError={handleImageError} />
          </div>
        )}

        {post.excerpt && (
          <div className="text-base text-primary/80 font-serif font-semibold italic border-l-2 border-primary pl-4 mb-10">
            {post.excerpt}
          </div>
        )}

        <div 
          className="prose prose-stone prose-sm md:prose-base max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-primary prose-img:rounded-md prose-img:shadow-sm"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer actions */}
        <div className="mt-16 pt-8 border-t border-[#eeeeee] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
            <Tag size={16} />
            <span>Từ khóa:</span>
            {post.tags && post.tags.length > 0 ? (
              <div className="flex gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="text-primary">{tag}</span>
                ))}
              </div>
            ) : (
              <span className="font-normal">Chưa có từ khóa</span>
            )}
          </div>

          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Đã sao chép liên kết bài viết!");
            }}
            className="px-5 py-2.5 bg-[#ece0dc] hover:bg-[#d4c3be] text-[#5d4037] text-[10px] uppercase font-bold tracking-widest rounded-sm transition-colors cursor-pointer"
          >
            Chia sẻ bài viết
          </button>
        </div>

      </div>
    </motion.div>
  );
}
