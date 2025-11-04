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

import { useState, useEffect, type FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SearchResult {
  puuid: string;
  gameName: string;
  tagLine: string;
  platform: string;
  platformDisplay: string;
  profileIconId: number;
}

export default function Home() {
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-search functionality
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = searchValue.trim();
    
    // Show dropdown as soon as user starts typing
    if (trimmed.length >= 1) {
      // If has # and both parts have content, search
      if (trimmed.includes('#')) {
        const [gameName, tagLine] = trimmed.split('#');
        if (gameName && tagLine && tagLine.length >= 1) {
          setIsSearching(true);
          searchTimeoutRef.current = setTimeout(async () => {
            try {
              const response = await fetch(`/api/search?query=${encodeURIComponent(trimmed)}`);
              if (response.ok) {
                const data = await response.json();
                setSearchResults(data.results || []);
                setShowDropdown(true); // Always show dropdown when searching
              }
            } catch (err) {
              console.error('Search error:', err);
            } finally {
              setIsSearching(false);
            }
          }, 300); // Reduced delay to 300ms for faster response
        } else {
          // Show dropdown with guide message
          setShowDropdown(true);
          setSearchResults([]);
        }
      } else {
        // Show dropdown with guide message (no # yet)
        setShowDropdown(true);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (result: SearchResult) => {
    setSearchValue(`${result.gameName}#${result.tagLine}`);
    setShowDropdown(false);
    setIsLoading(true);
    router.push(`/recap/${result.puuid}?gameName=${encodeURIComponent(result.gameName)}&tagLine=${encodeURIComponent(result.tagLine)}`);
  };

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
          <form onSubmit={handleSubmit} className="w-full max-w-md relative">
            {/* Contenedor de búsqueda con dropdown */}
            <div ref={dropdownRef} className="relative">
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
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowDropdown(true);
                    }
                  }}
                  placeholder="Search Summoner#TAG"
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-lg text-gray-700 placeholder:text-gray-400 focus:outline-none"
                />
                {isSearching && (
                  <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-[#40E0D0] rounded-full"></div>
                )}
              </div>

              {/* Dropdown de resultados */}
              {showDropdown && (
                <div className="absolute top-full mt-2 w-full min-w-[500px] bg-[#1A1D21] rounded-2xl shadow-2xl overflow-hidden z-50 border border-[#E0EDFF]/10">
                  {searchResults.length > 0 ? (
                    <div className="py-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {searchResults.slice(0, 8).map((result, index) => (
                        <button
                          key={`${result.puuid}-${index}`}
                          type="button"
                          onClick={() => handleSelectResult(result)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#23262A] transition-colors text-left group"
                        >
                          <div className="flex items-center gap-3">
                            {/* Profile Icon */}
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#E0EDFF]/20 group-hover:border-[#40E0D0] transition-colors flex-shrink-0">
                              <Image
                                src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/${result.profileIconId}.png`}
                                alt={result.gameName}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            
                            {/* Name and Tag */}
                            <div className="flex flex-col min-w-0">
                              <span className="text-base font-bold text-[#FFFAFA] group-hover:text-[#40E0D0] transition-colors truncate">
                                {result.gameName}
                              </span>
                              <span className="text-sm text-[#E0EDFF]/60">
                                #{result.tagLine}
                              </span>
                            </div>
                          </div>
                          
                          {/* Server Badge */}
                          <span className="px-3 py-1 rounded-full bg-[#40E0D0]/20 text-[#40E0D0] text-xs font-bold border border-[#40E0D0]/40 flex-shrink-0">
                            {result.platformDisplay}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-4">
                      <div className="flex items-center gap-3 text-[#E0EDFF]/60">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">
                          {isSearching ? 'Searching...' : 'Enter full format: GameName#TAG'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
