import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

function parseM3U(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const list = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF')) {
            const name = lines[i].replace(/#EXTINF:[^,]*,/, '').trim();
            let url = '';
            for (let j = i + 1; j < lines.length; j++) {
                if (!lines[j].startsWith('#')) { url = lines[j]; i = j; break; }
            }
            if (url) list.push({ name, url });
        }
    }
    return list;
}

// ← add your m3u files here
const playlists = [
    { label: 'BDIX', file: '/localFolder/IP_TV_08062026/BDIX.m3u' },
    { label: 'BD FIFA', file: '/localFolder/IP_TV_08062026/BD FIFA Channels.m3u' },
    { label: 'BD IP TV', file: '/localFolder/IP_TV_08062026/BD IP TV.m3u' },
    { label: '08062026', file: '/localFolder/IP_TV_08062026/08062026.m3u' },
    { label: 'BDIX Cricfy', file: '/localFolder/IP_TV_08062026/BDIX Cricfy.m3u' },
    { label: 'Fastest BD', file: '/localFolder/IP_TV_08062026/Fastest BD.m3u' },
    { label: 'FIFA World Cup 2026 Auto Update', file: '/localFolder/IP_TV_08062026/FIFA World Cup 2026 Auto Update.m3u' },
    { label: 'IP sports', file: '/localFolder/IP_TV_08062026/IP sports.m3u' }
];

export default function M3UPlayer() {
    const videoRef = useRef(null);
    const hlsRef   = useRef(null);
    const [channels,        setChannels]        = useState([]);
    const [active,          setActive]          = useState(null);
    const [search,          setSearch]          = useState('');
    const [status,          setStatus]          = useState('');
    const [activePlaylist,  setActivePlaylist]  = useState(playlists[0]);
    const [loading,         setLoading]         = useState(false);

    const filtered = channels.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const loadPlaylist = (playlist) => {
        setActivePlaylist(playlist);
        setChannels([]);
        setActive(null);
        setSearch('');
        setStatus('');
        setLoading(true);

        fetch(playlist.file)
            .then(res => res.text())
            .then(text => {
                setChannels(parseM3U(text));
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load:', err);
                setLoading(false);
            });
    };

    // load first playlist on mount
    useEffect(() => {
        loadPlaylist(playlists[0]);
    }, []);

    const play = (ch) => {
        setActive(ch);
        setStatus('loading');
        const video = videoRef.current;

        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: false });
            hls.loadSource(ch.url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
                setStatus('live');
            });
            hls.on(Hls.Events.ERROR, (e, d) => {
                if (d.fatal) setStatus('error');
            });
            hlsRef.current = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = ch.url;
            video.play().catch(() => {});
            setStatus('live');
        } else {
            video.src = ch.url;
            video.play().catch(() => {});
            setStatus('live');
        }
    };

    useEffect(() => {
        return () => {
            if (hlsRef.current) hlsRef.current.destroy();
        };
    }, []);

    return (
        <>
            <div className="flex flex-col gap-3 p-4">

                {/* playlist buttons */}
                <div className="flex flex-wrap gap-2">
                    {playlists.map((pl, i) => (
                        <button key={i} onClick={() => loadPlaylist(pl)}
                            className={`px-4 py-1.5 rounded-lg text-sm border transition-colors
                                ${activePlaylist.file === pl.file
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                }`}>
                            {pl.label}
                            {activePlaylist.file === pl.file &&
                                <span className="ml-2 text-xs opacity-70">({channels.length})</span>
                            }
                        </button>
                    ))}
                </div>

                <div className="flex gap-3">

                    {/* channel list */}
                    <div className="w-64 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{activePlaylist.label}</p>
                            <span className="text-xs text-gray-400">{filtered.length} ch</span>
                        </div>
                        <input
                            type="text"
                            placeholder="search..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-green-500"
                        />
                        <div className="h-[500px] overflow-y-auto border border-gray-200 rounded-lg">
                            {loading &&
                                <p className="text-xs text-gray-400 text-center p-4">loading...</p>
                            }
                            {!loading && filtered.map((ch, i) => (
                                <div key={i} onClick={() => play(ch)}
                                    className={`px-3 py-2 text-xs cursor-pointer border-b border-gray-100 truncate flex items-center gap-2
                                        ${active?.url === ch.url
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'hover:bg-gray-50 text-gray-700'
                                        }`}>
                                    <span className="text-gray-400 w-6 shrink-0">{i + 1}</span>
                                    <span className="truncate">{ch.name}</span>
                                </div>
                            ))}
                            {!loading && filtered.length === 0 &&
                                <p className="text-xs text-gray-400 text-center p-4">no channels found</p>
                            }
                        </div>
                    </div>

                    {/* player */}
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="bg-black rounded-lg overflow-hidden relative">
                            <video ref={videoRef} controls className="w-full h-[70vh]"/>
                            {/* prev */}
                            <button
                                onClick={() => {
                                    const idx = filtered.findIndex(c => c.url === active?.url);
                                    if (idx > 0) play(filtered[idx - 1]);
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
                            >
                                ‹
                            </button>

                            {/* next */}
                            <button
                                onClick={() => {
                                    const idx = filtered.findIndex(c => c.url === active?.url);
                                    if (idx < filtered.length - 1) play(filtered[idx + 1]);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
                            >
                                ›
                            </button>                            
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">
                                    {active ? active.name : 'Select a channel'}
                                </p>
                                {status === 'live' &&
                                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full shrink-0">● live</span>
                                }
                                {status === 'loading' &&
                                    <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full shrink-0">loading</span>
                                }
                                {status === 'error' &&
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">error</span>
                                }
                            </div>
                            {/* {active &&
                                <p className="text-xs text-gray-400 mt-1 truncate">{active.url}</p>
                            } */}
                        </div>
                    </div>

                </div>
            </div>        
        </>

    );
}