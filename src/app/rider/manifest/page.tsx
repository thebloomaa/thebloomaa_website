'use client';

type OrderStatus = 'QUEUED' | 'DELIVERED' | 'FAILED';

const statusStyles: Record<OrderStatus, { bg: string; color: string; label: string }> = {
  QUEUED: { bg: 'rgba(96, 165, 250, 0.12)', color: '#93C5FD', label: 'Queued' },
  DELIVERED: { bg: 'rgba(16, 185, 129, 0.12)', color: '#6EE7B7', label: 'Delivered' },
  FAILED: { bg: 'rgba(239, 68, 68, 0.12)', color: '#FCA5A5', label: 'Failed' },
};

export default function RiderManifestPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');

  React.useEffect(() => {
    fetch('/api/rider/manifest')
      .then(res => res.json())
      .then(data => {
        if (data.routes) {
          setRoutes(data.routes);
          setDate(data.date);
          
          let del = 0, fail = 0;
          data.routes.forEach((r: any) => {
            r.orders.forEach((o: any) => {
              if (o.status === 'DELIVERED') del++;
              if (o.status === 'FAILED') fail++;
            });
          });
          setDeliveredCount(del);
          setFailedCount(fail);
        }
        setLoading(false);
      });
  }, []);

  const totalOrders = routes.reduce((acc, r) => acc + r.orders.length, 0);
  const pendingCount = totalOrders - deliveredCount - failedCount;

  const updateOrderStatus = (pincode: string, orderId: string, newStatus: 'DELIVERED' | 'FAILED') => {
    setRoutes(prev =>
      prev.map(route => {
        if (route.pincode !== pincode) return route;
        return {
          ...route,
          orders: route.orders.map(o =>
            o.id === orderId ? { ...o, status: newStatus } : o
          ),
        };
      })
    );
    if (newStatus === 'DELIVERED') setDeliveredCount(c => c + 1);
    if (newStatus === 'FAILED') setFailedCount(c => c + 1);
  };

  return (
    <main className="min-h-screen px-4 py-6" style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-[var(--text-muted)]">Loading manifest...</div>
        ) : (
          <>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🚴</span>
              <h1 className="text-xl font-black">Today&apos;s Manifest</h1>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{date} · Hi, Rider!</p>
          </div>
          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
            Logout
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(96, 165, 250, 0.08)', border: '1px solid rgba(96, 165, 250, 0.15)' }}>
            <p className="text-lg font-black" style={{ fontFamily: 'var(--font-mono)', color: '#93C5FD' }}>{pendingCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#93C5FD' }}>Pending</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
            <p className="text-lg font-black" style={{ fontFamily: 'var(--font-mono)', color: '#6EE7B7' }}>{deliveredCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#6EE7B7' }}>Delivered</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
            <p className="text-lg font-black" style={{ fontFamily: 'var(--font-mono)', color: '#FCA5A5' }}>{failedCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#FCA5A5' }}>Failed</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
            <span>Completion</span>
            <span>{deliveredCount + failedCount} / {totalOrders}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((deliveredCount + failedCount) / totalOrders) * 100}%`, background: 'linear-gradient(90deg, #10B981, #34D399)' }} />
          </div>
        </div>

        {/* Routes grouped by pincode */}
        <div className="space-y-6">
          {routes.map(route => (
            <div key={route.pincode}>
              {/* Route Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">📍</span>
                <h2 className="text-sm font-bold">{route.neighborhood}</h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                  {route.pincode}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {route.orders.length} orders</span>
              </div>

              {/* Order Cards */}
              <div className="space-y-3">
                {route.orders.map(order => {
                  const st = statusStyles[order.status as OrderStatus];
                  const isCompleted = order.status !== 'QUEUED';
                  return (
                    <div key={order.id} className="rounded-xl p-4 transition-all" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', opacity: isCompleted ? 0.6 : 1 }}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{order.id}</span>
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                          </div>
                          <h3 className="text-sm font-bold">{order.customer}</h3>
                        </div>
                        <a href={`tel:${order.phone}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#6EE7B7' }}>
                          📞
                        </a>
                      </div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>📍 {order.address}</p>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                        ⏰ <span className="font-bold text-white">{order.time}</span> · 🥗 {order.meal} · 🔥 {order.calories} kcal
                      </p>

                      {!isCompleted && (
                        <div className="flex gap-2">
                          <button onClick={() => updateOrderStatus(route.pincode, order.id, 'DELIVERED')}
                            className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{ background: 'var(--brand-primary)' }}>
                            ✓ Delivered
                          </button>
                          <button onClick={() => updateOrderStatus(route.pincode, order.id, 'FAILED')}
                            className="py-2 px-4 rounded-lg text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            ✕ Failed
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {routes.length === 0 && (
          <div className="text-center py-10 text-[var(--text-muted)] border rounded-xl" style={{ borderColor: 'var(--border-subtle)' }}>
            No orders queued for today.
          </div>
        )}
        </>
        )}
      </div>
    </main>
  );
}
