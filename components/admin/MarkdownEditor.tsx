"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

export function MarkdownEditor({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [preview, setPreview] = React.useState(false);

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="flex border-b border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setPreview(false)}
          className={`rounded-md px-3 py-1.5 text-sm ${!preview ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
        >
          编辑
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className={`rounded-md px-3 py-1.5 text-sm ${preview ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
        >
          预览
        </button>
      </div>
      {preview ? (
        <div className="prose-content min-h-80 max-w-none bg-slate-950 p-5">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeHighlight]}>
            {value || "还没有可预览的内容。"}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-80 w-full resize-y border-0 p-4 font-mono text-sm leading-7 text-slate-950 outline-none"
          placeholder="编写 Markdown 内容..."
        />
      )}
    </div>
  );
}
