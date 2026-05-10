"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const BANNERS = [
  {
    id: 2,
    title: "Ofertas en Lacteos",
    desc: "Hasta 20% OFF",
    cta: "Ver ofertas",
    href: "/categoria/lacteos",
    image:
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=1200&q=80",
    gradient:
      "linear-gradient(to right, rgba(37,99,235,0.85) 0%, rgba(37,99,235,0.4) 50%, transparent 100%)",
  },
  {
    id: 3,
    title: "Carnes Premium",
    desc: "20% OFF esta semana",
    cta: "Ver ofertas",
    href: "/categoria/carnes",
    image:
      "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&q=80",
    gradient:
      "linear-gradient(to right, rgba(220,38,38,0.85) 0%, rgba(220,38,38,0.4) 50%, transparent 100%)",
  },
  {
    id: 4,
    title: "Ofertas de la semana",
    desc: "Precios especiales en toda la tienda",
    cta: "Ver todos",
    href: "/buscar",
    image:
      "https://i.pinimg.com/originals/8d/d3/e2/8dd3e2b92e06c154f7c27bfc6a2ff8fc.jpg",
    gradient:
      "linear-gradient(to right, rgba(249,115,22,0.85) 0%, rgba(249,115,22,0.4) 50%, transparent 100%)",
  },
];

export default function BannerSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  function prev() {
    setCurrent((p) => (p - 1 + BANNERS.length) % BANNERS.length);
  }

  function next() {
    setCurrent((p) => (p + 1) % BANNERS.length);
  }

  const banner = BANNERS[current];

  return (
    <div className="relative rounded-2xl overflow-hidden h-52 md:h-64">
      {/* Imagen de fondo */}
      <img
        src={banner.image}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
      />

      {/* Gradiente encima */}
      <div
        className="absolute inset-0"
        style={{ background: banner.gradient }}
      />

      {/* Contenido */}
      <div className="relative z-10 h-full flex items-center px-8 md:px-12">
        <div>
          <h2 className="text-white text-2xl md:text-3xl font-black mb-1 drop-shadow">
            {banner.title}
          </h2>
          <p className="text-white text-sm mb-4 drop-shadow opacity-90">
            {banner.desc}
          </p>
          <Link
            href={banner.href}
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            {banner.cta}
          </Link>
        </div>
      </div>

      {/* Flechas */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-colors"
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      >
        ‹
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-colors"
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      >
        ›
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all"
            style={{
              width: i === current ? "20px" : "6px",
              height: "6px",
              backgroundColor:
                i === current ? "white" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
