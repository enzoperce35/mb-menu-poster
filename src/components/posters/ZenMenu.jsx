import React, { useMemo } from "react";
import "./ZenMenu.css";

export default function ZenMenu({ groups = [], shop }) {

  const menuData = useMemo(() => {
    const getItemsByGroupIds = (ids) => {
      const targetIds = ids.map(String);
      
      const rawProducts = groups
        .filter(g => targetIds.includes(String(g.id)))
        .flatMap(g => g.products || [])
        .filter(p => p.stock > 0);

      const uniqueProducts = [];
      const seenIds = new Set();

      rawProducts.forEach(p => {
        if (!seenIds.has(p.id)) {
          uniqueProducts.push(p);
          seenIds.add(p.id);
        }
      });

      // Sort: special products at the top of their category
      return uniqueProducts.sort((a, b) => {
        const aSpecial = a.special === true || a.special === 1;
        const bSpecial = b.special === true || b.special === 1;
        return bSpecial - aSpecial; 
      });
    };

    return [
      { title: "Breakfast", range: "6:00 AM - 8:00 AM", data: getItemsByGroupIds([3, 4, 5]) },
      { title: "Lunch", range: "11:00 AM - 1:00 PM", data: getItemsByGroupIds([8, 9, 10]) },
      { title: "Merienda", range: "2:00 PM - 5:00 PM", data: getItemsByGroupIds([11, 12, 13, 14]) },
      { title: "Dinner", range: "6:00 PM - 9:00 PM", data: getItemsByGroupIds([15, 16, 17]) },
    ];
  }, [groups]);

  const totalItems = menuData.reduce((acc, slot) => acc + slot.data.length, 0);

  if (totalItems === 0) {
    return (
      <div className="zen-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h1 className="shop-name">{shop?.name}</h1>
        <p style={{ color: '#888' }}>No active products found.</p>
      </div>
    );
  }

  return (
    <div className="zen-container">
      <header className="zen-header">
        <h1 className="shop-name">{shop?.name || "Zen Menu"}</h1>
        <div className="zen-line"></div>
        <p className="zen-date">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <main className="zen-content">
        {menuData.map(slot => (
          slot.data.length > 0 && (
            <section key={slot.title} className="zen-section">
              <div className="section-title-wrapper">
                <h2 className="section-title">{slot.title}</h2>
                <span className="time-badge">{slot.range}</span>
              </div>
              
              <div className="zen-grid">
                {slot.data.map(item => (
                  <div key={item.id} className={`zen-item ${item.special ? "is-gold" : ""}`}>
                    <div className="item-main">
                      <span className="item-name">{item.name}</span>
                    </div>
                    {item.description && <p className="item-desc">{item.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )
        ))}
      </main>
      
      <footer className="zen-footer">
        <p>End of Menu</p>
      </footer>
    </div>
  );
}
