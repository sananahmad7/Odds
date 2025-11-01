"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import type { FC } from "react";

export type BlogCardPost = {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  date: string; // formatted date
};

type Props = { post: BlogCardPost };

const BlogCard: FC<Props> = ({ post }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/article/${post.slug}`);
  };

  return (
    <div
      className="rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300 cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" ? handleClick() : null)}
    >
      <div className="relative">
        <div className="relative w-full h-48">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
            className="object-cover"
            priority={false}
          />
        </div>
        <span className="absolute top-3 left-3 bg-gray-600 text-white text-xs px-2 py-1 rounded">
          {post.category}
        </span>
      </div>

      <div className="p-4">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>{post.date}</span>
          {/* views removed because not in your BlogArticle shape */}
        </div>

        <h2 className="font-bold text-lg mb-2 font-orbitron">{post.title}</h2>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {post.excerpt}
        </p>
      </div>
    </div>
  );
};

export default BlogCard;
