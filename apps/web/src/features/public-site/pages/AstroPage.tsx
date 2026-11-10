/* eslint-disable max-len -- Astro UI markup and provider schema literals use long declarative values. */
'use client';

import { AstroInsights } from '../components/AstroInsights';
import heroBackdrop from '@/assets/Images/background-image.webp';
import { buttonVariants } from '@/components/ui/button-variants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Link } from '@/lib/navigation';
import { apiRequest, isApiError } from '@/services/api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  History,
  Loader2,
  LockKeyhole,
  MapPin,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { type FormEvent, useState } from 'react';

type Place = { name: string; latitude: number; longitude: number; timezone: string };
type Planet = { sign: string; degree: number | null; house: number | null; nakshatra: string | null; pada: number | null; retrograde: boolean | null };
type Reading = {
  _id: string;
  name: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  birthDate: string;
  birthTime: string;
  birthplace: Place & { birthUtcOffset: number };
  summary: { sun: Planet; moon: Planet; ascendant: Planet };
  planets: Record<string, Planet>;
  createdAt: string;
};
type Result<T> = { success: true; data: T };
const historyKey = ['astro', 'history'] as const;
const inputClass = 'min-h-12 w-full rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-night)] px-4 text-[13px] text-[var(--ds-text)] outline-none transition placeholder:text-[var(--ds-muted-soft)] focus:border-[var(--ds-border-gold)] focus:ring-2 focus:ring-[var(--ds-amber-08)]';
const labelClass = 'mb-2 block text-[11px] font-semibold text-[var(--ds-text)]';
const planetOrder = ['Sun', 'Moon', 'Ascendant', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'];
const genderOptions = [
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other / self-described' },
] as const;

function errorMessage(error: unknown) {
  return isApiError(error) ? error.message : 'Unable to connect. Please try again.';
}
function prettyDate(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
function SignBlock({ title, text, icon: Icon, info }: { title: string; text: string; icon: typeof Sun; info: Planet }) {
  return (
    <div className="rounded-2xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-5 transition hover:border-[var(--ds-border-gold)]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)] text-[var(--ds-soft-gold)]"><Icon size={22} strokeWidth={1.6} /></span>
        <span className="text-[9px] uppercase tracking-[0.14em] text-[var(--ds-muted)]">{title}</span>
      </div>
      <p className="mt-5 font-serif text-2xl text-[var(--ds-cream)]">{info.sign}</p>
      <p className="mt-1 text-[11px] text-[var(--ds-muted)]">{text}</p>
      {info.nakshatra && <p className="mt-3 text-[10px] text-[var(--ds-gold)]">{info.nakshatra}{info.pada ? ` · Pada ${info.pada}` : ''}</p>}
    </div>
  );
}
function ChartResult({ reading, onRemove, removing }: { reading: Reading; onRemove: (id: string) => void; removing: boolean }) {
  return (
    <section aria-label="Your Vedic birth chart" className="ds-panel overflow-hidden p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--ds-border-soft)] pb-5">
        <div>
          <p className="ds-eyebrow">Your celestial snapshot</p>
          <h2 className="mt-2 font-serif text-[25px] text-[var(--ds-cream)] sm:text-[30px]">{reading.name}&apos;s birth chart</h2>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--ds-muted)]">
            <CalendarDays size={13} /> {prettyDate(reading.birthDate)} · {reading.birthTime}
            <span aria-hidden="true">·</span><MapPin size={12} /> {reading.birthplace.name}
          </p>
        </div>
        <button type="button" disabled={removing} onClick={() => onRemove(reading._id)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-500/20 px-3 text-[11px] text-red-300 transition hover:bg-red-500/10 disabled:opacity-50">
          {removing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete chart
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SignBlock title="Surya · Sun" text="Sidereal Sun sign" icon={Sun} info={reading.summary.sun} />
        <SignBlock title="Chandra · Moon" text="Moon sign · Rashi" icon={Moon} info={reading.summary.moon} />
        <SignBlock title="Lagna · Rising" text="Ascendant sign" icon={Compass} info={reading.summary.ascendant} />
      </div>
      <AstroInsights key={reading._id} reading={reading} />
      <div className="mt-7 flex items-center gap-2"><Star size={15} className="text-[var(--ds-gold)]" /><h3 className="font-serif text-lg">Planetary placements</h3></div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ds-border-soft)]">
        <table className="w-full min-w-[470px] text-left text-[11px]">
          <thead className="bg-[var(--ds-white-03)] text-[var(--ds-muted)]"><tr><th scope="col" className="px-4 py-3 font-medium">Body</th><th scope="col" className="px-4 py-3 font-medium">Sign</th><th scope="col" className="px-4 py-3 font-medium">House</th><th scope="col" className="px-4 py-3 font-medium">Nakshatra</th></tr></thead>
          <tbody className="divide-y divide-[var(--ds-border-soft)]">
            {planetOrder.filter((name) => reading.planets?.[name]).map((name) => {
              const planet = reading.planets[name];
              return <tr key={name} className="text-[var(--ds-text)]"><th scope="row" className="px-4 py-3 font-semibold">{name}</th><td className="px-4 py-3 text-[var(--ds-soft-gold)]">{planet.sign}{planet.degree !== null ? ` · ${planet.degree.toFixed(1)}°` : ''}</td><td className="px-4 py-3">{planet.house ?? '—'}</td><td className="px-4 py-3">{planet.nakshatra ?? '—'}{planet.pada ? ` (${planet.pada})` : ''}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-5 text-[10px] leading-6 text-[var(--ds-muted)]">Traditional Vedic/sidereal (Lahiri) chart data provided by FreeAstrologyAPI. Astrology is a cultural and interpretive tradition, not a scientifically validated way to predict events, health, or life outcomes. Birth times and historical timezone differences can change the Ascendant.</p>
    </section>
  );
}

export function AstroPage() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Reading['gender']>('prefer_not_to_say');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [placeInput, setPlaceInput] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [placeError, setPlaceError] = useState('');
  const [placeLoading, setPlaceLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [page, setPage] = useState(1);
  const [activeReading, setActiveReading] = useState<Reading | null>(null);
  const [notice, setNotice] = useState('');

  const history = useQuery({
    queryKey: [...historyKey, page],
    queryFn: () => apiRequest<Result<{ items: Reading[]; total: number; page: number; limit: number }>>(`/astro/history?page=${page}&limit=8`),
    enabled: auth.isAuthenticated,
    staleTime: 0,
  });
  const create = useMutation({
    mutationFn: (input: { name: string; gender: Reading['gender']; birthDate: string; birthTime: string; birthplace: Place; consent: true }) =>
      apiRequest<Result<{ item: Reading }>>('/astro/chart', { method: 'POST', body: JSON.stringify(input) }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiRequest('/astro/history/' + encodeURIComponent(id), { method: 'DELETE' }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: historyKey }); },
  });

  async function findPlaces() {
    setSelectedPlace(null);
    setPlaces([]);
    setPlaceError('');
    setPlaceLoading(true);
    try {
      if (placeInput.trim().length < 3) { setPlaceError('Enter at least three characters.'); return; }
      const results = await apiRequest<Result<{ places: Place[] }>>(`/astro/places?q=${encodeURIComponent(placeInput.trim())}`);
      setPlaces(results.data.places);
      if (!results.data.places.length) setPlaceError('No matches found. Try city, state and country.');
    } catch (error) { setPlaceError(errorMessage(error)); }
    finally { setPlaceLoading(false); }
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    if (!selectedPlace) { setNotice('Search for and select your birthplace first.'); return; }
    if (!consent) { setNotice('Please confirm the privacy notice to continue.'); return; }
    if (!name.trim() || !birthDate || !birthTime) { setNotice('Complete the name, date and time fields.'); return; }
    try {
      const result = await create.mutateAsync({ name: name.trim(), gender, birthDate, birthTime, birthplace: selectedPlace, consent: true });
      setActiveReading(result.data.item);
      setNotice('Your chart was calculated and saved privately to your account.');
      setPage(1);
      await queryClient.invalidateQueries({ queryKey: historyKey });
    } catch (error) { setNotice(errorMessage(error)); }
  }

  async function deleteReading(id: string) {
    if (!window.confirm('Permanently delete this saved birth chart?')) return;
    setNotice('');
    try {
      await remove.mutateAsync(id);
      if (activeReading?._id === id) setActiveReading(null);
      setNotice('Chart deleted from your history.');
    } catch (error) { setNotice(errorMessage(error)); }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
      <header className="relative overflow-hidden rounded-[24px] border border-[var(--ds-border-gold)] bg-[var(--ds-gradient-panel)] px-6 py-10 shadow-[var(--ds-shadow-card)] sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <Image src={heroBackdrop} alt="" fill sizes="(max-width: 768px) 100vw, 1200px" className="object-cover object-center opacity-[0.16]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--ds-sidebar)] via-[var(--ds-sidebar)]/90 to-[var(--ds-sidebar)]/30" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-24 size-72 rounded-full bg-[var(--ds-amber-08)] blur-[70px]" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="ds-eyebrow flex items-center gap-2"><Sparkles size={14} /> The cosmic mirror · Jyotish</p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-[var(--ds-cream)] sm:text-5xl lg:text-[54px]">Discover your <span className="text-[var(--ds-soft-gold)]">celestial beginnings</span></h1>
            <p className="mt-5 max-w-2xl text-[13px] leading-7 text-[var(--ds-muted)] sm:text-[15px]">Explore your basic Vedic birth placements — Sun, Moon, Lagna and planetary positions — in one calm, private space.</p>
          </div>
          <div aria-hidden="true" className="relative mx-auto flex size-44 items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-night)] shadow-[0_0_70px_rgba(217,157,62,0.08)] sm:size-52">
            <div className="absolute inset-4 rounded-full border border-[var(--ds-border-gold)] opacity-65" />
            <div className="absolute inset-9 rounded-full border border-dashed border-[var(--ds-border-gold)] opacity-55" />
            <Sun className="text-[var(--ds-soft-gold)]" size={50} strokeWidth={1.2} />
            <Star className="absolute -right-2 top-9 text-[var(--ds-gold)]" size={18} />
            <Moon className="absolute -left-2 bottom-9 text-[var(--ds-gold)]" size={22} />
          </div>
        </div>
      </header>

      {auth.isLoading ? <div className="ds-panel mt-8 p-8" role="status">Checking your session…</div> : !auth.isAuthenticated ? (
        <section className="ds-panel mx-auto mt-8 max-w-2xl p-7 text-center sm:p-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)] text-[var(--ds-soft-gold)]"><LockKeyhole size={24} /></div>
          <h2 className="mt-5 font-serif text-2xl">Your birth chart is personal</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--ds-muted)]">Sign in or create a free account to generate a reading and return to your saved history whenever you like.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/auth/login" className={`${buttonVariants()} min-h-11 rounded-xl px-6`}>Sign In <ArrowRight size={15} /></Link>
            <Link to="/auth/register" className={`${buttonVariants({ variant: 'outline' })} min-h-11 rounded-xl px-6`}>Create Account</Link>
          </div>
        </section>
      ) : (
        <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <section className="ds-panel p-6 sm:p-8">
            <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)]"><Compass size={19} className="text-[var(--ds-soft-gold)]" /></span><div><p className="ds-eyebrow">Create a reading</p><h2 className="font-serif text-xl">Your birth details</h2></div></div>
            <p className="mt-5 text-[11px] leading-6 text-[var(--ds-muted)]">For an accurate rising sign, use your recorded birth time and select the correct birthplace. We never send your name or gender to the astrology provider.</p>
            <form onSubmit={(event) => { void generate(event); }} className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="astro-name" className={labelClass}>Name</label><input id="astro-name" required minLength={2} maxLength={80} autoComplete="name" placeholder={auth.user?.name ?? 'Your name'} className={inputClass} value={name} onChange={(event) => setName(event.target.value)} /></div>
                <div><label htmlFor="astro-gender" className={labelClass}>Gender</label><select id="astro-gender" className={inputClass} value={gender} onChange={(event) => setGender(event.target.value as Reading['gender'])}>{genderOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="astro-date" className={labelClass}>Date of birth</label><input id="astro-date" type="date" required min="1900-01-01" max={new Date().toISOString().slice(0, 10)} className={inputClass} value={birthDate} onChange={(event) => setBirthDate(event.target.value)} /></div>
                <div><label htmlFor="astro-time" className={labelClass}>Time of birth (24-hour)</label><input id="astro-time" type="time" required className={inputClass} value={birthTime} onChange={(event) => setBirthTime(event.target.value)} /></div></div>
              <div>
                <label htmlFor="astro-place" className={labelClass}>Birthplace (city, state, country)</label>
                <div className="flex gap-2">
                  <input id="astro-place" className={inputClass} placeholder="Search in English: Lucknow, India" minLength={3} maxLength={90} value={placeInput} onChange={(event) => { setPlaceInput(event.target.value); setSelectedPlace(null); setPlaces([]); }} />
                  <button type="button" onClick={() => { void findPlaces(); }} disabled={placeLoading} className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-10)] px-4 text-[11px] font-semibold text-[var(--ds-soft-gold)] transition hover:bg-[var(--ds-amber-08)] disabled:opacity-50">{placeLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Find</button>
                </div>
                {placeError && <p role="alert" className="mt-2 text-[11px] text-red-300">{placeError}</p>}
                {places.length > 0 && !selectedPlace && <div aria-label="Birthplace search results" className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-elevated)] p-2">{places.map((place, index) => <button key={`${place.name}-${index}`} type="button" onClick={() => { setSelectedPlace(place); setPlaceInput(place.name); setPlaces([]); }} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[11px] transition hover:bg-[var(--ds-amber-08)]"><MapPin size={14} className="shrink-0 text-[var(--ds-gold)]"/><span>{place.name}<span className="ml-2 text-[var(--ds-muted)]">{place.timezone}</span></span></button>)}</div>}
                {selectedPlace && <p className="mt-2 flex items-start gap-2 text-[11px] text-[var(--ds-soft-gold)]"><Check size={14} className="shrink-0" /> Selected: {selectedPlace.name} · {selectedPlace.timezone}</p>}
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-4 text-[11px] leading-6 text-[var(--ds-muted)]"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-1 accent-amber-500"/><span>I understand that my birth date, time and location coordinates are sent securely to FreeAstrologyAPI for calculation. DevSangam privately saves my reading, including name and gender, in my account. I can delete it later.</span></label>
              <button disabled={create.isPending || !selectedPlace || !consent} type="submit" className="ds-gold-button flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-50">{create.isPending ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />} {create.isPending ? 'Calculating your chart…' : 'Reveal my birth chart'} <ArrowRight size={16}/></button>
              {notice && <p role="status" className="rounded-xl border border-[var(--ds-border-soft)] p-3 text-[11px] leading-5 text-[var(--ds-text)]">{notice}</p>}
            </form>
          </section>

          <aside className="space-y-5">
            <section className="ds-panel p-6 sm:p-7">
              <div className="flex items-start justify-between gap-3"><div><p className="ds-eyebrow">Your account</p><h2 className="mt-1 font-serif text-xl">Saved readings</h2></div><span className="rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] px-3 py-1 text-[10px] text-[var(--ds-gold)]">{history.data?.data.total ?? '—'} charts</span></div>
              <p className="mt-2 text-[11px] leading-6 text-[var(--ds-muted)]">Only you can access these charts. Choose any saved reading to view its placements again.</p>
              {history.isPending ? <p role="status" className="mt-6 text-[12px] text-[var(--ds-muted)]">Loading history…</p> : history.isError ? <p role="alert" className="mt-6 text-[12px] text-red-300">Your history could not be loaded.</p> : !history.data?.data.items.length ? <div className="mt-6 rounded-xl border border-dashed border-[var(--ds-border-soft)] p-7 text-center"><History size={28} className="mx-auto text-[var(--ds-gold)]"/><p className="mt-3 text-[12px] text-[var(--ds-text)]">No saved readings yet</p><p className="mt-2 text-[11px] text-[var(--ds-muted)]">Your first chart will appear here.</p></div> : (
                <div className="mt-5 space-y-2">{history.data.data.items.map((item) => <button key={item._id} type="button" onClick={() => { setActiveReading(item); setNotice(''); }} className={`flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition ${activeReading?._id === item._id ? 'border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)]' : 'border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] hover:border-[var(--ds-border-gold)]'}`}><span className="min-w-0"><span className="block truncate text-[12px] font-semibold text-[var(--ds-text)]">{item.name}</span><span className="mt-1 block truncate text-[10px] text-[var(--ds-muted)]">{prettyDate(item.birthDate)} · {item.birthplace.name}</span><span className="mt-1 block text-[10px] text-[var(--ds-gold)]">Moon: {item.summary.moon.sign}</span></span><ArrowRight size={15} className="mt-1 shrink-0 text-[var(--ds-gold)]"/></button>)}
                <div className="flex items-center justify-between gap-3 pt-3 text-[11px] text-[var(--ds-muted)]"><button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="flex min-h-9 items-center gap-1 rounded-lg border border-[var(--ds-border-soft)] px-3 disabled:opacity-40"><ChevronLeft size={14}/> Prev</button><span>Page {page}</span><button type="button" disabled={page * 8 >= history.data.data.total} onClick={() => setPage((p) => p + 1)} className="flex min-h-9 items-center gap-1 rounded-lg border border-[var(--ds-border-soft)] px-3 disabled:opacity-40">Next <ChevronRight size={14}/></button></div>
                </div>
              )}
            </section>
            <section className="rounded-2xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-5 text-[11px] leading-6 text-[var(--ds-muted)]"><div className="flex items-center gap-2 text-[var(--ds-soft-gold)]"><ShieldCheck size={16}/><strong className="font-semibold">Private by design</strong></div><p className="mt-2">Your name and gender stay within DevSangam. The astrology provider receives only the birth time and location needed to calculate positions. Results are interpretive, not medical, financial or predictive advice.</p><p className="mt-2 flex items-center gap-2"><Clock3 size={14}/> Historical timezone offsets are calculated for your birth date.</p></section>
          </aside>
          {activeReading && <div className="xl:col-span-2"><ChartResult reading={activeReading} removing={remove.isPending} onRemove={(id) => { void deleteReading(id); }}/></div>}
        </div>
      )}
    </div>
  );
}
