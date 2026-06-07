/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BlogItem } from "../types";
import { Compass, Clock, ArrowLeft, ArrowRight, Share2 } from "lucide-react";

interface BlogSectionProps {
  blogs: BlogItem[];
}

export default function BlogSection({ blogs }: BlogSectionProps) {
  const [selectedPost, setSelectedPost] = React.useState<BlogItem | null>(null);

  const handleShare = (title: string) => {
    alert(`A Di Đà Phật! Đạo hữu đã chép liên kết gieo duyên bài viết "${title}" thành công. Hoan hỷ chia sẻ Phật pháp là duyên phước vô biên.`);
  };

  return (
    <div className="w-full" id="blogs-section-wrapper">
      {selectedPost ? (
        /* Immersive single article reading view */
        <div className="max-w-3xl mx-auto flex flex-col gap-6" id="blog-reading-view">
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-primary hover:underline cursor-pointer py-1 self-start"
            id="back-to-blogs-btn"
          >
            <ArrowLeft size={13} /> Quay lại tờ gieo duyên (blog)
          </button>

          {/* Heading info */}
          <div className="text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-brown bg-brand-sand px-2.5 py-1 rounded-sm">
              {selectedPost.category}
            </span>
            <h1 className="font-serif-elegant text-2xl md:text-3.5xl text-brand-primary font-bold tracking-wide mt-3 mb-2 leading-tight">
              {selectedPost.title}
            </h1>
            <div className="flex justify-center md:justify-start items-center gap-4 text-xs text-brand-secondary/80">
              <span className="flex items-center gap-1.5 font-medium">
                <Compass size={13} /> {selectedPost.date}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock size={13} /> {selectedPost.readTime}
              </span>
            </div>
          </div>

          {/* Large Header Banner image */}
          <div className="w-full aspect-[16/9] overflow-hidden rounded-sm shadow-sm bg-brand-ivory mt-2">
            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Content copy */}
          <div className="text-sm text-brand-secondary/95 leading-relaxed font-serif-elegant italic text-base border-l-4 border-brand-primary pl-4 my-2">
            "{selectedPost.excerpt}"
          </div>

          <div 
            className="text-sm text-brand-dark leading-loose flex flex-col gap-6" 
            dangerouslySetInnerHTML={{ __html: selectedPost.content.replace(/\.\s(.*)/g, ".<br/><br/>$1") }}
          />

          <div className="w-full h-px bg-brand-sand mt-8"></div>

          {/* Action footer */}
          <div className="flex justify-between items-center py-4 text-xs font-semibold">
            <button
              onClick={() => setSelectedPost(null)}
              className="text-brand-secondary hover:text-brand-primary transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Tất cả bài viết
            </button>
            <button
              onClick={() => handleShare(selectedPost.title)}
              className="text-brand-primary hover:text-brand-brown transition-colors flex items-center gap-1.5"
            >
              <Share2 size={14} /> Gieo duyên bài viết này
            </button>
          </div>
        </div>
      ) : (
        /* Grid index of articles */
        <div className="flex flex-col gap-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary bg-brand-sand px-3 py-1.5 rounded-sm">
              Trang Góc Nhìn
            </span>
            <h2 className="font-serif-elegant text-3xl text-brand-primary mt-3 mb-3 font-semibold tracking-wide">
              Tờ Gieo Duyên
            </h2>
            <p className="text-xs text-brand-secondary/90 leading-relaxed">
              Nơi tụ hội những ghi chép vụn vặt về y phục phật tử trang nghiêm, oai nghi hành xả và cách nâng niu giữ gìn chất sợi thô mộc an lành từ thớ lụa dệt sương.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                onClick={() => setSelectedPost(blog)}
                className="group cursor-pointer flex flex-col gap-4 bg-brand-ivory border border-transparent hover:border-brand-sand/50 rounded-lg p-4 transition-all hover:shadow-ambient"
                id={`blog-card-${blog.id}`}
              >
                <div className="relative w-full aspect-[16/10] overflow-hidden rounded-sm bg-brand-bg shadow-sm">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-brand-primary bg-brand-sand/90 shadow-sm rounded-sm">
                    {blog.category}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-[10px] text-brand-secondary/70">
                    <span className="flex items-center gap-1">
                      <Compass size={11} /> {blog.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {blog.readTime}
                    </span>
                  </div>

                  <h3 className="font-serif-elegant text-base text-brand-primary font-bold tracking-wide group-hover:text-brand-brown transition-colors line-clamp-2">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-brand-secondary/90 leading-relaxed line-clamp-3">
                    {blog.excerpt}
                  </p>

                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:text-brand-brown transition-colors flex items-center gap-1.5 mt-2 self-start border-b border-brand-primary/30 pb-0.5">
                    Đọc tịnh tâm <ArrowRight size={11} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
