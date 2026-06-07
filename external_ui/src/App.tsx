/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Product, CartItem, ChatMessage } from "./types";
import { PRODUCTS, BLOGS } from "./data";
import Navbar from "./components/Navbar";
import SidebarFilters from "./components/SidebarFilters";
import ProductGrid from "./components/ProductGrid";
import QuickViewModal from "./components/QuickViewModal";
import CartDrawer from "./components/CartDrawer";
import ZenAssistant from "./components/ZenAssistant";
import BlogSection from "./components/BlogSection";
import { 
  Sparkles, 
  MapPin, 
  Leaf, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Heart, 
  ChevronDown, 
  Search, 
  Send,
  Info
} from "lucide-react";

export default function App() {
  // Brand Reactive States
  const [activeTab, setActiveTab] = React.useState<string>("trangchu");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<string>("Mới nhất");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [newsletterEmail, setNewsletterEmail] = React.useState("");

  // Facetted Sidebar Filters State
  const [filters, setFilters] = React.useState({
    categories: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
  });

  // UI Interactive States
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  // Cart Persistent State (localStorage)
  const [cartItems, setCartItems] = React.useState<CartItem[]>(() => {
    const saved = localStorage.getItem("tutamphuc_cart");
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem("tutamphuc_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Conversational AI Assistant State
  const [conversation, setConversation] = React.useState<ChatMessage[]>([
    {
      sender: "assistant",
      text: "A Di Đà Phật! Từ Tâm Phục hoan hỷ đón chào quý hữu. Tôi là Trợ lý Tĩnh Tâm AI.\n\nĐạo hữu có cần tham khảo bảng chọn kích thước rộng rãi khi ngồi thiền (bán già, kiết già), cách nâng niu giữ gìn sợi đũi lanh lụa dệt tự sinh, hay thỉnh ý nghĩa thiền vị của từng nếp xếp tà áo không ạ? Xin quý hữu hãy tùy tâm trao đổi.",
      timestamp: new Date(),
    },
  ]);

  // Synchronizing Category tabs clicks with sidebar filters
  React.useEffect(() => {
    if (activeTab === "all") {
      setFilters((prev) => ({ ...prev, categories: [] }));
    } else if (["Đồ lam nam", "Đồ lam nữ", "Bộ cư sĩ", "Áo tràng"].includes(activeTab)) {
      setFilters((prev) => ({ ...prev, categories: [activeTab] }));
    }
    setCurrentPage(1);
    window.scrollTo({ top: 300, behavior: "smooth" });
  }, [activeTab]);

  // Syncing tab highlight when sidebar filters change
  React.useEffect(() => {
    if (filters.categories.length === 1) {
      setActiveTab(filters.categories[0]);
    } else if (filters.categories.length === 0) {
      if (activeTab !== "blog" && activeTab !== "gioithieu") {
        setActiveTab("all");
      }
    }
  }, [filters.categories]);

  // Dynamic Filtering Logic
  const filteredProducts = React.useMemo(() => {
    return PRODUCTS.filter((product) => {
      // 1. Text Searching Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesFabric = product.fabric.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesFabric && !matchesCategory) {
          return false;
        }
      }

      // 2. Facetted Category Checklist
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(product.category)) {
          return false;
        }
      }

      // 3. Facetted Color list
      if (filters.colors.length > 0) {
        if (!filters.colors.includes(product.color)) {
          return false;
        }
      }

      // 4. Facetted Size squares
      if (filters.sizes.length > 0) {
        const hasSize = product.sizes.some((s) => filters.sizes.includes(s));
        if (!hasSize) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Pricing & Newness Sorting
      if (sortBy === "Giá tăng dần") {
        return a.price - b.price;
      } else if (sortBy === "Giá giảm dần") {
        return b.price - a.price;
      }
      // "Mới nhất": prioritizes products with label "Mới" or ID sorting
      const scoreA = a.tag === "Mới" ? 2 : 1;
      const scoreB = b.tag === "Mới" ? 2 : 1;
      return scoreB - scoreA;
    });
  }, [searchQuery, filters, sortBy]);

  // Shopping Cart Actions
  const handleAddToCart = (product: Product, selectedSize: "S" | "M" | "L" | "XL", quantity: number) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            selectedSize,
            selectedColor: product.color,
            quantity,
          },
        ];
      }
    });
  };

  const handleUpdateCartQty = (index: number, newQty: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const cartTotalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Hook starting specific Gemini consultation about selected clothes
  const handleAskAIAboutProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsAssistantOpen(true);
    
    // Add prompt hook to session chat
    const productQuery = `Tư vấn kỹ cho tôi về sản phẩm "${product.name}". Thiết kế này thích hợp dùng trong bối cảnh hành lễ nào, chất vải "${product.fabric}" mặc ngồi thiền sâu có sướng không và tôi cao 1m62, nặng 57kg thì chọn size gì vừa trang nghiêm nhất?`;
    
    setConversation((prev) => [
      ...prev,
      {
        sender: "user",
        text: productQuery,
        timestamp: new Date(),
      }
    ]);

    // Send background query execution automatically
    setIsAssistantOpen(true);
    setTimeout(async () => {
      try {
        const response = await fetch("/api/consult", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...conversation,
              { sender: "user", text: productQuery, timestamp: new Date() }
            ],
            selectedProduct: product,
          }),
        });
        const data = await response.json();
        setConversation((prev) => [
          ...prev,
          { sender: "assistant", text: data.text, timestamp: new Date() }
        ]);
      } catch (err) {
        console.error(err);
      }
    }, 200);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() === "") return;
    alert(`A Di Đà Phật! Đạo tràng của Từ Tâm Phục đã tịnh nhận liên lạc thư tín gieo duyên từ đạo hữu (${newsletterEmail}). Chúng tôi xin dâng gửi trọn bộ tài liệu "Hành Lễ Đoan Nghiêm" tịnh dưỡng qua hòm thư sớm nhất.`);
    setNewsletterEmail("");
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between" id="tutamphuc-app-root">
      {/* Top Header menu */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartTotalQuantity}
        openCart={() => setIsCartOpen(true)}
        openAssistant={() => setIsAssistantOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main viewport */}
      {activeTab === "trangchu" ? (
        <div className="pt-20 flex-grow">
          {/* Hero Section */}
          <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img
                alt="Hero Background"
                className="w-full h-full object-cover object-center opacity-90"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv4jjikVxIo47JIVjw3uW53hpuOLWQUv9H7ywNN_M5yhLbUmh0OdcQMw1eMFxPn69BVCeFn7pXSx2juQVtb8UlHBSl4auzzRmRR1m0rnfQXAbomNfSvN6W8_JJ4gl5mM1aaQFlx4NxwMQBNSFRYTedaR0Wzn3pV88Hzpn4TdEN045bM-c-VVMln2dj1s7SOTI_c9RNMriXIw3Z6NkYojhTECmZRd5Vs9s_aqaQGpptxXnhqIajydq2a1rk6YmyXdjPlxPIFlOs2KqT"
              />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto px-margin-mobile text-center flex flex-col items-center gap-8 bg-surface/60 backdrop-blur-md p-12 rounded-xl ambient-shadow">
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary">Từ Tâm Phục</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant tracking-wide">Khởi tâm từ, diện trang nghiêm</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button
                  onClick={() => {
                    setActiveTab("all");
                    setTimeout(() => {
                      const collectionsEl = document.getElementById("collections");
                      if (collectionsEl) collectionsEl.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="px-8 py-3 border border-primary text-primary font-label-md text-label-md hover:bg-primary-fixed transition-colors duration-500 rounded flex items-center justify-center cursor-pointer"
                >
                  Khám phá bộ sưu tập
                </button>
                <button
                  onClick={() => setActiveTab("all")}
                  className="px-8 py-3 bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors duration-500 rounded flex items-center justify-center cursor-pointer"
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </section>

          {/* Featured Categories (Bento Grid) */}
          <section className="py-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop" id="collections">
            <div className="text-center mb-16">
              <h2 className="font-headline-md text-headline-md text-primary mb-4">Danh Mục Nổi Bật</h2>
              <div className="w-12 h-px bg-outline mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter auto-rows-[300px]">
              {/* Large Card */}
              <button
                onClick={() => {
                  setFilters({ categories: ["Đồ lam nam", "Đồ lam nữ"], colors: [], sizes: [] });
                  setActiveTab("all");
                }}
                className="relative group overflow-hidden md:col-span-2 md:row-span-2 bg-surface-container rounded-lg block w-full text-left cursor-pointer"
              >
                <img
                  alt="Đồ Lam"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrBLlbUn5BS7L-jwLAR1k7adsxRmrMAs2hSn-gg5gYuDkyFwYoCvXEiyB6isu8-DwdXdUEqs4mBdaJZCtfshb3NpeZIZppZkMJXa0Wb_Kkvb-hCxD4eXudtDErx3AXxvQ7_q5iKmS0pV-xskdvUUWrk0KtLWdGxDNMFgqyeG8rByUjTACIMFOeN4PxwHx0wdUt71TG0R4NaxrMm7szu_N8KKpWFGbFv-TBzNZtrqTsLF8Jq52ATwZCyv_aishAV8S53raJbmLVBg77"
                />
                <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-surface-tint/80 to-transparent">
                  <h3 className="font-headline-sm text-headline-sm text-on-primary mb-2">Đồ Lam</h3>
                  <span className="font-label-md text-label-md text-on-primary flex items-center gap-2">
                    Khám phá <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </button>

              {/* Small Card 1 */}
              <button
                onClick={() => {
                  setFilters({ categories: ["Bộ cư sĩ"], colors: [], sizes: [] });
                  setActiveTab("all");
                }}
                className="relative group overflow-hidden bg-surface-container rounded-lg block w-full text-left cursor-pointer"
              >
                <img
                  alt="Pháp Phục"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDspV1XdurxzKoeaggAJu1hf74QDUZQVPisH2jNws0r1Rm9RFYwB98edJ8M0qBjP4rjdHgkRbxo013g9w2PiaIO3ZDDI8k0VoYw-zU03nNWjf06Bz6yXSnwQkhOQi0ltD9hdYCgCkiM6Zu6bfa4rdbry5DKqgYisL3yeyue1ljPTUkiXH0YIQtpB8cWgby5xCMsfp2iWC-oO6zb4bOaPDkBu6gBHvUQqmHt-bXoj1ojuVTfc8K20GXMLP1I0YIpyNiWb_WtO0GYICT9"
                />
                <div className="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-surface-tint/80 to-transparent">
                  <h3 className="font-headline-sm text-headline-sm text-on-primary mb-2">Pháp Phục</h3>
                </div>
              </button>

              {/* Small Card 2 */}
              <button
                onClick={() => {
                  setFilters({ categories: ["Áo tràng"], colors: [], sizes: [] });
                  setActiveTab("all");
                }}
                className="relative group overflow-hidden bg-surface-container rounded-lg block w-full text-left cursor-pointer"
              >
                <img
                  alt="Áo Tràng"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuNz0WOcI-jkHaVK-JlQ9uJ2qjzIci6n0ByCmYBpc0GsiVBkKrDeQp8OdvafAiFTmd_S3uuQ1iAzoafVZhL-7p78_GhxKahieBIuTy_ardkn1wfZGqZiVqoCeDsLS-zUiCPKKRuX6a_Bb4poaWDw0MX8iX3LPFcJ_VFYSTFydTDH5149BBLQfhP3-YXb2HnViiIixKdJi7WSVaZl9oK0Zjzh8FeuR2WfXbv9d01LbTd40GJVT2-qkMYGWbbN3Xx6TY5zTQx7Fz0XzQ"
                />
                <div className="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-surface-tint/80 to-transparent">
                  <h3 className="font-headline-sm text-headline-sm text-on-primary mb-2">Áo Tràng</h3>
                </div>
              </button>
            </div>
          </section>

          {/* Brand Story */}
          <section className="py-section-gap bg-secondary-fixed">
            <div className="max-w-3xl mx-auto px-margin-mobile text-center">
              <span className="material-symbols-outlined text-primary text-4xl mb-6 opacity-80" style={{ fontVariationSettings: "'FILL' 0" }}>spa</span>
              <h2 className="font-headline-md text-headline-md text-primary mb-8 leading-relaxed">
                Sự tĩnh tại trong từng nếp áo, hơi thở của thiền định trong từng đường kim mũi chỉ.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-loose mb-10">
                Từ Tâm Phục không chỉ là những bộ trang phục, mà là một không gian chánh niệm mang theo bên mình. Chúng tôi lựa chọn những chất liệu tự nhiên thuần khiết nhất, thiết kế tối giản để tôn vinh vẻ đẹp nội tâm, giúp người mặc tìm thấy sự bình yên giữa nhịp sống hối hả.
              </p>
              <button
                onClick={() => setActiveTab("gioithieu")}
                className="inline-flex items-center gap-2 font-label-md text-label-md text-primary hover:text-on-surface-variant transition-colors pb-1 border-b border-primary hover:border-on-surface-variant cursor-pointer"
              >
                Câu chuyện thương hiệu <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </section>
        </div>
      ) : (
        <main className="pt-32 px-6 md:px-16 max-w-7xl mx-auto w-full flex-grow pb-24">
          
          {/* Conditional View: 1. Editiorial Blog Index / Reading */}
          {activeTab === "blog" ? (
            <div className="mt-10">
              <BlogSection blogs={BLOGS} />
            </div>
          ) : activeTab === "gioithieu" ? (
            
            /* Conditional View: 2. Elegant About Brand history */
            <div className="max-w-3xl mx-auto mt-8 flex flex-col gap-10" id="gioi-thieu-view">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary bg-brand-sand px-3 py-1.5 rounded-sm">
                  Về Chúng Tôi
                </span>
                <h1 className="font-serif-elegant text-3.5xl text-brand-primary font-bold tracking-wide mt-4 mb-4">
                  Từ Tâm Phục - Khởi Tâm Từ, Diện Trang Nghiêm
                </h1>
                <p className="text-sm text-brand-secondary/90 italic leading-relaxed">
                  "Một đường dệt chỉ hiền lành xoa dịu bụi trần, dựng oai nghi thanh tịnh giữa cuộc thảo dã."
                </p>
              </div>

              <div className="w-full aspect-[21/9] overflow-hidden rounded-sm shadow-sm bg-brand-ivory">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnO1Maxeutb-jssEy8FeSFc2z-2xSMGU60H2jUoy58UiARCv_XaPIGNVETe7etHxfzi1baFOLFF1EoOAl0Hw9qyLkkZ8Wo975bLX-MYkY3WwV9tcb7rObSCjcYBJc3ivi6ITGBoRegW0HEKBjw4ZLMzWLgprYYxvNZaqCuiV4E_nyRIMN7Jb_gtXjxDQpywYFWCL_TQs5KsVy4GrScJUsbZaFLDgRfZik96lm4yd591Tp531H80VQdxlP4CZuCZMuyyeco2LDPRHdf"
                  alt="Từ Tâm Phục"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="text-xs md:text-sm text-brand-dark leading-loose flex flex-col gap-5">
                <p>
                  🌸 <strong>Từ Tâm Phục</strong> ra đời như một nhân duyên tuyệt đẹp dìu bước chân hành đạo của quý cư sĩ Phật tử qua phong ba bão táp hồng trần dâu bể. Mỗi vầng tà áo, nếp tơ lanh, hay khuy cài nút tàu dệt tay mộc truyền thô đều thấm nhuần tinh cốt của sự <em>Tĩnh lặng</em>, <em>Cung kính</em> và <em>Tự tại</em>.
                </p>
                <h3 className="font-serif-elegant text-lg text-brand-primary font-bold tracking-wide mt-4 border-b border-brand-sand/70 pb-2">
                  1. Giá trị mộc mạc nguyên bản
                </h3>
                <p>
                  Ở <strong>Từ Tâm Phục</strong>, chúng tôi tôn trọng mộc mạc hiền hậu của thiên nhiên. Bổn hiệu tuyệt đối không chạy đua thêu đính hoa văn kim tuyến lấp lánh khoa trương chốn tôn nghiêm. Chúng tôi giữ oai nghi tôn quý nhất của đạo hữu Phật tử bằng những đường kim ẩn sợi vô sắc, sắc nâu sương trầm wood mộc, trắng ivory sữa đằm thắm hay xanh rêu liễu rủ cổ tự tịnh xá.
                </p>
                
                <h3 className="font-serif-elegant text-lg text-brand-primary font-bold tracking-wide mt-4 border-b border-brand-sand/70 pb-2">
                  2. Thiết kế giải phóng hơi thở dưỡng sinh
                </h3>
                <p>
                  Mọi pháp phục đồ lam thiền định được nghiên cứu tỷ lệ hông rộng, tà thoáng cánh quạt ưu tú dẻo dai. Dưới hiên chùa hay hành lang thiền thất, khi đạo hữu đặt chân xếp nếp Kiết Già, Bán Già tĩnh tọa hít thở sụt sâu thở phồng nhẹ nhã, chất thô đũi xước tự sinh bọc xả nhiệt thông hơi hoàn hảo, khước từ mọi bách gò bó cơ thể tầm thường.
                </p>
                <p className="bg-brand-sand/30 p-4 border border-brand-sand/40 text-brand-primary font-medium rounded-sm italic leading-relaxed text-xs">
                  "Khởi tâm lành diện trang phẳng nghiêm sắc, oai nghi hành xả bước chân thanh cao vô thường."
                </p>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setActiveTab("all")}
                  className="px-6 py-3 bg-brand-primary text-brand-bg font-bold tracking-widest text-xs uppercase hover:bg-brand-brown transition-all shadow-md active:scale-95 cursor-pointer rounded-sm"
                >
                  Ghé Quầy Gieo Duyên Thỉnh Áo
                </button>
              </div>
            </div>
          ) : (
            
            /* Default Page: 3. Visual Catalog Shopping Grid per Mockup */
            <div className="flex flex-col gap-10">
              {/* Header branding titles corresponding to mockup */}
              <div className="text-center mt-6 mb-12">
                <h1 className="font-serif-elegant text-3xl md:text-5xl text-brand-primary leading-tight font-light mb-4 select-none">
                  Pháp Phục & Đồ Lam
                </h1>
                <p className="font-sans text-xs md:text-sm text-brand-secondary/90 tracking-wide max-w-2xl mx-auto leading-relaxed">
                  Sự tĩnh tại trong từng đường kim mũi chỉ, mang đến cảm giác an nhiên và trang nhã cho người mặc.
                </p>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left filter side controls */}
                <SidebarFilters filters={filters} setFilters={setFilters} />

                {/* Right main area columns */}
                <div className="flex-1 flex flex-col gap-6" id="products-master-grid-section">
                  
                  {/* Search query focus details & sorting selectors */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-brand-sand/65">
                    <div className="text-xs text-brand-secondary/80 tracking-wide font-medium self-start sm:self-center">
                      {searchQuery.trim() !== "" ? (
                        <span>Đang lọc chứa: <strong>"{searchQuery}"</strong> ({filteredProducts.length} sản phẩm)</span>
                      ) : (
                        <span>Hiển thị tất cả phật phẩm ({filteredProducts.length} phục tà)</span>
                      )}
                    </div>
                    
                    {/* Sorting select bar */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-stone whitespace-nowrap">Sắp xếp:</span>
                      <div className="relative flex items-center">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-transparent border-none text-xs font-semibold text-brand-primary focus:ring-0 cursor-pointer pr-7 outline-none py-1 select-none"
                          id="sort-select"
                        >
                          <option value="Mới nhất">Mới nhất</option>
                          <option value="Giá tăng dần">Giá tăng dần</option>
                          <option value="Giá giảm dần">Giá giảm dần</option>
                        </select>
                        <ChevronDown size={11} className="text-brand-primary absolute right-1 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Displaying target lists */}
                  <ProductGrid
                    products={filteredProducts}
                    onProductClick={setSelectedProduct}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Structured Footer */}
      <footer className="bg-surface-container py-16 mt-section-gap border-t border-outline-variant" id="tutamphuc-footer">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter">
          {/* Brand Intro column */}
          <div className="flex flex-col gap-6">
            <span className="font-headline-sm text-headline-sm text-primary">Từ Tâm Phục</span>
            <p className="font-body-md text-body-md text-on-surface-variant italic">
              "Khởi tâm từ, diện trang nghiêm."<br/>
              Dưới tà lam nhẹ lướt vầng mây mỏng, gác lại âu lo phiền não ngoài điện tòa.
            </p>
            <div className="flex items-center gap-2 mt-2 font-caption text-caption text-outline">
              <MapPin size={14} className="text-primary" />
              Đạo Tràng: 2026 Từ Tâm Phục, Việt Nam
            </div>
          </div>

          {/* Core educational quick links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider">
              Khám Phá Thiền Vị
            </h4>
            <div className="flex flex-col gap-2">
              <button onClick={() => alert("Chương trình dệt phục sinh ‘The Art of Wear’ tôn vinh sợi dập thô mộc xơ tự nhiên, mài dũa oai nghi áo rủ an bình.")} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left">
                The Art of Wear
              </button>
              <button onClick={() => alert("Bảo dưỡng vải linen dệt tơ: Giặt bằng tay với nước lạnh xà phòng dịu mát, không vặn xoắn cơ học, treo râm mát.")} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left">
                Fabric Care (Giặt Là Tịnh Dưỡng)
              </button>
              <button onClick={() => alert("Thiền tự thanh quy tế hạnh: Trang phục luôn che khủ tôn kính từ bờ vai tới đầu gối oai nghi, sắc mặc hoại màu trầm rủ thanh mộc.")} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left">
                Temple Etiquette (Quy Tắc Chữ Tự)
              </button>
            </div>
          </div>

          {/* Help queries support topics */}
          <div className="flex flex-col gap-4">
            <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider">
              Hỗ Trợ Phật Tử
            </h4>
            <div className="flex flex-col gap-2">
              <button onClick={() => setIsAssistantOpen(true)} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left flex items-start gap-1">
                <Sparkles size={14} className="text-amber-800 self-center" /> Sizing Guide (AI đo size tự động)
              </button>
              <button onClick={() => alert("Từ Tâm Phục chế tác chay bảo vệ vạn linh súc vật, quy trình lọc thuốc nhuộm dệt hoàn toàn chiết xuất củ vỏ thảo mộc nguyên sinh.")} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left">
                Sustainability (Gieo mầm xanh)
              </button>
              <button onClick={() => alert("Thông tin đạo hữu Phật tử được Từ Tâm Phục bảo mật nghiêm cẩn trong hòm bảo mật tự viện.")} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left">
                Privacy Policy (Mật pháp bảo an)
              </button>
            </div>
          </div>

          {/* Newsletter registration panel */}
          <div className="flex flex-col gap-4">
            <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider">
              Đăng ký nhận duyên lành
            </h4>
            <p className="font-body-md text-body-md text-on-surface-variant mb-2">
              Quý phật tử vui lòng điền thư tín điện tử để thăng thụ các dòng kệ an lành.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Email của đạo hữu..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="px-4 py-2 border border-outline bg-surface text-on-surface rounded-lg w-full font-body-md"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors duration-500 rounded-lg whitespace-nowrap"
                id="newsletter-submit-btn"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        {/* Footer brand copyright notes */}
        <div className="mt-16 text-center font-caption text-caption text-on-surface-variant/70 border-t border-outline-variant/40 pt-6">
          © 2026 Từ Tâm Phục. Tất cả các y tự được thực hiện chay tinh tấn bởi lòng thành kính từ bi của bổn hiệu Phật tử tinh hoa.
        </div>
      </footer>


      {/* Floating Dialog Modals and Drawers overlay layers */}
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onAskAIAboutProduct={handleAskAIAboutProduct}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      <ZenAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        selectedProduct={selectedProduct}
        conversation={conversation}
        setConversation={setConversation}
      />
    </div>
  );
}
