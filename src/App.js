import React, { useState, useEffect, useRef } from 'react';
import { TonConnectUIProvider, TonConnectButton, useTonAddress } from '@tonconnect/ui-react';

// Telegram Channel and Group Links
const TASK_LINKS = {
  newsChannel: 'https://t.me/MAI_News_Official',
  payoutChannel: 'https://t.me/MAI_Payout_Proof',
  communityChat: 'https://t.me/MAICommunityChat',
  partnerChannel1: 'https://t.me/MAICommunityChat'
};

// Boost Levels Data
const BOOST_LEVELS = [
  { level: 1, speed: '10 MAI/day', cost: '0.1 TON' },
  { level: 2, speed: '25 MAI/day', cost: '0.25 TON' },
  { level: 3, speed: '50 MAI/day', cost: '0.5 TON' },
  { level: 4, speed: '100 MAI/day', cost: '1.0 TON' },
  { level: 5, speed: '250 MAI/day', cost: '2.5 TON' }
];

// Modern SVG Icons Component
const NavIcon = ({ id, isActive }) => {
  const color = isActive ? '#ff9900' : '#80a0c0';
  const filter = isActive ? 'drop-shadow(0px 0px 8px #ff9900)' : 'none';

  switch (id) {
    case 'home':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter, transition: 'all 0.3s ease' }}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'task':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter, transition: 'all 0.3s ease' }}>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case 'friends':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter, transition: 'all 0.3s ease' }}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 1 0 7.75" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'profile':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter, transition: 'all 0.3s ease' }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return null;
  }
};

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('home');

  // Coin Click Animation State
  const [isCoinClicked, setIsCoinClicked] = useState(false);

  // Page View state for Boost Sub-page
  const [currentView, setCurrentView] = useState('main');
  const [selectedLevel, setSelectedLevel] = useState(null);

  // TON Address Custom Hook
  const userFriendlyAddress = useTonAddress();

  // Balance Persistence
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('mai_balance');
    return saved ? parseFloat(saved) : 10.0;
  });

  // Persistent Claim Timer
  const [claimTimer, setClaimTimer] = useState(() => {
    const savedLastClaim = localStorage.getItem('mai_last_claim_time');
    if (savedLastClaim) {
      const elapsed = Math.floor((Date.now() - parseInt(savedLastClaim, 10)) / 1000);
      const remaining = 8 * 3600 - elapsed;
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  const [canClaim, setCanClaim] = useState(() => claimTimer <= 0);
  const canvasRef = useRef(null);

  // Telegram User ID State
  const [userId, setUserId] = useState(null);

  // Task Completion States
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('mai_completed_tasks');
    return saved ? JSON.parse(saved) : {};
  });

  // Save Persistence
  useEffect(() => {
    localStorage.setItem('mai_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('mai_completed_tasks', JSON.stringify(completedTasks));
  }, [completedTasks]);

  // Persistent Countdown Interval
  useEffect(() => {
    if (canClaim) return;

    const timerInterval = setInterval(() => {
      setClaimTimer((prev) => {
        if (prev <= 1) {
          setCanClaim(true);
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [canClaim]);

  // Fetch Telegram User ID
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user && user.id) {
        setUserId(user.id);
      } else {
        setUserId(7680002112);
      }
    } else {
      setUserId(7680002112);
    }
  }, []);

  // Initial Loader
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 400);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
    return () => clearInterval(timer);
  }, []);

  // Cosmic Background Canvas
  useEffect(() => {
    if (loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 2 + 0.2,
      radius: Math.random() * 1.8 + 0.5,
      alpha: Math.random(),
      alphaSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      color: ['#ffffff', '#80d4ff', '#ffb3ec', '#ffd699'][Math.floor(Math.random() * 4)]
    }));

    const dustParticles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2 - 0.1,
      radius: Math.random() * 3 + 1,
      alpha: Math.random() * 0.6 + 0.2,
      color: ['#00f0ff', '#e000ff', '#ffaa00', '#00ffaa'][Math.floor(Math.random() * 4)]
    }));

    let pulseTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pulseTime += 0.015;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const cyanGlow = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.2,
        10,
        canvas.width * 0.3,
        canvas.height * 0.2,
        canvas.width * 0.6
      );
      cyanGlow.addColorStop(0, `rgba(0, 212, 255, ${0.15 + Math.sin(pulseTime) * 0.05})`);
      cyanGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cyanGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.restore();

      stars.forEach((s) => {
        s.alpha += s.alphaSpeed;
        if (s.alpha >= 1 || s.alpha <= 0.1) s.alphaSpeed = -s.alphaSpeed;
        s.y -= 0.08 * s.z;
        if (s.y < 0) s.y = canvas.height;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * s.z, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      dustParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [loading]);

  // Mining Speed
  useEffect(() => {
    if (loading) return;
    const miningInterval = setInterval(() => {
      setBalance((prev) => prev + 5 / 86400);
    }, 1000);
    return () => clearInterval(miningInterval);
  }, [loading]);

  const handleClaimBonus = () => {
    if (canClaim) {
      setBalance((prev) => prev + 1.6667);
      setCanClaim(false);
      setClaimTimer(8 * 3600);
      localStorage.setItem('mai_last_claim_time', Date.now().toString());
    }
  };

  // Logo Click Trigger
  const handleCoinClick = () => {
    setIsCoinClicked(true);
    setTimeout(() => setIsCoinClicked(false), 250);
  };

  const handleTaskClick = (taskKey, link) => {
    window.open(link, '_blank');
    setCompletedTasks((prev) => ({ ...prev, [taskKey]: true }));
    setBalance((prev) => prev + 2.0);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (loading) {
    return (
      <div style={{ backgroundImage: "url('/space-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '2px solid #00f0ff', overflow: 'hidden', boxShadow: '0 0 35px rgba(0, 240, 255, 0.8)', marginBottom: '20px' }}>
          <img src="/mai-coin.jpg" alt="MAI Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h2 style={{ color: '#00f0ff', letterSpacing: '3px', margin: '0 0 10px 0', textShadow: '0 0 12px #00f0ff' }}>MAI NETWORK</h2>
        <p style={{ color: '#ffb3ec', fontSize: '14px', fontWeight: 'bold' }}>Loading Cosmic World... {progress}%</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundImage: "url('/space-bg.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      color: '#ffffff',
      minHeight: '100vh',
      paddingBottom: '90px',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      position: 'relative',
      WebkitTapHighlightColor: 'transparent'
    }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,240,255,0.2)', backgroundColor: 'rgba(5, 10, 25, 0.4)', backdropFilter: 'blur(10px)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#ffffff' }}>User</div>
            <div style={{ fontSize: '12px', color: '#00f0ff', fontWeight: '500' }}>ID: {userId || '7680002112'}</div>
          </div>

          <div style={{ backgroundColor: 'rgba(10, 20, 45, 0.7)', padding: '6px 14px 6px 8px', borderRadius: '25px', border: '1px solid rgba(0, 240, 255, 0.6)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 20px rgba(0,240,255,0.3)' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/mai-coin.jpg" alt="Coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontWeight: 'bold', color: '#00f0ff', fontSize: '15px' }}>{balance.toFixed(4)}</span>
          </div>
        </div>

        {/* ----------------- 1. HOME VIEW ----------------- */}
        {currentView === 'main' && activeTab === 'home' && (
          <div style={{ padding: '30px 20px', textAlign: 'center' }}>
            <div style={{ color: '#00f0ff', fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '15px', textShadow: '0 0 12px rgba(0,240,255,0.8)' }}>
              24H SPEED: 5.0000 MAI
            </div>

            <div
              onClick={handleCoinClick}
              style={{
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                margin: '15px auto 20px auto',
                padding: '6px',
                background: 'linear-gradient(145deg, #00f0ff, #e000ff)',
                boxShadow: isCoinClicked
                  ? '0 0 80px rgba(255, 153, 0, 1), inset 0 0 25px rgba(255, 255, 255, 0.9)'
                  : '0 0 60px rgba(0, 240, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transform: isCoinClicked ? 'scale(0.92) rotate(-3deg)' : 'scale(1)',
                transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                userSelect: 'none'
              }}
            >
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '3px solid #00f0ff', pointerEvents: 'none' }}>
                <img src="/mai-coin.jpg" alt="MAI Coin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            <div style={{ color: '#d0e8ff', fontSize: '14px', marginBottom: '30px' }}>
              Auto Mining Speed: <span style={{ color: '#00FF66', fontWeight: 'bold', textShadow: '0 0 8px rgba(0,255,102,0.8)' }}>+0.0000578 / sec</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '95%', margin: '0 auto', alignItems: 'stretch' }}>
              {canClaim ? (
                <button
                  onClick={handleClaimBonus}
                  style={{
                    flex: 1, padding: '16px 8px', background: 'linear-gradient(135deg, #00FF66, #009933)', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0, 255, 102, 0.6)', outline: 'none'
                  }}
                >
                  CLAIM BONUS (+1.66 MAI)
                </button>
              ) : (
                <div style={{ flex: 1, padding: '10px 8px', backgroundColor: 'rgba(10, 20, 45, 0.85)', border: '1px solid rgba(0, 240, 255, 0.5)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(0, 240, 255, 0.15)' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '2px' }}>FARMING TIME</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#00f0ff', fontFamily: "'Courier New', Courier, monospace", textShadow: '0 0 10px rgba(0, 240, 255, 0.7)', letterSpacing: '1px' }}>{formatTime(claimTimer)}</div>
                </div>
              )}

              <button
                onClick={() => setCurrentView('boost')}
                style={{
                  flex: 1,
                  padding: '14px 10px',
                  background: 'linear-gradient(135deg, #ff8800 0%, #ff4400 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '16px',
                  fontWeight: '900',
                  fontSize: '16px',
                  letterSpacing: '1.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(255, 102, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)'
                }}
              >
                <span>BOOST</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------- 2. BOOST SUB-PAGE ----------------- */}
        {currentView === 'boost' && (
          <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <button
                onClick={() => setCurrentView('main')}
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', borderRadius: '12px', padding: '8px 14px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ← Back
              </button>
              <h2 style={{ flex: 1, textAlign: 'center', margin: 0, color: '#ff9900', textShadow: '0 0 10px rgba(255,153,0,0.6)', marginRight: '50px' }}>Speed Boost</h2>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
              Upgrade your mining level using TON to increase your daily MAI yield!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {BOOST_LEVELS.map((item) => (
                <div
                  key={item.level}
                  style={{
                    backgroundColor: 'rgba(10, 20, 40, 0.75)',
                    border: '1px solid rgba(255, 153, 0, 0.3)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>Level {item.level}</div>
                    <div style={{ fontSize: '13px', color: '#00f0ff', marginTop: '4px' }}>{item.speed}</div>
                  </div>
                  <button
                    onClick={() => setSelectedLevel(item)}
                    style={{
                      background: 'linear-gradient(135deg, #ff8800, #ff4400)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 'bold',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 0 12px rgba(255, 102, 0, 0.4)'
                    }}
                  >
                    {item.cost}
                  </button>
                </div>
              ))}
            </div>

            {/* Level Purchase Confirmation Modal */}
            {selectedLevel && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
                <div style={{ backgroundColor: '#0f172a', border: '1px solid #ff9900', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '340px', textAlign: 'center', boxShadow: '0 0 30px rgba(255, 153, 0, 0.3)' }}>
                  <h3 style={{ color: '#ff9900', marginTop: 0 }}>Confirm Boost</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
                    Upgrade to <strong>Level {selectedLevel.level}</strong> for <strong>{selectedLevel.cost}</strong>?
                  </p>
                  <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
                    <TonConnectButton />
                  </div>
                  <button
                    onClick={() => setSelectedLevel(null)}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', marginTop: '8px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- 3. TASKS VIEW ----------------- */}
        {currentView === 'main' && activeTab === 'task' && (
          <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
            <h2 style={{ color: '#00f0ff', textAlign: 'center', margin: '0 0 20px 0', textShadow: '0 0 10px rgba(0,240,255,0.6)' }}>Task Center</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(TASK_LINKS).map(([key, link]) => {
                const isDone = completedTasks[key];
                return (
                  <div key={key} style={{ backgroundColor: 'rgba(10, 20, 45, 0.75)', border: '1px solid rgba(0, 240, 255, 0.3)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div style={{ color: '#00FF66', fontSize: '12px', marginTop: '2px' }}>+2.0000 MAI</div>
                    </div>
                    <button
                      disabled={isDone}
                      onClick={() => handleTaskClick(key, link)}
                      style={{
                        background: isDone ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00f0ff, #0088ff)',
                        color: isDone ? '#64748b' : '#000',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        cursor: isDone ? 'default' : 'pointer'
                      }}
                    >
                      {isDone ? 'Completed' : 'Join (+2 MAI)'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ----------------- 4. FRIENDS VIEW ----------------- */}
        {currentView === 'main' && activeTab === 'friends' && (
          <div style={{ padding: '24px 16px', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
            <h2 style={{ color: '#00f0ff', margin: '0 0 10px 0' }}>Invite Friends</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
              Earn 10% bonus from every friend's mining rewards!
            </p>
            <div style={{ backgroundColor: 'rgba(10, 20, 45, 0.75)', border: '1px dashed rgba(0, 240, 255, 0.4)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>YOUR REFERRAL LINK</div>
              <div style={{ color: '#00f0ff', fontSize: '13px', wordBreak: 'break-all', fontWeight: 'bold' }}>
                https://t.me/MAI_Bot?start={userId || '7680002112'}
              </div>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(`https://t.me/MAI_Bot?start=${userId || '7680002112'}`)}
              style={{ background: 'linear-gradient(135deg, #00f0ff, #0088ff)', color: '#000', border: 'none', padding: '14px 28px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
            >
              Copy Referral Link
            </button>
          </div>
        )}

        {/* ----------------- 5. PROFILE VIEW ----------------- */}
        {currentView === 'main' && activeTab === 'profile' && (
          <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ color: '#00f0ff', margin: '0 0 20px 0' }}>User Profile</h2>

            <div style={{ backgroundColor: 'rgba(10, 20, 45, 0.75)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '16px', padding: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>TELEGRAM ID</div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{userId || '7680002112'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>CURRENT BALANCE</div>
                <div style={{ color: '#00FF66', fontSize: '18px', fontWeight: 'bold' }}>{balance.toFixed(4)} MAI</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px' }}>WALLET STATUS</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: userFriendlyAddress ? '#00f0ff' : '#ef4444' }}>
                    {userFriendlyAddress ? `${userFriendlyAddress.slice(0, 6)}...${userFriendlyAddress.slice(-4)}` : 'Not Connected'}
                  </span>
                  <TonConnectButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PERFECTLY CENTERED GLOWING NAVIGATION BAR */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '420px',
        boxSizing: 'border-box',
        backgroundColor: 'rgba(8, 15, 30, 0.88)',
        backdropFilter: 'blur(18px)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 4px',
        borderRadius: '24px',
        border: '1px solid rgba(255, 153, 0, 0.25)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(255, 153, 0, 0.12)',
        zIndex: 1000
      }}>
        {[
          { id: 'home', label: 'Home' },
          { id: 'task', label: 'Tasks' },
          { id: 'friends', label: 'Friends' },
          { id: 'profile', label: 'Profile' }
        ].map((tab) => {
          const isActive = activeTab === tab.id && currentView === 'main';
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentView('main');
              }}
              style={{
                background: isActive ? 'rgba(255, 153, 0, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(255, 153, 0, 0.5)' : '1px solid transparent',
                borderRadius: '16px',
                padding: '8px 0',
                color: isActive ? '#ff9900' : '#80a0c0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                flex: 1,
                boxSizing: 'border-box',
                transition: 'all 0.2s ease-in-out',
                boxShadow: isActive ? '0 0 16px rgba(255, 153, 0, 0.35), inset 0 0 8px rgba(255, 153, 0, 0.2)' : 'none',
                transform: isActive ? 'translateY(-2px)' : 'none',
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none'
              }}
            >
              <NavIcon id={tab.id} isActive={isActive} />
              <span style={{
                fontSize: '11px',
                fontWeight: isActive ? '800' : '500',
                letterSpacing: '0.5px',
                textShadow: isActive ? '0 0 10px rgba(255, 153, 0, 0.8)' : 'none'
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Fixed TON Connect Provider using inline manifest URL to prevent fetch errors
function App() {
  const manifestData = {
    url: typeof window !== 'undefined' ? window.location.origin : 'https://my-crypto-app-4hm8.onrender.com',
    name: 'MAI Network Mini App',
    iconUrl: 'https://my-crypto-app-4hm8.onrender.com/mai-coin.jpg'
  };

  const manifestUrl = `data:application/json,${encodeURIComponent(JSON.stringify(manifestData))}`;

  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/MAI_Bot'
      }}
    >
      <AppContent />
    </TonConnectUIProvider>
  );
}

export default App;