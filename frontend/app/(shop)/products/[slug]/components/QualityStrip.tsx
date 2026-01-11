// Quality Assurance Strip Component
"use client";

export function QualityStrip() {
  const qualityItems = [
    {
      title: "Precision Engineered",
      description: "Advanced components and certified tech partners.",
    },
    {
      title: "Performance Tested",
      description: "Rigorous testing for performance and reliability.",
    },
    {
      title: "Easy Returns",
      description: "Simple returns within the store policy.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-t border-border">
      {qualityItems.map((item, index) => (
        <div key={index} className="text-center">
          <h4 className="text-sm font-medium text-fg mb-1">{item.title}</h4>
          <p className="text-sm text-muted-fg leading-relaxed">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}
