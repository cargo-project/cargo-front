import { Search } from "lucide-react";
export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="filter-search"><Search size={17} /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type="search" /></label>; }
