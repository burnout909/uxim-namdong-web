'use client';

import Link from 'next/link';
import { FaNewspaper, FaImage, FaWindowMaximize } from 'react-icons/fa';

export default function AdminHomePage() {
  const menus = [
    { 
      name: '게시글 관리', 
      href: '/admin/posts',
      icon: <FaNewspaper className="w-12 h-12" />,
      description: '공지사항, 일자리 소식 등 게시글을 관리합니다',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    { 
      name: '배너 관리', 
      href: '/admin/banner',
      icon: <FaImage className="w-12 h-12" />,
      description: '메인 페이지 배너 이미지를 관리합니다',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    },
    { 
      name: '팝업 관리', 
      href: '/admin/popup',
      icon: <FaWindowMaximize className="w-12 h-12" />,
      description: '메인 페이지 팝업을 관리합니다',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            관리자 대시보드
          </h1>
          <p className="text-gray-600 text-lg">
            남동시니어클럽 웹사이트 관리 리스트
          </p>
        </div>

        {/* 메뉴 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => (
            <Link
              key={menu.name}
              href={menu.href}
              className="group relative"
            >
              <div className={`
                relative overflow-hidden
                bg-gradient-to-br ${menu.color}
                ${menu.hoverColor}
                rounded-2xl shadow-lg hover:shadow-2xl
                transition-all duration-300
                transform hover:-translate-y-2
                p-8
              `}>
                {/* 배경 패턴 */}
                <div className="absolute top-0 right-0 opacity-10">
                  <div className="w-32 h-32 bg-white rounded-full -mr-16 -mt-16" />
                </div>
                <div className="absolute bottom-0 left-0 opacity-10">
                  <div className="w-24 h-24 bg-white rounded-full -ml-12 -mb-12" />
                </div>

                {/* 컨텐츠 */}
                <div className="relative z-10">
                  {/* 아이콘 */}
                  <div className="text-white mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {menu.icon}
                  </div>

                  {/* 제목 */}
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {menu.name}
                  </h2>

                  {/* 설명 */}
                  <p className="text-white/90 text-sm leading-relaxed">
                    {menu.description}
                  </p>

                  {/* 화살표 아이콘 */}
                  <div className="mt-6 flex items-center text-white/80 group-hover:text-white transition-colors">
                    <span className="text-sm font-medium">바로가기</span>
                    <svg 
                      className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>




      </div>
    </main>
  );
}