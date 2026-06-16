import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBatches } from '../BatchContext';

function Processing() {
  const navigate = useNavigate();
  const { batches, updateBatchStatus } = useBatches();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [form, setForm] = useState({
    processType: 'drying', temperature: '', duration: '',
    output: '', outputUnit: 'kg', quality: 'good', notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [listening, setListening] = useState(null);

  const pendingBatches = batches.filter(b => b.status === 'pending_processing');

  const startVoice = (field) => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Use Chrome for voice!'); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-IN';
    setListening(field);
    rec.start();
    rec.onresult = (e) => { setForm(p => ({ ...p, [field]: e.results[0][0].transcript })); setListening(null); };
    rec.onerror = () => setListening(null);
    rec.onend = () => setListening(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateBatchStatus(selectedBatch.id, 'pending_lab');
    setSubmitted(true);
  };

  const s = {
    page: { minHeight:'100vh', background:'linear-gradient(135deg, #0a2e1a, #1b4332)' },
    header: { background:'rgba(0,0,0,0.3)', backdropFilter:'blur(10px)', padding:'1rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.1)' },
    headerTitle: { color:'white', fontSize:'1.2rem', fontWeight:'700', letterSpacing:'2px' },
    backBtn: { background:'rgba(255,255,255,0.1)', color:'white', border:'2px solid rgba(255,255,255,0.4)', padding:'0.5rem 1.2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'600' },
    body: { padding:'1.5rem', maxWidth:'650px', margin:'0 auto' },
    card: { background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'20px', padding:'1.8rem', marginBottom:'1rem' },
    title: { color:'white', fontSize:'1.4rem', marginBottom:'0.3rem', textAlign:'center' },
    subtitle: { color:'rgba(255,255,255,0.5)', fontSize:'0.85rem', textAlign:'center', marginBottom:'1.5rem' },
    group: { marginBottom:'1.3rem' },
    label: { display:'block', fontWeight:'600', color:'rgba(255,255,255,0.85)', marginBottom:'0.5rem', fontSize:'0.95rem' },
    inputRow: { display:'flex', gap:'0.5rem', alignItems:'center' },
    input: { flex:1, padding:'0.75rem 1rem', border:'2px solid rgba(255,255,255,0.15)', borderRadius:'10px', fontSize:'0.95rem', boxSizing:'border-box', outline:'none', background:'rgba(255,255,255,0.07)', color:'white' },
    select: { width:'100%', padding:'0.75rem 1rem', border:'2px solid rgba(255,255,255,0.15)', borderRadius:'10px', background:'rgba(255,255,255,0.07)', color:'white', fontSize:'0.95rem', outline:'none', boxSizing:'border-box' },
    voiceBtn: { padding:'0.75rem', background:'rgba(255,255,255,0.1)', border:'2px solid rgba(255,255,255,0.2)', borderRadius:'10px', cursor:'pointer', fontSize:'1.2rem', minWidth:'48px' },
    voiceBtnActive: { padding:'0.75rem', background:'rgba(255,80,80,0.3)', border:'2px solid #ff5050', borderRadius:'10px', cursor:'pointer', fontSize:'1.2rem', minWidth:'48px' },
    submitBtn: { width:'100%', padding:'0.9rem', background:'linear-gradient(135deg, #40916c, #1b4332)', color:'white', border:'none', borderRadius:'10px', fontSize:'1rem', fontWeight:'700', cursor:'pointer', marginTop:'0.5rem' },
    batchCard: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', padding:'1rem 1.2rem', marginBottom:'0.8rem', cursor:'pointer', transition:'all 0.2s', display:'flex', justifyContent:'space-between', alignItems:'center' },
    batchCardHover: { background:'rgba(116,198,157,0.1)', border:'1px solid #74c69d' },
    badge: { background:'rgba(244,162,97,0.2)', color:'#f4a261', border:'1px solid #f4a261', borderRadius:'20px', padding:'0.25rem 0.75rem', fontSize:'0.75rem', fontWeight:'700' },
    selectedBox: { background:'rgba(116,198,157,0.1)', border:'1px solid #74c69d', borderRadius:'12px', padding:'1rem', marginBottom:'1.5rem' },
    qualityBtns: { display:'flex', gap:'0.5rem', flexWrap:'wrap' },
    qualityBtn: (selected, color) => ({ padding:'0.6rem 1rem', borderRadius:'8px', border:`2px solid ${selected ? color : 'rgba(255,255,255,0.15)'}`, background: selected ? `${color}22` : 'rgba(255,255,255,0.05)', color: selected ? color : 'rgba(255,255,255,0.6)', cursor:'pointer', fontWeight:'600', fontSize:'0.85rem' }),
    successCard: { background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'20px', padding:'3rem 2rem', textAlign:'center' },
    batchResult: { background:'rgba(116,198,157,0.15)', border:'2px solid #74c69d', borderRadius:'12px', padding:'1rem', margin:'1.5rem 0', fontSize:'1rem', fontWeight:'700', color:'#74c69d' }
  };

  if (submitted) {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <span style={s.headerTitle}>🌿 ERVAS — Processing Unit</span>
          <button style={s.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
        </div>
        <div style={s.body}>
          <div style={s.successCard}>
            <div style={{ fontSize:'5rem', marginBottom:'1rem' }}>✅</div>
            <h2 style={{ color:'white', fontSize:'1.6rem', marginBottom:'0.5rem' }}>Processing Complete!</h2>
            <p style={{ color:'rgba(255,255,255,0.6)', marginBottom:'1rem' }}>Blockchain record updated successfully.</p>
            <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:'12px', padding:'1rem', marginBottom:'1rem', textAlign:'left' }}>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.8rem', marginBottom:'0.5rem' }}>PROCESSING SUMMARY</p>
              <p style={{ color:'white', marginBottom:'0.3rem' }}>🌿 {selectedBatch.herbName}</p>
              <p style={{ color:'rgba(255,255,255,0.7)', marginBottom:'0.3rem' }}>⚙️ Process: {form.processType}</p>
              <p style={{ color:'rgba(255,255,255,0.7)', marginBottom:'0.3rem' }}>📦 Output: {form.output} {form.outputUnit}</p>
              <p style={{ color:'rgba(255,255,255,0.7)' }}>⭐ Quality: {form.quality}</p>
            </div>
            <div style={s.batchResult}>🔬 Next Stage: Laboratory Testing</div>
            <button style={s.submitBtn} onClick={() => { setSubmitted(false); setSelectedBatch(null); setForm({ processType:'drying', temperature:'', duration:'', output:'', outputUnit:'kg', quality:'good', notes:'' }); }}>
              ← Process Another Batch
            </button>
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
      `}</style>
      <div style={s.header}>
        <span style={s.headerTitle}>🌿 ERVAS — Processing Unit</span>
        <button style={s.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
      </div>
      <div style={s.body}>

        {/* Pending Batches List */}
        {!selectedBatch && (
          <div style={s.card}>
            <h2 style={s.title}>⚙️ Processing Unit</h2>
            <p style={s.subtitle}>Select a pending batch to process</p>

            {pendingBatches.length === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem' }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📭</div>
                <p style={{ color:'rgba(255,255,255,0.5)' }}>No pending batches right now.</p>
                <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.85rem' }}>Waiting for farmers to submit herb batches.</p>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                  <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.9rem' }}>
                    {pendingBatches.length} batch{pendingBatches.length > 1 ? 'es' : ''} waiting
                  </p>
                  <span style={s.badge}>⏳ Pending</span>
                </div>
                {pendingBatches.map((batch) => (
                  <div key={batch.id} style={s.batchCard}
                    onMouseEnter={e => Object.assign(e.currentTarget.style, { background:'rgba(116,198,157,0.1)', border:'1px solid #74c69d' })}
                    onMouseLeave={e => Object.assign(e.currentTarget.style, { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' })}
                    onClick={() => setSelectedBatch(batch)}>
                    <div>
                      <p style={{ color:'white', fontWeight:'700', marginBottom:'0.3rem' }}>🌿 {batch.herbName}</p>
                      <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.8rem', marginBottom:'0.2rem' }}>⚖️ {batch.quantity} {batch.quantityType}</p>
                      <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.75rem' }}>🕐 {batch.timestamp}</p>
                      {batch.location && <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.75rem' }}>📍 {batch.location.lat}, {batch.location.lng}</p>}
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ color:'#74c69d', fontSize:'0.75rem', marginBottom:'0.5rem' }}>{batch.id}</p>
                      <span style={{ background:'#40916c', color:'white', padding:'0.3rem 0.8rem', borderRadius:'20px', fontSize:'0.75rem', fontWeight:'600' }}>
                        Process →
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Processing Form */}
        {selectedBatch && (
          <div style={s.card}>
            <h2 style={s.title}>⚙️ Processing Details</h2>
            <p style={s.subtitle}>Fill in processing information for this batch</p>

            <div style={s.selectedBox}>
              <p style={{ color:'#74c69d', fontWeight:'700', marginBottom:'0.3rem' }}>Selected Batch</p>
              <p style={{ color:'white', marginBottom:'0.2rem' }}>🌿 {selectedBatch.herbName} — {selectedBatch.quantity} {selectedBatch.quantityType}</p>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.8rem' }}>🔗 {selectedBatch.id}</p>
              <button style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:'0.8rem', marginTop:'0.5rem', padding:0 }} onClick={() => setSelectedBatch(null)}>
                ← Choose different batch
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={s.group}>
                <label style={s.label}>⚙️ Process Type</label>
                <select style={s.select} value={form.processType} onChange={(e) => setForm({...form, processType: e.target.value})}>
                  <option value="drying">Sun Drying</option>
                  <option value="shade_drying">Shade Drying</option>
                  <option value="washing">Washing & Cleaning</option>
                  <option value="grinding">Grinding / Powdering</option>
                  <option value="extraction">Extraction</option>
                  <option value="sorting">Sorting & Grading</option>
                  <option value="steaming">Steaming</option>
                  <option value="packaging_prep">Packaging Preparation</option>
                </select>
              </div>

              <div style={{ display:'flex', gap:'0.8rem' }}>
                <div style={{ ...s.group, flex:1 }}>
                  <label style={s.label}>🌡️ Temperature (°C)</label>
                  <div style={s.inputRow}>
                    <input style={s.input} placeholder="e.g. 45" value={form.temperature} onChange={(e) => setForm({...form, temperature: e.target.value})} />
                    <button type="button" style={listening==='temperature' ? s.voiceBtnActive : s.voiceBtn} onClick={() => startVoice('temperature')}>
                      {listening==='temperature' ? '🔴' : '🎤'}
                    </button>
                  </div>
                </div>
                <div style={{ ...s.group, flex:1 }}>
                  <label style={s.label}>⏱️ Duration (hrs)</label>
                  <div style={s.inputRow}>
                    <input style={s.input} placeholder="e.g. 8" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} />
                    <button type="button" style={listening==='duration' ? s.voiceBtnActive : s.voiceBtn} onClick={() => startVoice('duration')}>
                      {listening==='duration' ? '🔴' : '🎤'}
                    </button>
                  </div>
                </div>
              </div>

              <div style={s.group}>
                <label style={s.label}>📦 Output Quantity after Processing</label>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <div style={{ ...s.inputRow, flex:1 }}>
                    <input style={s.input} placeholder="e.g. 40" value={form.output} onChange={(e) => setForm({...form, output: e.target.value})} required />
                    <button type="button" style={listening==='output' ? s.voiceBtnActive : s.voiceBtn} onClick={() => startVoice('output')}>
                      {listening==='output' ? '🔴' : '🎤'}
                    </button>
                  </div>
                  <select style={{ ...s.select, width:'auto' }} value={form.outputUnit} onChange={(e) => setForm({...form, outputUnit: e.target.value})}>
                    <option value="kg">kg</option>
                    <option value="grams">grams</option>
                    <option value="litres">litres</option>
                    <option value="units">units</option>
                  </select>
                </div>
              </div>

              <div style={s.group}>
                <label style={s.label}>⭐ Quality Assessment</label>
                <div style={s.qualityBtns}>
                  {[['excellent','#74c69d'],['good','#52b788'],['average','#f4a261'],['poor','#e76f51']].map(([q,color]) => (
                    <button key={q} type="button" style={s.qualityBtn(form.quality===q, color)} onClick={() => setForm({...form, quality: q})}>
                      {q==='excellent'?'⭐ Excellent':q==='good'?'✅ Good':q==='average'?'⚠️ Average':'❌ Poor'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.group}>
                <label style={s.label}>📝 Notes</label>
                <div style={s.inputRow}>
                  <textarea style={{ ...s.input, height:'70px', resize:'vertical' }} placeholder="Any observations during processing..." value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
                  <button type="button" style={listening==='notes' ? s.voiceBtnActive : s.voiceBtn} onClick={() => startVoice('notes')}>
                    {listening==='notes' ? '🔴' : '🎤'}
                  </button>
                </div>
              </div>

              <button type="submit" style={s.submitBtn}>🔗 Update Blockchain Record</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Processing;