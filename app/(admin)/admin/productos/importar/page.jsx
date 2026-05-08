"use client";

import { useState } from "react";
import { downloadTemplate } from "@/lib/utils/csv-template";
import toast from "react-hot-toast";

export default function ImportarProductosPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleImport() {
    if (!file) {
      toast.error("Seleccioná un archivo primero");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({ type: "error", data });
        toast.error("Hubo errores en la importación");
        return;
      }

      setResult({ type: "success", data });
      toast.success(`${data.inserted} productos importados correctamente`);
      setFile(null);
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Importar productos</h1>
        <p className="text-gray-500 mt-1">
          Cargá hasta 20.000 productos desde un archivo CSV
        </p>
      </div>

      {/* Paso 1: Descargar plantilla */}
      <div className="border rounded-lg p-4 space-y-2">
        <h2 className="font-semibold">Paso 1 — Descargá la plantilla</h2>
        <p className="text-sm text-gray-500">
          Usá esta plantilla para preparar el archivo con el formato correcto.
        </p>
        <button
          onClick={downloadTemplate}
          className="text-sm underline text-blue-600 hover:text-blue-800"
        >
          Descargar plantilla CSV
        </button>
      </div>

      {/* Paso 2: Subir archivo */}
      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">Paso 2 — Subí tu archivo</h2>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => document.getElementById("csv-input").click()}
        >
          {file ? (
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-500">Hacé clic para seleccionar el CSV</p>
              <p className="text-xs text-gray-400 mt-1">Solo archivos .csv</p>
            </div>
          )}
        </div>

        <input
          id="csv-input"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      {/* Paso 3: Importar */}
      <button
        onClick={handleImport}
        disabled={!file || loading}
        className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
      >
        {loading ? "Importando..." : "Importar productos"}
      </button>

      {/* Resultados */}
      {result && (
        <div
          className={`border rounded-lg p-4 space-y-2 ${
            result.type === "success"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          {result.type === "success" ? (
            <>
              <p className="font-semibold text-green-800">
                ✅ {result.data.inserted} productos importados
              </p>
              <p className="text-sm text-green-700">
                Se procesaron {result.data.total_rows} filas en total
              </p>
              {result.data.errors?.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-yellow-700">
                    Advertencias:
                  </p>
                  {result.data.errors.map((err, i) => (
                    <p key={i} className="text-xs text-yellow-600">
                      {err}
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="font-semibold text-red-800">
                ❌ {result.data.error}
              </p>
              {result.data.details?.map((detail, i) => (
                <p key={i} className="text-xs text-red-600">
                  {detail}
                </p>
              ))}
              {result.data.total_errors > 20 && (
                <p className="text-xs text-red-500">
                  ...y {result.data.total_errors - 20} errores más. Corregí el
                  archivo y volvé a intentar.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
