"use client";

import { useState } from "react";
import articlesData from "@/data/articles.json";
import { BookOpen, Search, Filter, BookText, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Education() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setVisibleCount(10);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(10);
  };

  const categories = ["Semua", ...Array.from(new Set(articlesData.map(a => a.category)))];

  const filteredArticles = articlesData.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-brand-50 p-6 flex flex-col pb-24 overflow-x-hidden">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 pt-4"
      >
        <h1 className="text-2xl font-bold text-brand-900">SIVA Edukasi</h1>
        <p className="text-brand-600 text-sm">Temukan wawasan kesehatan tervalidasi</p>
      </motion.header>

      {/* Search and Filter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 space-y-3"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari mitos, tips, atau gejala..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-white border border-brand-100 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 text-brand-900 transition-shadow"
          />
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {categories.map(cat => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === cat 
                  ? 'bg-brand-500 text-white shadow-md' 
                  : 'bg-white text-brand-600 border border-brand-100 hover:bg-brand-50'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Article List */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
        }}
        className="space-y-4"
      >
        <div className="flex items-center text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">
          <BookText size={14} className="mr-1" />
          Bank Artikel ({filteredArticles.length})
        </div>

        {filteredArticles.length === 0 ? (
          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-center py-10 bg-white rounded-3xl border border-brand-100">
            <BookOpen className="mx-auto text-brand-200 mb-2" size={32} />
            <p className="text-brand-500 text-sm">Tidak ada artikel yang cocok.</p>
          </motion.div>
        ) : (
          filteredArticles.slice(0, visibleCount).map(article => (
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={article.id} 
              onClick={() => setSelectedArticle(article)}
              className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500 bg-brand-50 px-2 py-0.5 rounded-md">
                  {article.category}
                </span>
                <span className="text-xs text-gray-400 flex items-center">
                  <Clock size={12} className="mr-1" /> {article.readTime}
                </span>
              </div>
              <h3 className="font-bold text-brand-900 mb-2 leading-snug">{article.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{article.content}</p>
            </motion.div>
          ))
        )}

        {visibleCount < filteredArticles.length && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="w-full py-3 mt-4 text-brand-600 font-bold bg-white border border-brand-200 rounded-xl shadow-sm hover:bg-brand-50 transition-colors"
          >
            Muat Lebih Banyak
          </motion.button>
        )}
      </motion.div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-brand-950/40 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white w-full sm:w-auto sm:max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
            
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-500 bg-brand-50 px-3 py-1 rounded-md mb-3">
              {selectedArticle.category}
            </span>
            
            <h2 className="text-2xl font-bold text-brand-900 mb-4 leading-tight">{selectedArticle.title}</h2>
            
            <div className="prose prose-sm text-gray-700 leading-relaxed mb-6">
              <p>{selectedArticle.content}</p>
            </div>

            <motion.a 
              whileTap={{ scale: 0.95 }}
              href={`https://id.wikipedia.org/wiki/${encodeURIComponent(selectedArticle.title.replace(' (Lanjutan)', ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex justify-center items-center bg-brand-50 text-brand-600 font-bold py-3 rounded-xl hover:bg-brand-100 transition-colors mb-3 border border-brand-200"
            >
              Baca Selengkapnya di Web
            </motion.a>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedArticle(null)}
              className="w-full bg-brand-500 text-white font-bold py-3.5 rounded-xl hover:bg-brand-600 transition-colors shadow-md"
            >
              Tutup Modal
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
