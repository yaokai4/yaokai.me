import Image from "next/image";
import { GlassCard } from "@/components/site/GlassCard";
import type { Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";

type Post = {
  id: string;
  content: string;
  images: string[];
  createdAt: Date;
};

export function PostCard({ post, locale = "zh" }: { post: Post; locale?: Locale }) {
  return (
    <GlassCard>
      <p className="text-sm text-slate-500">{formatDate(post.createdAt, locale)}</p>
      <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-slate-700">{post.content}</p>
      {post.images.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {post.images.map((image) => (
            <div key={image} className="relative aspect-video overflow-hidden rounded-md border border-slate-200 bg-indigo-50">
              <Image src={image} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      ) : null}
    </GlassCard>
  );
}
