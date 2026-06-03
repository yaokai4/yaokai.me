"use client";

import { Activity, BarChart3, BookOpen, FileText, FolderKanban, Home, Inbox, Library, ListChecks, LogOut, MessageSquare, ScrollText, Settings, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "总览", icon: BarChart3 },
  { href: "/admin/blog", label: "文章", icon: FileText },
  { href: "/admin/projects", label: "项目", icon: FolderKanban },
  { href: "/admin/guides", label: "指南", icon: BookOpen },
  { href: "/admin/resources", label: "资源库", icon: Library },
  { href: "/admin/now", label: "Now", icon: Activity },
  { href: "/admin/playbooks", label: "方法论", icon: ListChecks },
  { href: "/admin/manifesto", label: "宣言", icon: ScrollText },
  { href: "/admin/posts", label: "动态", icon: MessageSquare },
  { href: "/admin/messages", label: "留言", icon: Inbox },
  { href: "/admin/settings", label: "设置", icon: Settings },
  { href: "/admin/security", label: "账号安全", icon: ShieldCheck }
];

export function AdminSidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className={cn("w-64 border-r border-slate-200 bg-white px-4 py-5", mobile ? "relative min-h-screen" : "fixed inset-y-0 left-0 hidden lg:block")}>
      <Link href="/" className="flex items-center gap-3 rounded-md px-2 py-2">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-sm font-bold text-white">YK</span>
        <div>
          <p className="text-sm font-semibold text-slate-950">个人内容系统</p>
          <p className="text-xs text-slate-500">姚凯网站后台</p>
        </div>
      </Link>

      <nav className="mt-8 grid gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
                active && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute inset-x-4 bottom-5 grid gap-2">
        <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
          <Home className="h-4 w-4" />
          查看网站
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </div>
    </aside>
  );
}
