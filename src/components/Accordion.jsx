import { useState } from 'react';

export default function Accordion({ items }) {
  const [openItems, setOpenItems] = useState(() => new Set(items.map((_, index) => index)));
  const toggle = (index) => setOpenItems((current) => {
    const next = new Set(current);
    next.has(index) ? next.delete(index) : next.add(index);
    return next;
  });

  return <div className="accordion">
    {items.map(([title, content], index) => {
      const isOpen = openItems.has(index);
      return <div className="accordion-item" key={title}>
        <button className="accordion-trigger" type="button" aria-expanded={isOpen} onClick={() => toggle(index)}>
          <span>{title}</span><img src="/assets/icon-chevron.svg" alt="" />
        </button>
        {isOpen && <div className="accordion-content">{content}</div>}
      </div>;
    })}
  </div>;
}
