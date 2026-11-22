"use client";

import { LoaderCircle, MapPin, Search } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { geocodingService } from "@/services/geocodingService";
import type { ApiGeocodingResult } from "@/types/api";

interface Props {
  label: string;
  value: string;
  placeholder: string;
  onActivate: () => void;
  onChange: (value: string) => void;
  onSelect: (result: ApiGeocodingResult) => void;
}

export function LocationAutocomplete({ label, value, placeholder, onActivate, onChange, onSelect }: Props) {
  const inputId = useId();
  const listId = useId();
  const [results, setResults] = useState<ApiGeocodingResult[]>([]);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [highlighted, setHighlighted] = useState(-1);

  useEffect(() => {
    const query = value.trim();
    if (!focused || query.length < 3) {
      setResults([]);
      setMessage("");
      setLoading(false);
      return;
    }
    let current = true;
    setLoading(true);
    setMessage("");
    const timer = window.setTimeout(() => {
      geocodingService.search(query)
        .then((items) => {
          if (!current) return;
          setResults(items);
          setHighlighted(items.length ? 0 : -1);
          setMessage(items.length ? "" : "No se encontraron direcciones.");
        })
        .catch(() => {
          if (!current) return;
          setResults([]);
          setMessage("No se pudo consultar direcciones en este momento.");
        })
        .finally(() => { if (current) setLoading(false); });
    }, 650);
    return () => { current = false; window.clearTimeout(timer); };
  }, [focused, value]);

  const choose = (result: ApiGeocodingResult) => {
    onSelect(result);
    setResults([]);
    setMessage("");
    setFocused(false);
  };

  const showMenu = focused && value.trim().length >= 3 && (loading || results.length > 0 || message);

  return <label className="form-field location-autocomplete" htmlFor={inputId}>
    <span>{label}</span>
    <div className="location-autocomplete__control">
      <Search size={16} aria-hidden="true" />
      <input
        id={inputId}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={Boolean(showMenu)}
        aria-controls={listId}
        aria-activedescendant={highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
        required
        onFocus={() => { setFocused(true); onActivate(); }}
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (!results.length) return;
          if (event.key === "ArrowDown") { event.preventDefault(); setHighlighted((value) => (value + 1) % results.length); }
          if (event.key === "ArrowUp") { event.preventDefault(); setHighlighted((value) => (value <= 0 ? results.length - 1 : value - 1)); }
          if (event.key === "Enter" && highlighted >= 0) { event.preventDefault(); choose(results[highlighted]); }
          if (event.key === "Escape") { setResults([]); setFocused(false); }
        }}
      />
      {loading && <LoaderCircle className="location-autocomplete__spinner" size={16} aria-label="Buscando" />}
    </div>
    {showMenu && <div className="location-autocomplete__menu" id={listId} role="listbox">
      {results.map((result, index) => <button
        id={`${listId}-${index}`}
        type="button"
        role="option"
        aria-selected={highlighted === index}
        className={highlighted === index ? "is-highlighted" : ""}
        key={result.id}
        onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => setHighlighted(index)}
        onClick={() => choose(result)}
      ><MapPin size={16} /><span>{result.displayName}</span></button>)}
      {message && <p role="status">{message}</p>}
      <small>Direcciones proporcionadas por OpenStreetMap</small>
    </div>}
  </label>;
}
