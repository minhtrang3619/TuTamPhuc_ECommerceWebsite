/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Search, ShoppingBag, User, Sparkles } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  openCart: () => void;
  openAssistant: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  cartCount,
  openCart,
  openAssistant,
  searchQuery,
  setSearchQuery,
}: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const menuItems = [
    { id: "trangchu", label: "Trang chủ" },
    { id: "all", label: "Cửa hàng" },
    { id: "Đồ lam nam", label: "Đồ Lam Nam" },
    { id: "Đồ lam nữ", label: "Đồ Lam Nữ" },
    { id: "Bộ cư sĩ", label: "Bộ Cư Sĩ" },
    { id: "Áo tràng", label: "Áo Tràng" },
    { id: "blog", label: "Blog" },
    { id: "gioithieu", label: "Giới thiệu" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.06)] transition-transform duration-300">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab("trangchu")} 
          className="font-headline-sm text-headline-sm text-primary tracking-tight cursor-pointer select-none transition-opacity hover:opacity-80"
          id="brand-logo"
        >
          Từ Tâm Phục
        </div>

        {/* Navigation Categories */}
        <nav className="hidden md:flex gap-8 items-center">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`font-label-md text-label-md tracking-widest uppercase transition-colors duration-500 py-2 border-b border-transparent ${
                activeTab === item.id || (item.id === "all" && ["all", "Đồ lam nam", "Đồ lam nữ", "Bộ cư sĩ", "Áo tràng"].indexOf(activeTab) !== -1)
                  ? "text-primary border-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
              id={`nav-${item.id}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex gap-4 items-center text-primary">
          {/* Integrated Search Input bar */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center border-b border-outline py-1 transition-all duration-300 w-44 md:w-56">
                <input
                  type="text"
                  placeholder="Tìm pháp phục..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-body-md text-on-surface focus:ring-0 w-full pl-1 outline-none font-body-md"
                  autoFocus
                  onBlur={() => {
                    if (searchQuery === "") setIsSearchOpen(false);
                  }}
                  id="search-input"
                />
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="text-body-md text-outline hover:text-primary active:scale-95 pl-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hover:text-on-surface-variant transition-colors cursor-pointer p-1.5 hover:bg-secondary-container/50 rounded-full"
                title="Tìm kiếm sản phẩm"
                id="search-btn"
              >
                <Search size={19} />
              </button>
            )}
          </div>

          {/* Sparkly Floating Lotus Assistant */}
          <button
            onClick={openAssistant}
            className="flex items-center gap-1 font-label-md text-label-md text-primary hover:text-on-surface-variant transition-colors cursor-pointer bg-secondary-container/80 px-2.5 py-1.5 rounded-full animate-pulse border border-outline/20"
            title="Trợ lý Tĩnh Tâm AI"
            id="advisor-btn"
          >
            <Sparkles size={14} className="text-amber-800" />
            <span className="hidden sm:inline font-medium">Trợ Lý AI</span>
          </button>

          {/* Desktop/Mobile Shopping Cart Indicator */}
          <button
            onClick={openCart}
            className="hover:text-on-surface-variant transition-colors cursor-pointer relative p-1.5 hover:bg-secondary-container/50 rounded-full"
            title="Giỏ hàng tịnh thanh"
            id="cart-btn"
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-on-primary text-[10px] w-4.5 h-4.5 font-bold rounded-full flex items-center justify-center border border-surface shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Sign Sheet (Scenic Placeholder with Zen greeting) */}
          <button
            onClick={() => alert("A Di Đà Phật! Đạo hữu đã đăng nhập tự động dưới tài khoản đạo tràng buithiminhtrang2006@gmail.com. Chúc thân tâm thường an lạc.")}
            className="hover:text-on-surface-variant transition-colors cursor-pointer p-1.5 hover:bg-secondary-container/50 rounded-full hidden sm:inline-block"
            title="Đạo tràng cá nhân"
            id="user-profile-btn"
          >
            <User size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
