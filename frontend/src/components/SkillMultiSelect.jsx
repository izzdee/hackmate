import { useCallback, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import SkillChip from './SkillChip';
import useClickOutside from '../hooks/useClickOutside';

// Searchable multi-select for skills.
//   allSkills: Skill[] from GET /skills
//   value: selected skill ids, onChange(newIds)
export default function SkillMultiSelect({ allSkills, value, onChange, placeholder = 'Search skills…', id }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(boxRef, close, open);

  const selected = allSkills.filter((s) => value.includes(s.id));
  const options = useMemo(
    () => allSkills.filter((s) => !value.includes(s.id) && s.name.toLowerCase().includes(query.trim().toLowerCase())),
    [allSkills, value, query]
  );

  const add = (skillId) => {
    onChange([...value, skillId]);
    setQuery('');
  };
  const remove = (skillId) => onChange(value.filter((v) => v !== skillId));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // don't submit the form
      if (options[0]) add(options[0].id);
    } else if (e.key === 'Backspace' && !query && value.length) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
        {selected.map((s) => <SkillChip key={s.id} label={s.name} variant="selected" onRemove={() => remove(s.id)} />)}
        <div className="flex min-w-[140px] flex-1 items-center gap-1">
          <Search size={14} className="text-slate-400" />
          <input
            id={id}
            className="w-full bg-transparent py-0.5 text-sm outline-none placeholder:text-slate-400"
            value={query}
            placeholder={selected.length ? 'Add more…' : placeholder}
            onFocus={() => setOpen(true)}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      {open && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">{query ? 'No matching skills' : 'All skills selected'}</li>
          ) : (
            options.map((s) => (
              <li key={s.id}>
                <button type="button" className="w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-indigo-50" onClick={() => add(s.id)}>
                  {s.name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
