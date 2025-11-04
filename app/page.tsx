/*
 * LANDING PAGE - Parámetros de Estilo Personalizables
 * 
 * BACKGROUND:
 * - Imagen: /background.png (cambiar en línea src="/background.png")
 * - quality: 100 (calidad de imagen, rango 1-100)
 * - object-cover: cubre toda la pantalla, puede cambiar a object-contain
 * 
 * LOGO PEQUEÑO (Header):
 * - Tamaño: 100x100px (cambiar width={100} height={100})
 * - Posición: px-8 pt-8 (padding horizontal 8, padding top 8)
 * - Texto "LOLFORGE": text-2xl (tamaño), tracking-[0.2em] (espacio entre letras)
 * 
 * DESCRIPCIÓN (Píldora blanca):
 * - Posición: arriba del logo grande
 * - Fondo: bg-white/70 (blanco con 70% opacidad)
 * - Padding: px-8 py-3 (horizontal 8, vertical 3)
 * - Tamaño texto: text-base (16px)
 * - Bordes redondeados: rounded-full
 * 
 * LOGO GRANDE (Centro):
 * - Tamaño: 500x500px (cambiar width={500} height={500})
 * - max-w-[500px]: tamaño máximo en responsive
 * 
 * TEXTO "LOLFORGE" (Debajo del logo):
 * - "LOL": text-6xl (tamaño 60px), text-[#40E0D0] (color turquesa)
 * - "FORGE": text-6xl, text-[#2C2C2C] (color gris oscuro)
 * - tracking-[0.3em] / tracking-[0.08em]: espacio entre letras
 * - gap-2: espacio entre LOL y FORGE
 * 
 * BARRA DE BÚSQUEDA:
 * - Ancho máximo: max-w-md (28rem / 448px)
 * - Fondo: bg-white (blanco sólido)
 * - Padding: px-6 py-4
 * - Bordes redondeados: rounded-full
 * - Ícono: h-6 w-6 text-gray-400
 * - Input: text-lg (18px)
 * 
 * ESPACIADO GENERAL:
 * - gap-8: espacio entre elementos principales (32px)
 * - gap-6: espacio en sección logo/título (24px)
 * - pb-20: padding bottom del contenido principal (80px)
 */

'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const trimmed = searchValue.trim();

    if (!trimmed.includes('#')) {
      setError('Introduce tu invocador como GameName#TAG.');
      return;
    }

    const [rawGameName, rawTagLine] = trimmed.split('#');
    const gameName = rawGameName?.trim();
    const tagLine = rawTagLine?.trim();

    if (!gameName || !tagLine) {
      setError('Introduce tu invocador como GameName#TAG.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/player?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Player not found');
      }

      const data = await response.json();
      router.push(`/recap/${data.puuid}?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Player not found. Please check your Game Name and Tag Line.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image - Modificar: src para cambiar imagen, quality para calidad */}
      <Image
        src="/background.png"
        alt="Background"
        fill
        priority
        className="object-cover"
        quality={75}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header con logo a la izquierda y texto centrado arriba */}
        <header className="px-8 pt-8">
          <div className="relative flex items-start gap-8">
            {/* Logo pequeño a la izquierda - z-10 para estar encima */}
            <a href="/" className="hover:opacity-80 transition-opacity flex-shrink-0 z-10 relative">
              <Image
                src="/logo.png"
                alt="LOLFORGE"
                width={100}
                height={100}
                className="h-[100px] w-[100px]"
              />
            </a>
            {/* Texto descriptivo - Modificar: translate-x-[Xpx] para mover (ejemplo: translate-x-[100px] = 100px derecha, translate-x-[-100px] = 100px izquierda) */}
            <div className="flex items-center flex-1 justify-center translate-x-[-50px] translate-y-[20px] pointer-events-none">
              <div className="rounded-full bg-white/70 px-8 py-3 text-base font-medium text-slate-700 shadow-lg backdrop-blur-sm max-w-4xl pointer-events-auto select-text">
                Discover your League of Legends performance recap. Analyze your stats, champions, and gameplay patterns.
              </div>
            </div>
          </div>
        </header>

        {/* Main content - Modificar: gap-8 para espaciado, pb-20 para margen inferior */}
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 pb-20 text-center translate-y-[-100px]">
          {/* Logo grande clickeable */}
          <a href="/" className="hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="LOLFORGE"
              width={500}
              height={500}
              className="h-auto w-full max-w-[500px]"
            />
          </a>

          {/* Search form - Modificar: max-w-md para ancho máximo */}
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            {/* Barra de búsqueda - Modificar: rounded-full para forma, bg-white para fondo, px-6 py-4 para padding */}
            <div className="flex items-center gap-3 rounded-full bg-white px-6 py-4 shadow-xl">
              {/* Ícono de búsqueda - Modificar: h-6 w-6 para tamaño, text-gray-400 para color */}
              <svg
                aria-hidden
                className="h-6 w-6 flex-shrink-0 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              {/* Input - Modificar: text-lg para tamaño de texto, placeholder para texto de ejemplo */}
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search Summoner#TAG"
                disabled={isLoading}
                className="flex-1 bg-transparent text-lg text-gray-700 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            {/* Mensajes de error/carga - Modificar: mt-3 para espacio superior, text-sm para tamaño */}
            {error && (
              <p className="mt-3 text-sm font-medium text-red-100 drop-shadow">{error}</p>
            )}
            {isLoading && !error && (
              <p className="mt-3 text-sm font-medium text-white drop-shadow">Buscando...</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
