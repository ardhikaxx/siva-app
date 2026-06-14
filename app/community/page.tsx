"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, push, onValue, serverTimestamp, query, orderByChild } from "firebase/database";
import { ChevronLeft, MessageCircle, Heart, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { useAlert } from "@/context/AlertContext";

interface Post {
  id: string;
  authorId: string;
  text: string;
  timestamp: number;
  likes?: Record<string, boolean>;
}

export default function Community() {
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const postsRef = query(ref(db, 'community/posts'), orderByChild('timestamp'));
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsArray = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        }));
        // Sort descending
        setPosts(postsArray.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setPosts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLike = async (postId: string, authorId: string, currentLikes: Record<string, boolean> = {}) => {
    if (!user) {
      showAlert({ title: "Belum Masuk", text: "Anda harus login untuk memberi dukungan.", type: "error" });
      return;
    }
    
    // Toggle like
    const postRef = ref(db, `community/posts/${postId}/likes`);
    const newLikes = { ...currentLikes };
    
    if (newLikes[user.uid]) {
      delete newLikes[user.uid]; // Unlike
    } else {
      newLikes[user.uid] = true; // Like
    }
    
    // Firebase real-time database update
    import("firebase/database").then(({ update }) => {
      update(ref(db, `community/posts/${postId}`), { likes: newLikes });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showAlert({ title: "Belum Masuk", text: "Anda harus login untuk memposting di SIVA Sisterhood.", type: "error" });
      router.push("/login");
      return;
    }
    if (newPostText.trim().length < 5) {
      showAlert({ title: "Terlalu Pendek", text: "Pesan Anda terlalu pendek.", type: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      await push(ref(db, 'community/posts'), {
        authorId: user.uid,
        text: newPostText,
        timestamp: serverTimestamp()
      });
      setNewPostText("");
      showAlert({ title: "Terkirim", text: "Pesan anonim Anda berhasil dibagikan!", type: "success" });
    } catch (err) {
      console.error(err);
      showAlert({ title: "Gagal", text: "Terjadi kesalahan.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col">
      <header className="p-4 bg-white border-b border-brand-100 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <button onClick={() => router.back()} className="p-2 bg-brand-50 text-brand-600 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-brand-900 flex items-center justify-center">
            <MessageCircle size={18} className="mr-2 text-brand-500" /> SIVA Sisterhood
          </h1>
          <p className="text-[10px] text-brand-500">Forum Anonim Wanita</p>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {posts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-brand-400 text-sm">Belum ada cerita. Jadilah yang pertama membagikan keluh kesahmu!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white p-4 rounded-2xl shadow-sm border border-brand-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                    {post.authorId === user?.uid ? "Me" : "Anon"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-900">{post.authorId === user?.uid ? "Anda" : "Pengguna Anonim"}</p>
                    <p className="text-[10px] text-brand-400">
                      {post.timestamp ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true, locale: id }) : 'Baru saja'}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-brand-800 leading-relaxed mb-3 whitespace-pre-wrap">{post.text}</p>
              <div className="flex items-center text-brand-400 text-xs font-medium">
                <button 
                  onClick={() => handleLike(post.id, post.authorId, post.likes)}
                  className={`flex items-center transition-colors px-2 py-1 -ml-2 rounded-lg ${
                    user && post.likes?.[user.uid] ? 'text-brand-600 bg-brand-50' : 'hover:bg-brand-50 hover:text-brand-600'
                  }`}
                >
                  <Heart size={14} className={`mr-1.5 ${user && post.likes?.[user.uid] ? 'fill-brand-500 text-brand-500' : ''}`} /> 
                  {post.likes ? Object.keys(post.likes).length : 0} Dukungan
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-brand-100 p-4 pb-8 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-[100]">
        <form onSubmit={handleSubmit} className="flex gap-2 relative max-w-lg mx-auto">
          <input 
            type="text" 
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Bagikan keluhan atau pengalamanmu..."
            className="flex-1 bg-brand-50 border border-brand-100 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 text-brand-900"
          />
          <button 
            type="submit" 
            disabled={isSubmitting || !newPostText.trim()}
            className="absolute right-1 top-1 w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </form>
        <p className="text-[9px] text-center text-brand-400 mt-2">Pesan Anda dijamin 100% anonim dan aman.</p>
      </div>
    </div>
  );
}
