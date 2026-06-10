import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f7f9fc] p-4 text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(199,210,254,0.30),transparent_34%),linear-gradient(180deg,#ffffff,#f7f9fc)]" />
      <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full border border-dashed border-indigo-200/70" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-700">后台</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold">登录个人内容系统</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">管理项目、文章、动态、头像、留言和站点设置。</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
