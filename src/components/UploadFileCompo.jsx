import { useEffect, useRef, useState } from "react";
import { Card, Button } from "flowbite-react";
import axios from "axios";

export default function UploadFileCompo({setEnableUploadFile, getFiles}){

    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const fileInputRef = useRef(null);
    const [files, setFiles]=useState([]);
    const [loading, setLoading]=useState(false);
    const [progress, setProgress] = useState(0);
    const [totalFileSize, setTotalFileSize] = useState(0);
    const [secretKey, setSecretKey]= useState('');

      const getTotalFileSize = (fileList) => {
        if (!fileList || !fileList.length) {
          setTotalFileSize(0);
          return;
        }      
        const totalSizeBytes = Array.from(fileList).reduce(
          (acc, file) => acc + file.size,
          0
        );      
        const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
        setTotalFileSize(totalSizeMB);
      };    

    const serverUpload = async () => {
      if(files.length<1){
      alert('Please Select File')
      return;
      }
      setLoading(true);
      setProgress(0);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      try {
          const res = await axios.post(`https://livetv.sysnolodge.com.au/upload_m3u.php`,formData,{
              onUploadProgress:(event)=>{
              if (event.lengthComputable) {
                  const percent = Math.round((event.loaded / event.total) * 100);
                  setProgress(percent);
              }
              }
          })
         alert(res.data.message);
    
      } catch (err) {
        console.error(err);
        alert(err);
      } finally {
        setLoading(false);
        setFiles([]);
        setProgress(0);
        setTotalFileSize(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setEnableUploadFile(false);
        getFiles();
      }
    };   
    return(
        <>
          <Card className="max-w-md">
            {
                (secretKey && secretKey==='sysboss') ?
                <div>
                    <input type="file" accept=".m3u"
                            onChange={(e) => {
                                const selectedFiles = e.target.files;
                                setFiles(selectedFiles);
                                getTotalFileSize(selectedFiles);
                            }}
                            ref={fileInputRef} disabled={loading}/>
                    <p>Total Selected Size:{totalFileSize} MB</p>
                    {loading && 
                        <div>
                            <progress value={progress} max="100" />        
                        </div>
                        
                    } 
                    <div className="flex gap-2 p-2">            
                        <Button color='light' onClick={()=>serverUpload()} disabled={loading}>Upload File</Button>
                        <Button color='light' onClick={()=>setEnableUploadFile(false)} disabled={loading}>Close</Button>
                    </div> 
                </div> : <input type='password' onChange={(e)=>setSecretKey(e.target.value)} placeholder="Enter Secret"/>                
            }

          </Card >
        </>
    )
}