/**
 * Daily notes: today's note so far, then one plain-words note per day
 * (written by the API every night for the day before).
 */

import { CheckCircle2, Eye } from 'lucide-react';
import { useGetNotesQuery, useGetTodayNoteQuery } from '@/features/notes/api';
import { useCurrentSite } from '@/hooks/useCurrentSite';
import { formatDay, formatNumber } from '@/shared/utils/format';
import type { DailyNote } from '@/types';
import PageHeading from '@/components/layout/PageHeading';
import LoadingState from '@/components/layout/LoadingState';
import { OwlMark } from '@/components/layout/Brand';

function NoteCard({ note, title }: { note: DailyNote; title: string }) {
  const [headline, ...rest] = note.body.split('\n');
  const attacks = note.stats.totals?.attacks ?? 0;
  const level = attacks > 0 ? 'watch' : 'normal';
  return (
    <article className="daily-note-card">
      <div className={`note-level-icon level-${level}`}>{level === 'normal' ? <CheckCircle2 /> : <Eye />}</div>
      <div className="daily-note-body">
        <div className="daily-note-meta">
          <span>{title}</span>
          <span className={`note-level level-text-${level}`}>{level === 'normal' ? 'ALL CLEAR' : 'WORTH A LOOK'}</span>
        </div>
        <h2>{headline}</h2>
        {rest.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {note.stats.totals && (
          <span className="note-metrics">
            {formatNumber(note.stats.totals.requests)} requests · {formatNumber(attacks)} attacks
          </span>
        )}
      </div>
    </article>
  );
}

export default function NotesPage() {
  const { siteId } = useCurrentSite();
  const { data: today } = useGetTodayNoteQuery(siteId);
  const { data: notes = [], isLoading } = useGetNotesQuery(siteId);

  if (isLoading) return <LoadingState>Writing up the latest…</LoadingState>;

  return (
    <>
      <PageHeading
        eyebrow="A HELPFUL HEADS-UP, EVERY DAY"
        title="Daily notes"
        description="A plain-words recap of what happened on your website while you were away."
      />
      <div className="note-intro-banner">
        <div className="summary-icon">
          <OwlMark />
        </div>
        <div>
          <b>No log files. No jargon. Just the useful bits.</b>
          <p>A new note is written every night for the day before (UTC).</p>
        </div>
      </div>
      <div className="daily-notes-list">
        {today && <NoteCard note={today} title="Today, so far" />}
        {notes.map((note) => (
          <NoteCard key={note.day} note={note} title={formatDay(note.day)} />
        ))}
        {!today && notes.length === 0 && <div className="table-empty">Your first note appears after the first full day.</div>}
      </div>
    </>
  );
}
