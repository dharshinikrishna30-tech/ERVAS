import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Farmer() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    herbName: '', quantity: '', quantityType: 'kg', notes: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [listening, setListening] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [location, setLocation] = useState(null);
  const fileRef = useRef();
  const cameraRef = useRef();

  // Get GPS location
  const getLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) }),
        () => resolve(null)
      );
    });
  };

  // Convert image file to base64
  const toBase64 = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });

  // AI auto-fill from image
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
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: file.type, data: base64 }
              },
              {
                type: 'text',
                text: `You are an expert in Ayurvedic herbs. Look at this image and identify:
1. The herb name (common name and scientific name if visible)
2. Estimated quantity (look at the amount visible - describe as bunch, handful, basket, or estimate in kg if possible)
3. Any quality observations (color, freshness, condition)

Respond ONLY in this exact JSON format, nothing else:
{
  "herbName": "name of the herb",
  "quantity": "estimated amount as a number or description",
  "quantityType": "kg or bunch or basket or bundle or handful",
  "notes": "brief quality observation in simple words"
}`
              }
            ]
          }]
        })
      });

      const data = await response.json();
      const text = data.content[0].text;
      const clean = text.replace(/```json|```/g, '').trim();
      const result = JSON.parse(clean);

      setForm(prev => ({
        ...prev,
        herbName: result.herbName || prev.herbName,
        quantity: result.quantity || prev.quantity,
        quantityType: result.quantityType || prev.quantityType,
        notes: result.notes || prev.notes
      }));
      setAiMessage('✅ AI filled the form! Please check and correct if needed.');
    } catch (err) {
      setAiMessage('⚠️ AI could not read the image. Please fill manually.');
    }
    setAiLoading(false);
  };

  // Voice input
  const startVoice = (fieldName) => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Use Chrome browser for voice input!');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-IN';
    setListening(fieldName);
    recognition.start();
    recognition.onresult = (e) => {
      setForm(prev => ({ ...prev, [fieldName]: e.results[0][0].transcript }));
      setListening(null);
    };
    recognition.onerror = () => setListening(null);
    recognition.onend = () => setListening(null);
  };

  // Handle photo (camera or gallery)
  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    // Get GPS location at same time
    const loc = await getLocation();
    if (loc) setLocation(loc);
    // Auto-fill with AI
    await analyzeWithAI(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!photo) { alert('Please take or upload a photo of the herb!'); return; }
    setSubmitted('ERVAS-' + Date.now());
  };

  const s = {
    page: { minHeight:'100vh', background:'linear-gradient(135deg, #0a2e1a, #1b4332)' },
    header: { background:'rgba(0,0,0,0.3)', backdropFilter:'blur(10px)', padding:'1rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.1)' },
    headerTitle: { color:'white', fontSize:'1.2rem', fontWeight:'700', letterSpacing:'2px' },
    backBtn: { background:'rgba(255,255,255,0.1)', color:'white', border:'2px solid rgba(255,255,255,0.4)', padding:'0.5rem 1.2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'600' },
    body: { padding:'1.5rem', maxWidth:'600px', margin:'0 auto' },
    card: { background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'20px', padding:'1.8rem' },
    title: { color:'white', fontSize:'1.4rem', marginBottom:'1.5rem', textAlign:'center' },
    group: { marginBottom:'1.3rem' },
    label: { display:'block', fontWeight:'600', color:'rgba(255,255,255,0.85)', marginBottom:'0.5rem', fontSize:'0.95rem' },
    inputRow: { display:'flex', gap:'0.5rem', alignItems:'center' },
    input: { flex:1, padding:'0.75rem 1rem', border:'2px solid rgba(255,255,255,0.15)', borderRadius:'10px', fontSize:'0.95rem', boxSizing:'border-box', outline:'none', background:'rgba(255,255,255,0.07)', color:'white' },
    voiceBtn: { padding:'0.75rem', background:'rgba(255,255,255,0.1)', border:'2px solid rgba(255,255,255,0.2)', borderRadius:'10px', cursor:'pointer', fontSize:'1.2rem', minWidth:'48px' },
    voiceBtnActive: { padding:'0.75rem', background:'rgba(255,80,80,0.3)', border:'2px solid #ff5050', borderRadius:'10px', cursor:'pointer', fontSize:'1.2rem', minWidth:'48px' },
    select: { padding:'0.75rem', border:'2px solid rgba(255,255,255,0.15)', borderRadius:'10px', background:'rgba(255,255,255,0.07)', color:'white', fontSize:'0.95rem', outline:'none' },
    photoBox: { border:'2px dashed rgba(255,255,255,0.3)', borderRadius:'14px', padding:'2rem', textAlign:'center', background:'rgba(255,255,255,0.04)' },
    photoPreview: { width:'100%', borderRadius:'12px', maxHeight:'220px', objectFit:'cover', marginBottom:'0.8rem' },
    photoBtn: { padding:'0.7rem 1.4rem', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight:'600', fontSize:'0.9rem' },
    aiBox: { background:'rgba(116,198,157,0.1)', border:'1px solid #74c69d', borderRadius:'10px', padding:'0.8rem 1rem', marginBottom:'1rem', color:'#74c69d', fontSize:'0.9rem', textAlign:'center' },
    locationBox: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'0.6rem 1rem', marginTop:'0.5rem', color:'rgba(255,255,255,0.5)', fontSize:'0.8rem' },
    btn: { width:'100%', padding:'0.9rem', background:'linear-gradient(135deg, #40916c, #1b4332)', color:'white', border:'none', borderRadius:'10px', fontSize:'1rem', fontWeight:'700', cursor:'pointer', marginTop:'0.5rem' },
    successCard: { background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'20px', padding:'3rem 2rem', textAlign:'center' },
    batchBox: { background:'rgba(116,198,157,0.15)', border:'2px solid #74c69d', borderRadius:'12px', padding:'1rem', margin:'1.5rem 0', fontSize:'1.1rem', fontWeight:'700', color:'#74c69d' }
  };

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
            <p style={{ color:'rgba(255,255,255,0.6)', marginBottom:'1rem' }}>Recorded on the blockchain successfully.</p>
            {photoPreview && <img src={photoPreview} alt="herb" style={{ width:'100%', borderRadius:'12px', marginBottom:'1rem', maxHeight:'180px', objectFit:'cover' }} />}
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.9rem', marginBottom:'0.5rem' }}>
              🌿 <b style={{ color:'white' }}>{form.herbName}</b> &nbsp;|&nbsp; ⚖️ <b style={{ color:'white' }}>{form.quantity} {form.quantityType}</b>
            </div>
            {location && <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.8rem', marginBottom:'1rem' }}>📍 {location.lat}, {location.lng}</div>}
            <div style={s.batchBox}>Batch ID: {submitted}</div>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem', marginBottom:'2rem' }}>📌 Save this Batch ID for tracking</p>
            <button style={s.btn} onClick={() => { setSubmitted(false); setForm({ herbName:'', quantity:'', quantityType:'kg', notes:'' }); setPhoto(null); setPhotoPreview(null); setLocation(null); setAiMessage(''); }}>
              + Submit Another Batch
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{`
        input::placeholder { color: rgba(255,255,255,0.35); }
        textarea::placeholder { color: rgba(255,255,255,0.35); }
        option { background: #1b4332; color: white; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={s.header}>
        <span style={s.headerTitle}>🌿 ERVAS — Farmer Module</span>
        <button style={s.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
      </div>

      <div style={s.body}>
        <div style={s.card}>
          <h2 style={s.title}>🌱 Submit Herb Batch</h2>

          {/* AI Status Message */}
          {aiMessage && (
            <div style={s.aiBox}>
              {aiLoading && <span style={{ display:'inline-block', animation:'spin 1s linear infinite', marginRight:'0.5rem' }}>⏳</span>}
              {aiMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* STEP 1 - Photo first */}
            <div style={s.group}>
              <label style={s.label}>📷 Step 1 — Take Herb Photo <span style={{ color:'#74c69d', fontSize:'0.8rem' }}>(AI will auto-fill the form!)</span></label>

              {photoPreview ? (
                <div>
                  <img src={photoPreview} alt="herb" style={s.photoPreview} />
                  {location && (
                    <div style={s.locationBox}>
                      📍 Location captured: {location.lat}, {location.lng} &nbsp;|&nbsp; 🕐 {new Date().toLocaleString()}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.8rem' }}>
                    <button type="button" style={{ ...s.photoBtn, background:'rgba(255,80,80,0.2)', color:'#ff8080', flex:1 }} onClick={() => { setPhoto(null); setPhotoPreview(null); setLocation(null); setAiMessage(''); setForm({ herbName:'', quantity:'', quantityType:'kg', notes:'' }); }}>
                      🗑️ Remove
                    </button>
                    <button type="button" style={{ ...s.photoBtn, background:'#40916c', color:'white', flex:1 }} onClick={() => cameraRef.current.click()}>
                      📷 Retake
                    </button>
                  </div>
                </div>
              ) : (
                <div style={s.photoBox}>
                  <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>🌿</div>
                  <p style={{ color:'rgba(255,255,255,0.6)', marginBottom:'1.2rem', fontSize:'0.9rem' }}>
                    Take a photo → AI identifies herb + quantity automatically!
                  </p>
                  <div style={{ display:'flex', gap:'0.8rem', justifyContent:'center' }}>
                    <button type="button" style={{ ...s.photoBtn, background:'#40916c', color:'white' }} onClick={() => cameraRef.current.click()}>
                      📸 Open Camera
                    </button>
                    <button type="button" style={{ ...s.photoBtn, background:'rgba(255,255,255,0.1)', color:'white' }} onClick={() => fileRef.current.click()}>
                      🖼️ Gallery
                    </button>
                  </div>
                </div>
              )}
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={handlePhoto} />
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto} />
            </div>

            {/* STEP 2 - Check auto-filled fields */}
            <div style={s.group}>
              <label style={s.label}>🌿 Herb Name <span style={{ color:'#74c69d', fontSize:'0.8rem' }}>(auto-filled — correct if needed 🎤)</span></label>
              <div style={s.inputRow}>
                <input style={s.input} placeholder="AI will fill this..." value={form.herbName} onChange={(e) => setForm({...form, herbName: e.target.value})} required />
                <button type="button" style={listening === 'herbName' ? s.voiceBtnActive : s.voiceBtn} onClick={() => startVoice('herbName')}>
                  {listening === 'herbName' ? '🔴' : '🎤'}
                </button>
              </div>
            </div>

            <div style={s.group}>
              <label style={s.label}>⚖️ Quantity <span style={{ color:'#74c69d', fontSize:'0.8rem' }}>(auto-filled — correct if needed 🎤)</span></label>
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

            <div style={s.group}>
              <label style={s.label}>📝 Notes <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.8rem' }}>(auto-filled — correct if needed 🎤)</span></label>
              <div style={s.inputRow}>
                <textarea style={{ ...s.input, height:'70px', resize:'vertical' }} placeholder="AI will fill quality notes..." value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
                <button type="button" style={listening === 'notes' ? s.voiceBtnActive : s.voiceBtn} onClick={() => startVoice('notes')}>
                  {listening === 'notes' ? '🔴' : '🎤'}
                </button>
              </div>
            </div>

            <button type="submit" style={{ ...s.btn, opacity: aiLoading ? 0.6 : 1 }} disabled={aiLoading}>
              {aiLoading ? '⏳ AI Analyzing...' : '🔗 Submit to Blockchain'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Farmer;