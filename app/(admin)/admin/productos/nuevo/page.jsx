export default function NuevoProductoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo producto</h1>
        <p className="text-gray-500 mt-1">Agregar producto manualmente</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
        <p className="text-3xl mb-3">🚧</p>
        <p className="font-medium">Carga manual en desarrollo</p>
        <p className="text-sm mt-1">
          Usa el importador CSV para cargar productos masivamente
        </p>

        <a
          href="/admin/productos/importar"
          className="inline-block mt-4 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Ir al importador
        </a>
      </div>
    </div>
  );
}
