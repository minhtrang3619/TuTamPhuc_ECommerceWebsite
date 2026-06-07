/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ShoppingBag, User, Search, Heart, MapPin, ClipboardList, Compass, Sparkles } from 'lucide-react';
import { Screen, CartItem } from '../types';

interface HeaderProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  cart: CartItem[];
  setIsCartOpen: (isOpen: boolean) => void;
  setCategoryFilter: (category: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
}

export default function Header({
  activeScreen,
  setActiveScreen,
  cart,
  setIsCartOpen,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  selectedCategories,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { label: 'Trang chủ', action: () => { setCategoryFilter(null); setActiveScreen('catalog'); } },
    { label: 'Đồ lam', action: () => { setCategoryFilter('Đồ lam'); setActiveScreen('catalog'); } },
    { label: 'Pháp phục', action: () => { setCategoryFilter('Pháp Phục'); setActiveScreen('catalog'); } },
    { label: 'Áo tràng', action: () => { setCategoryFilter('Áo tràng'); setActiveScreen('catalog'); } },
    { label: 'Túi vải', action: () => { setCategoryFilter('Túi vải'); setActiveScreen('catalog'); } },
    { label: 'Blog', action: () => { setCategoryFilter(null); setActiveScreen('blog'); } },
  ];

  const isItemActive = (label: string) => {
    if (label === 'Trang chủ') {
      return activeScreen === 'catalog' && selectedCategories.length === 0;
    }
    if (label === 'Đồ lam') {
      return activeScreen === 'catalog' && (
        selectedCategories.includes('Đồ lam nữ') || 
        selectedCategories.includes('Đồ lam nam') || 
        selectedCategories.includes('Bộ cư sĩ')
      );
    }
    if (label === 'Pháp phục') {
      return activeScreen === 'catalog' && selectedCategories.includes('Pháp Phục');
    }
    if (label === 'Áo tràng') {
      return activeScreen === 'catalog' && selectedCategories.includes('Áo tràng');
    }
    if (label === 'Túi vải') {
      return activeScreen === 'catalog' && selectedCategories.includes('Túi vải');
    }
    if (label === 'Blog') {
      return activeScreen === 'blog';
    }
    return false;
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-[#1a1c1c]/80 glass-nav shadow-[0_32px_64px_-12px_rgba(68,42,34,0.06)] border-b border-[#eeeeee]/30 transition-all duration-300">
        <div className="flex justify-between items-center px-6 md:px-16 h-20 max-w-7xl mx-auto">
          
          {/* Logo */}
          <button 
            onClick={() => { setCategoryFilter(null); setActiveScreen('catalog'); }}
            className="font-serif text-2xl md:text-3xl text-primary tracking-widest uppercase hover:opacity-80 transition-opacity cursor-pointer font-bold"
          >
            Từ Tâm Phục
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.action();
                  setIsMobileMenuOpen(false);
                }}
                className={`font-sans text-xs tracking-widest font-semibold uppercase hover:text-primary transition-all cursor-pointer py-1 border-b ${
                  isItemActive(item.label)
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-on-surface-variant hover:border-primary/30'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Icons Bar */}
          <div className="flex items-center space-x-6">
            {/* Search Input Toggle */}
            <div className="relative flex items-center">
              <AnimatePresence>
                {isSearchVisible && (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    type="text"
                    placeholder="Tìm pháp phục..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#eeeeee]/50 dark:bg-white/10 text-xs text-on-surface border border-[#d4c3be]/40 rounded-full py-1.5 px-4 pr-8 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary mr-2"
                  />
                )}
              </AnimatePresence>
              <button
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="hover:text-primary transition-colors cursor-pointer text-on-surface-variant flex items-center"
                title="Tìm kiếm"
              >
                <Search size={20} className="stroke-[1.5]" />
              </button>
            </div>

            {/* Shopping Bag button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-primary transition-colors cursor-pointer text-on-surface-variant flex items-center"
              title="Giỏ hàng"
            >
              <ShoppingBag size={20} className="stroke-[1.5]" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Profile trigger */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="hover:text-primary transition-colors cursor-pointer text-on-surface-variant flex items-center"
              title="Tài khoản thiền hữu"
            >
              <User size={20} className="stroke-[1.5]" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden hover:text-primary transition-colors cursor-pointer text-on-surface-variant flex items-center"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/95 dark:bg-[#1a1c1c]/95 backdrop-blur-xl border-t border-[#eeeeee]/30 px-6 py-6"
            >
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.action();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-left font-sans text-sm tracking-widest font-semibold uppercase py-2 border-b border-[#eeeeee]/30 ${
                      isItemActive(item.label)
                        ? 'text-primary'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Side Profile Drawer for "User" */}
      <AnimatePresence>
        {isProfileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#f9f9f9] shadow-2xl z-50 p-8 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center pb-6 border-b border-[#d4c3be]/30 mb-8">
                  <h3 className="font-serif text-xl text-primary font-semibold uppercase tracking-wider">Cửa thiền hữu</h3>
                  <button 
                    onClick={() => setIsProfileOpen(false)}
                    className="p-1 hover:bg-[#eeeeee] rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Profile detail */}
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <User size={32} className="stroke-[1.2]" />
                  </div>
                  <div>
                    <h4 className="font-sans font-semibold text-on-surface">Minh Trang Bùi</h4>
                    <p className="text-xs text-on-surface-variant">Thành viên Đạo bồ đề • 120 điểm tích luỹ</p>
                  </div>
                </div>

                {/* Loyal card */}
                <div className="bg-[#5d4037] text-white p-6 rounded-lg mb-8 relative overflow-hidden shadow-md">
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                    <Compass size={120} />
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] opacity-80">Từ Tâm Hội Viên</span>
                    <Sparkles size={16} className="text-primary-fixed" />
                  </div>
                  <h5 className="font-serif text-lg tracking-widest">MINH TRANG BUI</h5>
                  <div className="mt-6 flex justify-between items-end">
                    <span className="text-[10px] opacity-60">Ưu đãi: Giảm 5% mọi đơn hàng</span>
                    <span className="text-xs font-bold font-mono">TTP-9821-VVIP</span>
                  </div>
                </div>

                {/* Fictional Order History */}
                <div className="mb-6">
                  <h4 className="font-serif text-sm font-semibold uppercase text-primary tracking-wide mb-4">Lịch sử tu duyên</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-white border border-[#d4c3be]/20 rounded-md shadow-xs">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-mono text-on-surface-variant font-medium">Đơn hàng #TTO-4512</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">Đang giao hàng</span>
                      </div>
                      <h6 className="text-xs font-semibold text-on-surface">Xem chi tiết: Áo Tràng An Nhiên x1</h6>
                      <p className="text-[11px] text-on-surface-variant/70 mt-1">Giao đến: Quận 1, TP. Hồ Chí Minh</p>
                    </div>

                    <div className="p-4 bg-white border border-[#d4c3be]/20 rounded-md shadow-xs">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-mono text-on-surface-variant">Đơn hàng #TTO-3104</span>
                        <span className="text-on-surface-variant/80 bg-[#eeeeee] px-2 py-0.5 rounded-full text-[10px]">Đã hoàn thành</span>
                      </div>
                      <h6 className="text-xs font-semibold text-on-surface">Khăn Lụa Thêu Sen - Trắng ngà x1</h6>
                      <p className="text-[11px] text-on-surface-variant/70 mt-1">Thanh toán: COD • 850.000 ₫</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="bg-[#ece0dc]/40 border border-[#d4c3be]/40 p-4 rounded text-[11px] text-[#5d4037] flex items-start space-x-2">
                <MapPin size={16} className="shrink-0 mt-0.5" />
                <span>Mọi tà áo gửi trao đều được Từ Tâm Phục ướp hương quế trầm thơm mát trước khi đóng hộp mộc gửi tới quý thiền hữu.</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
