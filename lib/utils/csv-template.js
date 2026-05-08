// Columnas esperadas en el CSV — en este orden
export const CSV_COLUMNS = [
  "sku", // obligatorio
  "name", // obligatorio
  "price", // obligatorio
  "category", // nombre de la categoría (ej: "Lácteos")
  "brand", // marca
  "description", // descripción opcional
  "barcode", // código de barras EAN
  "unit", // unidad: unidad, kg, litro, pack
  "compare_price", // precio tachado (opcional)
  "is_active", // 1 o 0 (default: 1)
];

// Genera y descarga un CSV de ejemplo para darle al cliente
export function downloadTemplate() {
  const headers = CSV_COLUMNS.join(",");
  const example = [
    "COC-500,Coca Cola 500ml,850,Bebidas,Coca Cola,Gaseosa cola 500ml,7790895000084,unidad,950,1",
    "COC-1500,Coca Cola 1.5L,1500,Bebidas,Coca Cola,Gaseosa cola 1.5 litros,7790895000091,unidad,,1",
    "LAC-001,Leche La Serenísima Entera 1L,980,Lácteos,La Serenísima,,7790387000015,litro,,1",
  ].join("\n");

  const content = `${headers}\n${example}`;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "plantilla_productos_valerga.csv";
  link.click();

  URL.revokeObjectURL(url);
}
