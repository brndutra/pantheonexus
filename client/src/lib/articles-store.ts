import { useState, useEffect } from 'react';
import cover1 from "@assets/generated_images/mythological_city_skyline_rift.png";
import portrait1 from "@assets/generated_images/mysterious_oracle_silhouette.png";

export interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
  coverImage?: string;
  portraitImage?: string;
}

const STORAGE_KEY = 'pantheonexus_articles';

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setArticles(JSON.parse(saved));
    } else {
      // Default mock data
      const defaults: Article[] = [
        {
          id: 1,
          title: "The Veil Weakens",
          summary: "Reports of increased Titanactivity in the lower boroughs.",
          content: "Recent scion activity suggests a thinning of the Veil near the East River. Be on guard for manifestations.",
          author: "Admin",
          date: "2026-01-15",
          tags: ["Alert", "Titans"],
          coverImage: cover1,
          portraitImage: portrait1
        },
        {
            id: 2,
            title: "New Safehouse Locations",
            summary: "Updated list of neutral grounds for meeting.",
            content: "Three new neutral grounds have been sanctioned by the Council. See the encrypted map for details.",
            author: "Oracle",
            date: "2026-01-10",
            tags: ["Logistics", "Safehouse"]
          }
      ];
      setArticles(defaults);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    }
  }, []);

  const addArticle = (article: Omit<Article, 'id' | 'date'>) => {
    const newArticle = {
      ...article,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    
    const updated = [newArticle, ...articles];
    setArticles(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Storage limit exceeded", error);
      alert("Storage limit exceeded! The article will be available for this session but may not persist on reload due to large image sizes.");
    }
  };

  const deleteArticle = (id: number) => {
    const updated = articles.filter(a => a.id !== id);
    setArticles(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Storage limit exceeded", error);
    }
  };

  return { articles, addArticle, deleteArticle };
};
