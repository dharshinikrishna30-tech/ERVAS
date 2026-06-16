import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBatches } from '../BatchContext';

function Farmer() {
  const navigate = useNavigate();
  const { addBatch } = useBatches();
  const [form, setForm] = useState({ herbName: '', quantity: '', quantityType: 'kg', notes: '' });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [listening, setListening] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);
  const fileRef = useRef();
  const cameraRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef();

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  const getLocation = () => new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude.toFixed(5), lng: p.coords.longitude.toFixed(5) }),
      () => resolve(null)
    );
  });

  const toBase64 = (file) => new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.readAsDataURL(file);
  });

  const analyzeWithAI = async (file) => {
    setAiLoading(true);
    setAiMessage('🤖 AI is analyzing your herb photo...');
    try {
      const base64 = await toBase64(file);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: file.type, data: base64 } },
              { type: 'text', text: `You are an Ayurvedic herb expert. Identify this herb and respond ONLY in this JSON format, nothing else:
{"herbName":"herb name here","quantity":"estimated amount","quantityType":"kg or bunch or basket or bundle or handful","notes":"brief quality observation"}` }
            ]
          }]
        })
      });
      const data = await response.json();
      const clean = data.content[0].text.replace(/```json|```/g, '').trim();
      const result = JSON.parse(clean);
      setForm(prev => ({
        ...prev,
        herbName: result.herbName || prev.herbName,
        quantity: result.quantity || prev.quantity,
        quantityType: result.quantityType || prev.quantityType,
        notes: result.notes || prev.notes
      }));
      setAiMessage('✅ AI filled the form! Check and correct if needed.');
    } catch {
      setAiMessage('⚠️ AI could not read clearly. Please fill manually or retake photo.');
    }
    setAiLoading(false);
  };

  const processPhoto = async (file) => {
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    const loc = await getLocation();
    if (loc) setLocation(loc);
    await analyzeWithAI(file);
  };

  // Open laptop webcam
  const openWebcam = async () => {
    setShowWebcam(true);
    setWebcamReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setWebcamReady(true);
        }
      }, 300);
    } catch {
      alert('Could not access camera. Please allow camera permission or use Gallery to upload a photo.');
      setShowWebcam(false);
    }
  };

  // Capture photo from webcam
  const captureWebcam = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'herb-photo.jpg', { type: 'image/jpeg' });
      stopWebcam();
      await processPhoto(file);
    }, 'image/jpeg', 0.9);
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowWebcam(false);
    setWebcamReady(false);
  };

  const startVoice = (fieldName) => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Use Chrome browser for voice input!'); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-IN';
    setListening(fieldName);
    rec.start();
    rec.onresult = (e) => { setForm(p => ({ ...p, [fieldName]: e.results[0][0].transcript })); setListening(null); };
    rec.onerror = () => setListening(null);
    rec.onend = () => setListening(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!photo) { alert('Please take or upload a photo!'); return; }
    const batchId = 'ERVAS-' + Date.now();
    addBatch({
      id: batchId,
      herbName: form.herbName,
      quantity: form.quantity,
      quantityType: form.quantityType,
      notes: form.notes,
      location: location,
      timestamp: new Date().toLocaleString(),
      status: 'pending_processing'
    });
    setSubmitted(batchId);
  };

  const resetAll = () => {
    setSubmitted(false);
    setForm({ herbName:'', quantity:'', quantityType:'kg', notes:'' });
    setPhoto(null); setPhotoPreview(null);
    setLocation(null); setAiMessage('');
  };

  const s = {
    page: { minHeight:'100vh', background:'linear-gradient(135deg, #0a2e1a, #1b4332)' },
    header: { background:'rgba(0,0,0,0.3)', backdropFilter:'blur(10px)', padding:'1rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.1)' },
    headerTitle: { color:'white', fontSize:'1.2rem', fontWeight:'700', letterSpacing:'2px' },
    backBtn: { background:'rgba(255,255,255,0.1)', color:'white', border:'2px solid rgba(255,255,255,0.4)', padding:'0.5rem 1.2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'600' },
    body: { padding:'1.5rem', maxWidth:'600px', margin:'0 auto' },
    card: { background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'20px', padding:'1.8rem' },
    title: { color:'white', fontSize:'1.4rem', marginBottom:'0.5rem', textAlign:'center' },
    subtitle: { color:'rgba(255,255,255,0.5)', fontSize:'0.85rem', textAlign:'center', marginBottom:'1.5rem' },
    group: { marginBottom:'1.3rem' },
    label: { display:'block', fontWeight:'600', color:'rgba(255,255,255,0.85)', marginBottom:'0.5rem', fontSize:'0.95rem' },
    inputRow: { display:'flex', gap:'0.5rem', alignItems:'center' },
    input: { flex:1, padding:'0.75rem 1rem', border:'2px solid rgba(255,255,255,0.15)', borderRadius:'10px', fontSize:'0.95rem', boxSizing:'border-box', outline:'none', background:'rgba(255,255,255,0.07)', color:'white' },
    voiceBtn: { padding:'0.75rem', background:'rgba(255,255,255,0.1)', border:'2px solid rgba(255,255,255,0.2)', borderRadius:'10px', cursor:'pointer', fontSize:'1.2rem', minWidth:'48px' },
    voiceBtnActive: { padding:'0.75rem', background:'rgba(255,80,80,0.3)', border:'2px solid #ff5050', borderRadius:'10px', cursor:'pointer', fontSize:'1.2rem', minWidth:'48px' },
    select: { padding:'0.75rem', border:'2px solid rgba(255,255,255,0.15)', borderRadius:'10px', background:'rgba(255,255,255,0.07)', color:'white', fontSize:'0.9rem', outline:'none' },
    photoBox: { border:'2px dashed rgba(255,255,255,0.3)', borderRadius:'14px', padding:'2rem', textAlign:'center', background:'rgba(255,255,255,0.04)' },
    photoPreview: { width:'100%', borderRadius:'12px', maxHeight:'220px', objectFit:'cover', marginBottom:'0.8rem' },
    greenBtn: { padding:'0.7rem 1.4rem', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight:'600', fontSize:'0.9rem', background:'#40916c', color:'white' },
    ghostBtn: { padding:'0.7rem 1.4rem', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight:'600', fontSize:'0.9rem', background:'rgba(255,255,255,0.1)', color:'white' },
    redBtn: { padding:'0.7rem 1.4rem', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight:'600', fontSize:'0.9rem', background:'rgba(255,80,80,0.2)', color:'#ff8080' },
    aiBox: { background:'rgba(116,198,157,0.1)', border:'1px solid #74c69d', borderRadius:'10px', padding:'0.8rem 1rem', marginBottom:'1rem', color:'#74c69d', fontSize:'0.9rem', textAlign:'center' },
    locBox: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'0.6rem 1rem', marginTop:'0.5rem', color:'rgba(255,255,255,0.5)', fontSize:'0.8rem' },
    submitBtn: { width:'100%', padding:'0.9rem', background:'linear-gradient(135deg, #40916c, #1b4332)', color:'white', border:'none', borderRadius:'10px', fontSize:'1rem', fontWeight:'700', cursor:'pointer', marginTop:'0.5rem' },
    webcamBox: { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.95)', zIndex:999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' },
    successCard: { background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'20px', padding:'3rem 2rem', textAlign:'center' },
    batchBox: { background:'rgba(116,198,157,0.15)', border:'2px solid #74c69d', borderRadius:'12px', padding:'1rem', margin:'1.5rem 0', fontSize:'1.1rem', fontWeight:'700', color:'#74c69d' }
  };

  // Webcam overlay
  if (showWebcam) {
    return (
      <div style={s.webcamBox}>
        <p style={{ color:'white', marginBottom:'1rem', fontSize:'1rem' }}>📷 Position the herb in frame</p>
        <video ref={videoRef} style={{ width:'100%', maxWidth:'500px', borderRadius:'16px', background:'#000' }} autoPlay playsInline muted />
        <canvas ref={canvasRef} style={{ display:'none' }} />
        <div style={{ display:'flex', gap:'1rem', marginTop:'1.5rem' }}>
          {webcamReady ? (
            <button style={{ ...s.submitBtn, width:'auto', padding:'1rem 2.5rem', fontSize:'1.1rem' }} onClick={captureWebcam}>
              📸 Capture Photo
            </button>
          ) : (
            <p style={{ color:'rgba(255,255,255,0.5)' }}>Starting camera...</p>
          )}
          <button style={{ ...s.ghostBtn, padding:'1rem 1.5rem' }} onClick={stopWebcam}>✕ Cancel</button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <span style={s.headerTitle}>🌿 ERVAS — Farmer Module</span>
          <button style={s.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
        </div>
        <div style={s.body}>
          <div style={s.successCard}>
            <div style={{ fontSize:'5rem', marginBottom:'1rem' }}>✅</div>
            <h2 style={{ color:'white', fontSize:'1.6rem', marginBottom:'0.5rem' }}>Batch Submitted!</h2>
            <p style={{ color:'rgba(255,255,255,0.6)', marginBottom:'1rem' }}>Recorded on the blockchain.</p>
            {photoPreview && <img src={photoPreview} alt="herb" style={{ width:'100%', borderRadius:'12px', marginBottom:'1rem', maxHeight:'180px', objectFit:'cover' }} />}
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.9rem', marginBottom:'0.5rem' }}>
              🌿 <b style={{ color:'white' }}>{form.herbName}</b> &nbsp;|&nbsp; ⚖️ <b style={{ color:'white' }}>{form.quantity} {form.quantityType}</b>
            </div>
            {location && <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.8rem', marginBottom:'1rem' }}>📍 {location.lat}, {location.lng} &nbsp;|&nbsp; 🕐 {new Date().toLocaleString()}</div>}
            <div style={s.batchBox}>Batch ID: {submitted}</div>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem', marginBottom:'2rem' }}>📌 Save this Batch ID for tracking</p>
            <button style={s.submitBtn} onClick={resetAll}>+ Submit Another Batch</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{`
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.35);}
        option{background:#1b4332;color:white;}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>
      <div style={s.header}>
        <span style={s.headerTitle}>🌿 ERVAS — Farmer Module</span>
        <button style={s.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
      </div>
      <div style={s.body}>
        <div style={s.card}>
          <h2 style={s.title}>🌱 Submit Herb Batch</h2>
          <p style={s.subtitle}>Take a photo → AI fills everything automatically!</p>

          {aiMessage && (
            <div style={s.aiBox}>
              {aiLoading && <span style={{ display:'inline-block', animation:'spin 1s linear infinite', marginRight:'0.5rem' }}>⏳</span>}
              {aiMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Photo Section */}
            <div style={s.group}>
              <label style={s.label}>📷 Herb Photo <span style={{ color:'#74c69d', fontSize:'0.8rem' }}>(required — AI auto-fills form)</span></label>

              {photoPreview ? (
                <div>
                  <img src={photoPreview} alt="herb" style={s.photoPreview} />
                  {location && <div style={s.locBox}>📍 {location.lat}, {location.lng} &nbsp;|&nbsp; 🕐 {new Date().toLocaleString()}</div>}
                  <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.8rem' }}>
                    <button type="button" style={{ ...s.redBtn, flex:1 }} onClick={resetAll}>🗑️ Remove</button>
                    <button type="button" style={{ ...s.greenBtn, flex:1 }} onClick={isMobile ? () => cameraRef.current.click() : openWebcam}>📷 Retake</button>
                  </div>
                </div>
              ) : (
                <div style={s.photoBox}>
                  <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>🌿</div>
                  <p style={{ color:'rgba(255,255,255,0.6)', marginBottom:'1.2rem', fontSize:'0.9rem' }}>
                    {isMobile ? 'Take a photo with your phone camera' : 'Use your laptop camera or upload a photo'}
                  </p>
                  <div style={{ display:'flex', gap:'0.8rem', justifyContent:'center', flexWrap:'wrap' }}>
                    {isMobile ? (
                      <button type="button" style={s.greenBtn} onClick={() => cameraRef.current.click()}>
                        📸 Open Camera
                      </button>
                    ) : (
                      <button type="button" style={s.greenBtn} onClick={openWebcam}>
                        📸 Open Webcam
                      </button>
                    )}
                    <button type="button" style={s.ghostBtn} onClick={() => fileRef.current.click()}>
                      🖼️ Upload Photo
                    </button>
                  </div>
                  {!isMobile && <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.75rem', marginTop:'1rem' }}>💡 On mobile? Open this page on your phone for best experience</p>}
                </div>
              )}

              <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={(e) => e.target.files[0] && processPhoto(e.target.files[0])} />
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={(e) => e.target.files[0] && processPhoto(e.target.files[0])} />
              <canvas ref={canvasRef} style={{ display:'none' }} />
            </div>

            {/* Herb Name */}
            <div style={s.group}>
              <label style={s.label}>🌿 Herb Name <span style={{ color:'#74c69d', fontSize:'0.8rem' }}>(auto-filled — correct if needed)</span></label>
              <div style={s.inputRow}>
                <input style={s.input} placeholder="AI will fill this after photo..." value={form.herbName} onChange={(e) => setForm({...form, herbName: e.target.value})} required />
                <button type="button" style={listening === 'herbName' ? s.voiceBtnActive : s.voiceBtn} onClick={() => startVoice('herbName')}>
                  {listening === 'herbName' ? '🔴' : '🎤'}
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div style={s.group}>
              <label style={s.label}>⚖️ Quantity <span style={{ color:'#74c69d', fontSize:'0.8rem' }}>(auto-filled — correct if needed)</span></label>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <div style={{ ...s.inputRow, flex:1 }}>
                  <input style={s.input} placeholder="AI will fill this..." value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} required />
                  <button type="button" style={listening === 'quantity' ? s.voiceBtnActive : s.voiceBtn} onClick={() => startVoice('quantity')}>
                    {listening === 'quantity' ? '🔴' : '🎤'}
                  </button>
                </div>
                <select style={s.select} value={form.quantityType} onChange={(e) => setForm({...form, quantityType: e.target.value})}>
                  <option value="kg">kg</option>
                  <option value="grams">grams</option>
                  <option value="bunch">bunch</option>
                  <option value="basket">basket</option>
                  <option value="bag">bag</option>
                  <option value="bundle">bundle</option>
                  <option value="handful">handful</option>
                  <option value="unknown">not sure</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div style={s.group}>
              <label style={s.label}>📝 Notes <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.8rem' }}>(optional)</span></label>
              <div style={s.inputRow}>
                <textarea style={{ ...s.input, height:'70px', resize:'vertical' }} placeholder="AI will fill quality notes..." value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
                <button type="button" style={listening === 'notes' ? s.voiceBtnActive : s.voiceBtn} onClick={() => startVoice('notes')}>
                  {listening === 'notes' ? '🔴' : '🎤'}
                </button>
              </div>
            </div>

            <button type="submit" style={{ ...s.submitBtn, opacity: aiLoading ? 0.6 : 1 }} disabled={aiLoading}>
              {aiLoading ? '⏳ AI Analyzing...' : '🔗 Submit to Blockchain'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Farmer;