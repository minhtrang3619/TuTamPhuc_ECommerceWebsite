// src/pages/admin/CustomerCare/index.tsx
import { useState } from 'react';
import { Search, Calendar, X, Check } from 'lucide-react';

interface Ticket {
  id: string;
  customer: string;
  subject: string;
  status: 'open' | 'pending' | 'closed';
  createdAt: string;
}

const mockTickets: Ticket[] = [
  { id: 'TCK-001', customer: 'Nguyễn Văn A', subject: 'Vấn đề thanh toán', status: 'open', createdAt: '2024-09-01' },
  { id: 'TCK-002', customer: 'Trần Thị B', subject: 'Thay đổi địa chỉ giao hàng', status: 'pending', createdAt: '2024-09-03' },
  { id: 'TCK-003', customer: 'Lê Văn C', subject: 'Yêu cầu hoàn trả', status: 'closed', createdAt: '2024-08-28' },
];

export default function CustomerCarePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'pending' | 'closed'>('all');

  const filtered = mockTickets.filter((t) => {
    const matchesSearch = t.customer.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <section className="p-8 min-h-screen bg-gradient-to-b from-surface-container-low to-surface-container-high backdrop-blur-sm">
      <h1 className="text-3xl font-display mb-6 text-primary">Quản trị - Nhân viên chăm sóc khách hàng</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Tìm khách hàng hoặc tiêu đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-muted bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="rounded-md border border-muted bg-surface-container-low px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tất cả</option>
          <option value="open">Mở</option>
          <option value="pending">Đang xử lý</option>
          <option value="closed">Đã đóng</option>
        </select>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/90 transition">
          <Calendar size={18} />
          Lọc ngày
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow-sm">
        <table className="min-w-full bg-surface-container-low/50 backdrop-blur-sm">
          <thead className="bg-surface-container-low/80">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-on-surface">Mã Ticket</th>
              <th className="px-4 py-2 text-left font-medium text-on-surface">Khách hàng</th>
              <th className="px-4 py-2 text-left font-medium text-on-surface">Tiêu đề</th>
              <th className="px-4 py-2 text-left font-medium text-on-surface">Trạng thái</th>
              <th className="px-4 py-2 text-left font-medium text-on-surface">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-surface-container-low/30 hover:bg-surface-container-low/20 transition">
                <td className="px-4 py-2 text-label-md text-primary">{t.id}</td>
                <td className="px-4 py-2 text-body-md">{t.customer}</td>
                <td className="px-4 py-2 text-body-md">{t.subject}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                      t.status === 'open'
                        ? 'bg-error/10 text-error'
                        : t.status === 'pending'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-success/10 text-success'
                    }`}
                  >
                    {t.status === 'open' && <X className="inline mr-1" size={14} />}
                    {t.status === 'pending' && <AlertCircle className="inline mr-1" size={14} />}
                    {t.status === 'closed' && <Check className="inline mr-1" size={14} />}
                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-2 text-caption text-muted-foreground">{t.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
