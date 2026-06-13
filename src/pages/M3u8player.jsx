import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import UploadFileCompo from "../components/UploadFileCompo";
import HeaderPublic from "../components/HeaderPublic";

function parseM3U(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const list = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF')) {
            const name = lines[i].replace(/#EXTINF:[^,]*,/, '').trim();
            let url = '';
            for (let j = i ; j < lines.length; j++) {
                if (!lines[j].startsWith('#')) { 
                    url = lines[j]; 
                    i = j; 
                    break; 
                }
            }
            if (url) list.push({ name, url });
        }
    }
    return list;
}

export default function M3UPlayer() {
    const videoRef = useRef(null);
    const hlsRef   = useRef(null);
    const [channels,        setChannels]        = useState([]);
    const [active,          setActive]          = useState(null);
    const [search,          setSearch]          = useState('');
    const [status,          setStatus]          = useState('');
    const [activePlaylist,  setActivePlaylist]  = useState([]);
    const [loading,         setLoading]         = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [selectedIndex, setSelectedIndex]= useState(-1);

    const [showList, setShowList] = useState(true);
    const [enableUploadFile, setEnableUploadFile] = useState(false);
    const touchStartX = useRef(null);

    useEffect(() => {
        getFiles();
      }, []);

    useEffect(() => {
        return () => {
            if (hlsRef.current) hlsRef.current.destroy();
        };
    }, []);

    const getFiles= async()=>{
       const res= await fetch('https://livetv.sysnolodge.com.au/playlists.php')
       const data = await res.json();
       if(data.success){
        setPlaylists(data.playlists);
        setActivePlaylist(data.playlists[0]);
        loadPlaylist(data.playlists[0]);
       }
    }  

    const filtered = channels.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        const idx = filtered.findIndex(c => c.url === active?.url);
    
        if (diff > 50) {
            // swipe left → next
            if (idx < filtered.length - 1) play(filtered[idx + 1]);
        } else if (diff < -50) {
            // swipe right → prev
            if (idx > 0) play(filtered[idx - 1]);
        }
        touchStartX.current = null;
    };

    const loadPlaylist = async (playlist) => {
        setActivePlaylist(playlist);
        setChannels([]);
        setActive(null);
        setSearch('');
        setStatus('');
        setLoading(true);
        try {
            const res=await fetch(`https://livetv.sysnolodge.com.au/get_playlist.php?file=${playlist.file}`);
            const data= await res.text();
            setChannels(parseM3U(data));
        } catch (error) {
            alert(error)
        }finally{
            setLoading(false);
        }
    };

    const play = (ch, index) => {
        setActive(ch);
        setSelectedIndex(index)
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
                setStatus(d.error.message);
                // if (d.fatal) setStatus(d.error.message);
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

    return (
        <>
            <HeaderPublic/>
            <div className="flex flex-col gap-3 p-4 ">

                {/* playlist buttons */}
                <div className="flex flex-col gap-2">

                    <div className="flex gap-2">
                        <button className="bg-yellow-600 text-gray-200 text-sm p-2 rounded-lg"
                            onClick={()=>setEnableUploadFile((prev)=>!prev)}>Upload File
                        </button>
                        <button onClick={() => setShowList(prev => !prev)}
                            className="bg-green-900 text-gray-200 text-sm p-2 rounded-lg">
                            ☰ {showList ? 'Hide Sidebar' : 'Show Sidebar' }
                        </button> 
                    </div>                    
                    {
                        activePlaylist &&
                        <div className="flex flex-col max-w-md">
                            <span className="text-sm font-semibold">
                                Select Playlist:
                            </span>
                            <select value={activePlaylist.file}
                                onChange={(e) => {
                                    const pl = playlists.find(p => p.file === e.target.value);
                                    if (pl) loadPlaylist(pl);
                                }}
                                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-green-500"
                            >                           
                                {playlists.map((pl, i) => (
                                    <option key={i} value={pl.file}>
                                        {pl.label}
                                    </option>
                                ))}
                            </select>                                   
                        </div>
                       
                    }                    
                </div>
                 {
                    enableUploadFile &&
                    <UploadFileCompo setEnableUploadFile={setEnableUploadFile} getFiles={getFiles} activePlaylist={activePlaylist}/>
                 }
                <div className={`flex  ${ showList && 'gap-3' }`}>

                    {/* channel list */}                    
                    <div className={`flex flex-col gap-2 ${showList ? 'w-64' : 'w-0' }`}> 
                        {
                            showList &&
                            <>
                                <div className="flex items-center">                            
                                    <p className="text-sm font-medium">{activePlaylist.label} ({filtered.length} ch) </p>
                                </div>                            
                                <input
                                    type="text"
                                    placeholder="search..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-green-500"
                                />
                                <p className="text-sm font-medium">Select Channels Below</p>
                                <div className="h-[50vh] overflow-y-auto border border-gray-200 rounded-lg">

                                    {loading &&
                                        <p className="text-xs text-gray-400 text-center p-4">loading...</p>
                                    }
                                    {!loading && filtered.map((ch, i) => (
                                        <div key={i} onClick={() => play(ch, i)}
                                            className={`px-3 py-2 text-xs cursor-pointer border-b border-gray-100 truncate flex items-center gap-2
                                                ${selectedIndex === i
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
                            </>
                        }

                    </div>

                    {/* player */}
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="flex flex-wrap text-xs font-medium">
                                {active ? active.name : 'Select'}
                            </p>
                            {
                                status && <span className="flex-flex-wrap text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full ">● {status}</span>
                            }

                            {/* <div className="bg-white border border-gray-200 rounded-lg p-3">
                                {active &&
                                    <p className="text-xs text-gray-400 mt-1 truncate">{active.url}</p>
                                }
                            </div>                           */}
                        </div>
                     
                        <div className="bg-black rounded-lg relative"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}                                
                        >                            
                            <video ref={videoRef} controls className="w-full h-[60vh]"/>
                           

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
                    </div>

                </div>
            </div>        
        </>

    );
}