"use client";

import { Menu } from "lucide-react";
import * as React from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminHeader({ title, description }: { title: string; description?: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <div>
          <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
          {description ? <p className="mt-1 hidden text-sm text-slate-500 md:block">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="hidden rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 md:inline-flex">
            查看网站
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-700 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="打开后台菜单"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-72 bg-white" onClick={(event) => event.stopPropagation()}>
            <AdminSidebar mobile />
          </div>
        </div>
      ) : null}
    </header>
  );
}
