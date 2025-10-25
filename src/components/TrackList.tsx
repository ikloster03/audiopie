import React, { useRef, useEffect } from 'react';
import Sortable from 'sortablejs';
import type { TrackInfo } from '../types';
import { useAppContext } from '../context/AppContext';

interface TrackItemProps {
  track: TrackInfo;
  index: number;
  onUpdateTitle: (index: number, title: string) => void;
  onRemove: (index: number) => void;
}

const TrackItem: React.FC<TrackItemProps> = ({ track, index, onUpdateTitle, onRemove }) => {
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.round(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value: number): string => value.toString().padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <li data-index={index}>
      <span className="drag-handle">☰</span>
      <input
        type="text"
        value={track.displayTitle}
        className="track-title-input"
        onChange={(e) => onUpdateTitle(index, e.target.value)}
      />
      <span className="track-duration">{formatDuration(track.durationMs)}</span>
      <button
        className="track-remove"
        title="Remove track"
        onClick={() => onRemove(index)}
      >
        ✕
      </button>
    </li>
  );
};

export const TrackList: React.FC = () => {
  const { tracks, setTracks, setChapters } = useAppContext();
  const listRef = useRef<HTMLUListElement>(null);
  const sortableRef = useRef<Sortable | null>(null);

  useEffect(() => {
    if (listRef.current && !sortableRef.current) {
      sortableRef.current = Sortable.create(listRef.current, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: async (event) => {
          if (event.oldIndex === undefined || event.newIndex === undefined) {
            return;
          }
          const items = Array.from(listRef.current!.querySelectorAll('li'));
          const newOrder = items.map((item) => Number(item.dataset.index));
          await window.audioPie.tracks.reorder(newOrder);
          const newTracks = newOrder.map((idx) => tracks[idx]);
          setTracks(newTracks);
          await refreshChapters();
        }
      });
    }

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, []);

  const refreshChapters = async () => {
    const chapters = await window.audioPie.chapters.autoFromTracks();
    setChapters(chapters);
  };

  const handleUpdateTitle = async (index: number, newTitle: string) => {
    const title = newTitle.trim() || tracks[index].displayTitle;
    await window.audioPie.tracks.updateTitle(index, title);
    const updatedTracks = [...tracks];
    updatedTracks[index] = { ...updatedTracks[index], displayTitle: title };
    setTracks(updatedTracks);
    await refreshChapters();
  };

  const handleRemove = async (index: number) => {
    await window.audioPie.tracks.remove([index]);
    const updatedTracks = tracks.filter((_, i) => i !== index);
    setTracks(updatedTracks);
    await refreshChapters();
  };

  return (
    <ul className="track-list" ref={listRef}>
      {tracks.map((track, index) => (
        <TrackItem
          key={`${track.path}-${index}`}
          track={track}
          index={index}
          onUpdateTitle={handleUpdateTitle}
          onRemove={handleRemove}
        />
      ))}
    </ul>
  );
};

