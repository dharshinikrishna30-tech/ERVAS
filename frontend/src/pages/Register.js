import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    alert('Registration successful!');
    navigate('/');
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'linear-gradient(135deg, #1b4332, #40916c)' }}>
      <div style={{ background:'white', padding:'2.5rem', borderRadius:'16px', width:'100%', maxWidth:'420px', textAlign:'center' }}>
        <div style={{ fontSize:'3rem' }}>🌿</div>
        <h1 style={{ color:'#1b4332', marginBottom:'0.3rem' }}>ERVAS</h1>
        <p style={{ color:'#888', marginBottom:'1.8rem' }}>Create your company account</p>

        <form onSubmit={handleRegister}>
          <div style={{ textAlign:'left', marginBottom:'1rem' }}>
            <label style={{ fontWeight:'600', color:'#333' }}>Company Name</label>
            <input type="text" placeholder="Enter company name" value={name} onChange={(e) => setName(e.target.value)} required
              style={{ width:'100%', padding:'0.75rem', border:'2px solid #e0e0e0', borderRadius:'8px', marginTop:'0.4rem', boxSizing:'border-box' }} />
          </div>
          <div style={{ textAlign:'left', marginBottom:'1rem' }}>
            <label style={{ fontWeight:'600', color:'#333' }}>Email</label>
            <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{ width:'100%', padding:'0.75rem', border:'2px solid #e0e0e0', borderRadius:'8px', marginTop:'0.4rem', boxSizing:'border-box' }} />
          </div>
          <div style={{ textAlign:'left', marginBottom:'1.5rem' }}>
            <label style={{ fontWeight:'600', color:'#333' }}>Password</label>
            <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required
              style={{ width:'100%', padding:'0.75rem', border:'2px solid #e0e0e0', borderRadius:'8px', marginTop:'0.4rem', boxSizing:'border-box' }} />
          </div>
          <button type="submit"
            style={{ width:'100%', padding:'0.85rem', background:'linear-gradient(135deg, #40916c, #1b4332)', color:'white', border:'none', borderRadius:'8px', fontSize:'1rem', fontWeight:'600', cursor:'pointer' }}>
            Register
          </button>
        </form>
        <p style={{ marginTop:'1.5rem', color:'#888' }}>
          Already have an account? <span onClick={() => navigate('/')} style={{ color:'#40916c', fontWeight:'600', cursor:'pointer' }}>Login here</span>
        </p>
      </div>
    </div>
  );
}

export default Register;