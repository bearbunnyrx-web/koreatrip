export default function BottomNav({ tabs = [], tabMeta = {}, activeTab, onSelect }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Bottom navigation">
      {tabs.map((tab) => {
        const meta = tabMeta[tab] ?? { label: tab, navLabel: tab, icon: '•' }
        return (
          <button
            key={tab}
            aria-label={meta.label}
            className={activeTab === tab ? 'mobile-tab active' : 'mobile-tab'}
            onClick={() => onSelect?.(tab)}
            type="button"
          >
            <span className="mobile-tab-icon" aria-hidden="true">{meta.icon}</span>
            <small>{meta.navLabel ?? meta.label}</small>
          </button>
        )
      })}
    </nav>
  )
}
