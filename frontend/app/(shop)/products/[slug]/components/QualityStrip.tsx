// Quality Assurance Strip Component
"use client";

export function QualityStrip() {
  const qualityItems = [
    {
      title: "Carefully Selected",
      description: "Curated materials and verified suppliers.",
    },
    {
      title: "Quality Check",
      description: "Inspected for finish, packaging, and consistency.",
    },
    {
      title: "Easy Returns",
      description: "Simple returns within the store policy.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-t border-gray-200">
      {qualityItems.map((item, index) => (
        <div key={index} className="text-center">
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            {item.title}
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}
