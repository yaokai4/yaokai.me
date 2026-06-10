import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

function withoutLeadingTitle(content: string) {
  return content.replace(/^\s*#\s+.+(?:\r?\n)+/, "");
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
          rehypeHighlight
        ]}
      >
        {withoutLeadingTitle(content)}
      </ReactMarkdown>
    </div>
  );
}
