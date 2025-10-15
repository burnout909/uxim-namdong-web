'use client';

import Link from 'next/link';

export default function AdminHomePage() {
  const menus = [
    { name: '게시글 관리', href: '/admin/posts' },
    { name: '배너 관리', href: '/admin/banner' },
    { name: '팝업 관리', href: '/admin/popup' },
  ];

  return (
    <main className="flex flex-col gap-6 p-8">
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        {menus.map((menu) => (
          <Link
            key={menu.name}
            href={menu.href}
            className="p-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-center shadow-sm transition"
          >
            {menu.name}
          </Link>
        ))}
      </div>
    </main>
  );
}
