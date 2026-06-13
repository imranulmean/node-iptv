import HeaderPublic from "../components/HeaderPublic";

export default function Fifa2026(){
    return(
        <>
            <HeaderPublic/>
            <iframe 
                src="https://shstream.live/" 
                frameborder="0" 
                referrerpolicy="strict-origin-when-cross-origin" 
                allowfullscreen
                className="w-full h-screen"
                style={{ height: 'calc(100vh - 64px)', display: 'block', border: 'none' }}
            >
            </iframe>         
        </>
    )
}