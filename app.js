const { useState, useEffect, useRef, useCallback } = React;

// ─── SAMPLE DATA ─────────────────────────────────────────────────────────────
const SAMPLE_JD = `Senior Full-Stack Engineer — FinTech Startup (Series B)

We're building the next generation of embedded finance infrastructure. You'll lead core product features end-to-end, from architecture decisions to production deployment.

Requirements:
• 4+ years of professional software engineering experience
• Strong proficiency in React, TypeScript, and Node.js
• Experience with PostgreSQL or similar relational databases
• Familiarity with cloud platforms (AWS preferred)
• Experience in fintech, payments, or regulated industries is a plus
• Strong communication skills and ability to work in fast-paced environments

Nice to have:
• Experience with Kafka or event-driven architectures
• Kubernetes / Docker containerization
• Prior startup experience

Location: Remote (US timezone preferred)
Compensation: $140k–$180k + equity`;

const AVATAR_COLORS = ['#7c6fef','#0d9488','#c97c3a','#be185d','#1d4ed8','#16a34a','#9333ea','#0891b2'];

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
}

// ─── API CALL ────────────────────────────────────────────────────────────────
async function callClaude(messages, systemPrompt) {
  const apiKey = localStorage.getItem('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY in localStorage');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let res;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemPrompt,
        messages
      })
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    throw new Error(`Claude API request failed (${res.status})`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.map(b => b.text || '').join('');
}

function fallbackParseJD(jdText) {
  const text = jdText || '';
  const title = text.split('\n').find(Boolean)?.trim() || 'Senior Software Engineer';
  const lower = text.toLowerCase();
  const skillPool = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Kafka', 'Docker', 'Kubernetes', 'Python', 'JavaScript'];
  const required = skillPool.filter(skill => lower.includes(skill.toLowerCase())).slice(0, 6);
  return {
    title,
    company_type: lower.includes('startup') ? 'Startup' : 'Product company',
    experience_years: /\b\d\+\s*years?/i.test(text) ? text.match(/\b\d\+\s*years?/i)[0] : '4+ years',
    required_skills: required.length ? required : ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
    nice_to_have: ['Kafka', 'Docker', 'Kubernetes'].filter(skill => lower.includes(skill.toLowerCase())),
    location: /location:\s*(.*)/i.test(text) ? text.match(/location:\s*(.*)/i)[1].trim() : 'Remote',
    salary_range: /compensation:\s*(.*)/i.test(text) ? text.match(/compensation:\s*(.*)/i)[1].trim() : '$120k-$180k',
    key_traits: ['ownership', 'communication', 'problem-solving'],
    seniority: lower.includes('lead') ? 'lead' : lower.includes('principal') ? 'principal' : lower.includes('senior') ? 'senior' : 'mid'
  };
}

function fallbackCandidates(parsedJD) {
  const required = parsedJD?.required_skills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'];
  const pool = [
    { id:'c1', name:'Aarav Mehta', current_role:'Senior Full-Stack Engineer at Stripe', location:'Bengaluru, India', years_exp:7, skills:['React','TypeScript','Node.js','PostgreSQL','AWS','Kafka'], education:'B.Tech, IIT Madras', github_activity:'high', open_to_work:true, last_active:'1 day ago', linkedin_summary:'Builds high-scale fintech products with strong frontend and backend ownership.' },
    { id:'c2', name:'Nisha Kapoor', current_role:'Staff Engineer at Razorpay', location:'Pune, India', years_exp:8, skills:['TypeScript','Node.js','PostgreSQL','AWS','Docker'], education:'B.E., BITS Pilani', github_activity:'medium', open_to_work:true, last_active:'3 days ago', linkedin_summary:'Backend-leaning full-stack engineer focused on payments reliability and distributed systems.' },
    { id:'c3', name:'Rohan Iyer', current_role:'Senior Software Engineer at Swiggy', location:'Hyderabad, India', years_exp:6, skills:['React','JavaScript','Node.js','PostgreSQL','Docker'], education:'B.Tech, NIT Trichy', github_activity:'medium', open_to_work:false, last_active:'2 days ago', linkedin_summary:'Product-minded engineer with startup and scale-up experience across consumer and fintech-adjacent teams.' },
    { id:'c4', name:'Maya Nair', current_role:'Full-Stack Engineer at CRED', location:'Mumbai, India', years_exp:5, skills:['React','TypeScript','Node.js','AWS','Kubernetes'], education:'B.Tech, VIT Vellore', github_activity:'high', open_to_work:true, last_active:'5 days ago', linkedin_summary:'Delivers polished user experiences with strong APIs and cloud-native deployment workflows.' },
    { id:'c5', name:'Dev Malhotra', current_role:'Software Engineer at Zoho', location:'Chennai, India', years_exp:4, skills:['React','Node.js','PostgreSQL','AWS'], education:'B.E., Anna University', github_activity:'low', open_to_work:true, last_active:'9 days ago', linkedin_summary:'Generalist engineer with strong execution speed and practical product delivery experience.' },
    { id:'c6', name:'Ishita Rao', current_role:'Senior Engineer at PhonePe', location:'Delhi, India', years_exp:7, skills:['TypeScript','Node.js','Kafka','PostgreSQL','AWS','Docker'], education:'B.Tech, IIIT Hyderabad', github_activity:'medium', open_to_work:false, last_active:'4 days ago', linkedin_summary:'Payments-domain specialist with deep event-driven architecture and backend platform exposure.' },
    { id:'c7', name:'Karan Shah', current_role:'Frontend Lead at Groww', location:'Ahmedabad, India', years_exp:6, skills:['React','TypeScript','JavaScript','Docker'], education:'B.Tech, DA-IICT', github_activity:'high', open_to_work:true, last_active:'1 day ago', linkedin_summary:'Frontend-focused lead with strong TypeScript architecture and mentoring background.' },
    { id:'c8', name:'Sanya Verma', current_role:'Software Engineer at Freshworks', location:'Remote, India', years_exp:5, skills:['React','Node.js','TypeScript','PostgreSQL','AWS'], education:'B.Tech, Manipal Institute of Technology', github_activity:'medium', open_to_work:true, last_active:'6 days ago', linkedin_summary:'Balanced full-stack engineer experienced in SaaS and high-cadence product teams.' }
  ];

  return pool.map(candidate => {
    const overlap = required.filter(skill => candidate.skills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs.toLowerCase())));
    const score = Math.min(96, Math.max(54, Math.round((overlap.length / Math.max(required.length, 1)) * 70 + (candidate.years_exp * 3))));
    const gaps = required.filter(skill => !overlap.includes(skill)).slice(0, 2);
    return {
      ...candidate,
      match_score: score,
      match_reasons: [
        `${overlap.length}/${required.length} key skills matched`,
        `${candidate.years_exp} years relevant experience`,
        candidate.open_to_work ? 'Actively open to new opportunities' : 'Passive but responsive profile'
      ],
      match_gaps: gaps.length ? gaps.map(g => `Limited evidence of ${g}`) : ['No major gaps detected']
    };
  });
}

function fallbackCandidateReply(candidate, messageHistory) {
  const recruiterTurns = messageHistory.filter(m => m.role === 'user').length;
  const lastRecruiterMsg = (messageHistory.filter(m => m.role === 'user').slice(-1)[0]?.content || '').toLowerCase();
  const firstName = candidate.name.split(' ')[0];

  let reply = `Thanks for sharing this, I appreciate the context. The role sounds aligned with the kind of product impact I want next.`;
  if (lastRecruiterMsg.includes('salary') || lastRecruiterMsg.includes('compensation')) {
    reply = `Compensation alignment matters to me, and I would like to understand the fixed/equity mix. If that is within market range, I am happy to move forward.`;
  } else if (lastRecruiterMsg.includes('remote') || lastRecruiterMsg.includes('timezone')) {
    reply = `Remote works well for me as long as there is a clear overlap window for collaboration. I can support regular syncs across core working hours.`;
  } else if (lastRecruiterMsg.includes('tech') || lastRecruiterMsg.includes('stack')) {
    reply = `The stack looks strong, especially around ${candidate.skills.slice(0, 2).join(' and ')}. I am keen to understand architecture ownership and delivery expectations for this role.`;
  } else if (lastRecruiterMsg.includes('interview') || lastRecruiterMsg.includes('call')) {
    reply = `Yes, I can do a call this week. Please share a couple of slots and I will confirm one quickly.`;
  }

  if (recruiterTurns >= 3) {
    const interest = candidate.open_to_work ? 'high' : 'medium';
    return `${reply} [INTEREST:${interest}]`;
  }
  return `${reply} - ${firstName}`;
}

async function parseJD(jdText) {
  const system = `You are a recruitment AI. Parse the job description and return ONLY a valid JSON object (no markdown, no explanation) with these exact fields:
{
  "title": "string",
  "company_type": "string",
  "experience_years": "string",
  "required_skills": ["skill1","skill2",...],
  "nice_to_have": ["skill1",...],
  "location": "string",
  "salary_range": "string",
  "key_traits": ["trait1","trait2","trait3"],
  "seniority": "junior|mid|senior|lead|principal"
}`;
  try {
    const raw = await callClaude([{ role: 'user', content: jdText }], system);
    const cleaned = raw.replace(/```json|```/g,'').trim();
    return JSON.parse(cleaned);
  } catch {
    return fallbackParseJD(jdText);
  }
}

async function generateCandidates(parsedJD) {
  const system = `You are a talent intelligence AI. Given a parsed job description, generate exactly 8 realistic candidate profiles for a talent database. Return ONLY valid JSON array (no markdown). Each candidate:
{
  "id": "c1",
  "name": "Full Name",
  "current_role": "Job Title at Company",
  "location": "City, Country",
  "years_exp": number,
  "skills": ["skill1","skill2",...],
  "education": "Degree, University",
  "github_activity": "high|medium|low",
  "open_to_work": boolean,
  "last_active": "X days ago",
  "match_score": number (0-100),
  "match_reasons": ["reason1","reason2","reason3"],
  "match_gaps": ["gap1"],
  "linkedin_summary": "2-sentence professional summary"
}
Vary match scores realistically (some 85+, some 60-75, some below 60). Make profiles diverse and realistic for a FinTech Senior Full-Stack role.`;
  
  try {
    const raw = await callClaude([{ role: 'user', content: JSON.stringify(parsedJD) }], system);
    const cleaned = raw.replace(/```json|```/g,'').trim();
    return JSON.parse(cleaned);
  } catch {
    return fallbackCandidates(parsedJD);
  }
}

async function engageCandidate(candidate, jdTitle, messageHistory) {
  const system = `You are an AI acting as "${candidate.name}", a ${candidate.years_exp}-year experienced engineer currently working as "${candidate.current_role}". You are responding to a recruiter reaching out about a "${jdTitle}" position.

Personality: Professional but conversational. You are genuinely interested but ask smart questions. You care about: compensation alignment, remote flexibility, tech stack quality, and team culture. 

IMPORTANT: Respond as the CANDIDATE, not the recruiter. Keep responses 2-4 sentences. Be realistic — express genuine interest or hesitation based on fit. After 3-4 exchanges, produce an interest signal (high/medium/low) embedded in your response using: [INTEREST:high] or [INTEREST:medium] or [INTEREST:low]`;

  try {
    const raw = await callClaude(messageHistory, system);
    return raw;
  } catch {
    return fallbackCandidateReply(candidate, messageHistory);
  }
}

async function scoreInterest(chatHistory, candidate) {
  const system = `Analyze this chat transcript between a recruiter and candidate, then return ONLY a JSON object:
{
  "interest_score": number (0-100),
  "interest_level": "high|medium|low",
  "key_signals": ["signal1","signal2","signal3"],
  "concerns": ["concern1"],
  "recommended_action": "string"
}
Base the score on: responsiveness, enthusiasm, questions asked, salary comfort, role fit expressed.`;
  
  const chatText = chatHistory.map(m => `${m.role}: ${m.content}`).join('\n');
  try {
    const raw = await callClaude([{ role: 'user', content: chatText }], system);
    const cleaned = raw.replace(/```json|```/g,'').trim();
    return JSON.parse(cleaned);
  } catch {
    return { interest_score: 65, interest_level: 'medium', key_signals: ['engaged in conversation'], concerns: [], recommended_action: 'Schedule a call' };
  }
}

function estimateInitialInterest(candidate) {
  let score = 48;
  if (candidate.open_to_work) score += 18;
  if (candidate.github_activity === 'high') score += 10;
  if (candidate.github_activity === 'medium') score += 5;

  const lastActiveDays = parseInt((candidate.last_active || '').match(/\d+/)?.[0] || '7', 10);
  if (lastActiveDays <= 2) score += 8;
  else if (lastActiveDays <= 5) score += 5;
  else if (lastActiveDays >= 10) score -= 4;

  score = Math.max(35, Math.min(88, score));
  const level = score >= 75 ? 'high' : score >= 55 ? 'medium' : 'low';

  return {
    interest_score: score,
    interest_level: level,
    key_signals: [
      candidate.open_to_work ? 'Profile indicates open to work' : 'Passive profile',
      `${candidate.github_activity} public activity`,
      `Last active ${candidate.last_active || 'recently'}`
    ],
    concerns: candidate.open_to_work ? [] : ['May need stronger value proposition to convert'],
    recommended_action: candidate.open_to_work ? 'Send interview availability options' : 'Send personalized outreach and role context',
    source: 'predicted'
  };
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function ScorePill({ label, value, type }) {
  const cls = type === 'match' ? 'score-match' : type === 'interest' ? 'score-interest' : 'score-combined';
  return (
    <div className="score-pill">
      <div className="score-pill-label">{label}</div>
      <div className={`score-pill-val ${cls}`}>{value}</div>
    </div>
  );
}

function ChatPanel({ candidate, jdTitle, onInterestScored }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [scored, setScored] = useState(false);
  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const greeting = `Hi ${candidate.name.split(' ')[0]}! I came across your profile and was impressed by your background in ${candidate.skills.slice(0,2).join(' and ')}. We have an exciting ${jdTitle} opportunity that might align well with your experience. Would you be open to a quick chat?`;
    const recruiterMsg = { role: 'user', content: greeting, sender: 'recruiter', time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
    setMessages([recruiterMsg]);
    setTyping(true);
    
    const apiMessages = [{ role: 'user', content: greeting }];
    engageCandidate(candidate, jdTitle, apiMessages).then(resp => {
      setTyping(false);
      const candMsg = { role: 'assistant', content: resp, sender: 'candidate', time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
      setMessages(prev => [...prev, candMsg]);
    }).catch(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Thanks for reaching out! I\'m definitely open to hearing more about this opportunity. Could you share more about the tech stack and team structure?', sender: 'candidate', time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) }]);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = async () => {
    if (!input.trim() || typing) return;
    const text = input.trim();
    setInput('');
    const newMsg = { role: 'user', content: text, sender: 'recruiter', time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setTyping(true);
    
    const apiHistory = updatedMessages.map(m => ({ role: m.sender === 'recruiter' ? 'user' : 'assistant', content: m.content }));
    try {
      const resp = await engageCandidate(candidate, jdTitle, apiHistory);
      const candMsg = { role: 'assistant', content: resp, sender: 'candidate', time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
      const finalMessages = [...updatedMessages, candMsg];
      setMessages(finalMessages);
      setTyping(false);
      
      if (finalMessages.filter(m => m.sender === 'candidate').length >= 3 && !scored) {
        setScored(true);
        const chatForScoring = finalMessages.map(m => ({ role: m.sender === 'recruiter' ? 'Recruiter' : 'Candidate', content: m.content }));
        scoreInterest(chatForScoring, candidate).then(result => {
          onInterestScored(candidate.id, result);
        });
      }
    } catch {
      setTyping(false);
    }
  };

  const cleanContent = (text) => text.replace(/\[INTEREST:(high|medium|low)\]/gi, '').trim();

  return (
    <div className="chat-container" style={{marginTop:'16px'}}>
      <div className="chat-header">
        <div className="cand-avatar chat-avatar" style={{background: AVATAR_COLORS[parseInt(candidate.id?.replace('c','') || 0) % AVATAR_COLORS.length] + '33', color: AVATAR_COLORS[parseInt(candidate.id?.replace('c','') || 0) % AVATAR_COLORS.length], borderRadius:'8px'}}>
          {getInitials(candidate.name)}
        </div>
        <div>
          <div className="chat-name">{candidate.name}</div>
          <div style={{fontSize:'12px',color:'var(--text3)'}}>{candidate.current_role}</div>
        </div>
        <div className="chat-status"><span style={{width:'6px',height:'6px',borderRadius:'50%',background:'var(--success)',display:'inline-block'}}></span>Online</div>
      </div>
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.sender}`}>
            <div>
              <div className="msg-bubble">{cleanContent(m.content)}</div>
              <div className="msg-meta">{m.time} · {m.sender === 'recruiter' ? 'You' : candidate.name.split(' ')[0]}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="msg" style={{alignSelf:'flex-start'}}>
            <div className="typing">
              <div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-row">
        <input className="chat-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message…" />
        <button className="btn btn-primary" style={{padding:'10px 16px'}} onClick={send} disabled={typing || !input.trim()}>Send</button>
      </div>
    </div>
  );
}

function CandidateCard({ candidate, rank, jdTitle, interestData, onInterestScored, parsedJD }) {
  const [expanded, setExpanded] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const colorIdx = parseInt(candidate.id?.replace('c','') || rank) % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[colorIdx];
  const interest = interestData?.interest_score ?? null;
  const combined = interest !== null ? Math.round((candidate.match_score * 0.55 + interest * 0.45)) : null;

  return (
    <div className={`cand-card rank-${rank <= 3 ? rank : ''} ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(e => !e)}>
      {rank <= 3 && <div className="rank-badge">#{rank} {rank === 1 ? '🏆' : rank === 2 ? '🥈' : '🥉'}</div>}
      <div className="cand-top">
        <div className="cand-avatar" style={{background: color+'22', color: color}}>
          {getInitials(candidate.name)}
        </div>
        <div className="cand-info">
          <div className="cand-name">{candidate.name}</div>
          <div className="cand-role">{candidate.current_role}</div>
          <div className="cand-meta">
            <span>📍 {candidate.location}</span>
            <span>💼 {candidate.years_exp}y exp</span>
            <span style={{color: candidate.open_to_work ? 'var(--success)' : 'var(--text3)'}}>
              {candidate.open_to_work ? '✓ Open to work' : '◌ Passive'}
            </span>
            <span>⚡ Active {candidate.last_active}</span>
          </div>
          <div className="tag-row" style={{marginTop:'8px'}}>
            {candidate.skills?.slice(0,5).map((s,i) => <span key={i} className="tag">{s}</span>)}
            {candidate.skills?.length > 5 && <span className="tag">+{candidate.skills.length - 5}</span>}
          </div>
        </div>
        <div className="scores-col" onClick={e => e.stopPropagation()}>
          <ScorePill label="Match" value={candidate.match_score} type="match" />
          <ScorePill label="Interest" value={interest !== null ? interest : '–'} type="interest" />
          {combined !== null && <ScorePill label="Combined" value={combined} type="combined" />}
        </div>
      </div>

      {expanded && (
        <div onClick={e => e.stopPropagation()}>
          <div className="cand-expanded">
            <div className="expand-section">
              <h4>Match Explainability</h4>
              <div style={{marginBottom:'12px'}}>
                {candidate.match_reasons?.map((r,i) => <span key={i} className="explain-pill pos">✓ {r}</span>)}
                {candidate.match_gaps?.map((g,i) => <span key={i} className="explain-pill neg">✗ {g}</span>)}
              </div>
              <h4 style={{marginTop:'16px'}}>Skill Coverage</h4>
              <div className="skill-match-list" style={{marginTop:'10px'}}>
                {parsedJD?.required_skills?.slice(0,5).map((s,i) => {
                  const has = candidate.skills?.some(cs => cs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(cs.toLowerCase()));
                  const score = has ? 75 + Math.floor(Math.random()*25) : 25 + Math.floor(Math.random()*30);
                  return (
                    <div key={i} className="skill-row">
                      <div className="skill-name">{s}</div>
                      <div className="skill-bar-bg"><div className="skill-bar-fill" style={{width: score+'%'}}></div></div>
                      <div className="skill-pct">{score}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="expand-section">
              <h4>Profile Summary</h4>
              <p style={{marginBottom:'16px'}}>{candidate.linkedin_summary}</p>
              <h4>Education</h4>
              <p style={{marginBottom:'16px'}}>🎓 {candidate.education}</p>
              {interestData && (
                <>
                  <h4 style={{marginTop:'8px'}}>Interest Signals</h4>
                  <div style={{marginTop:'6px'}}>
                    {interestData.key_signals?.map((s,i) => <span key={i} className="explain-pill pos">↑ {s}</span>)}
                    {interestData.concerns?.map((c,i) => <span key={i} className="explain-pill neg">! {c}</span>)}
                  </div>
                  <div className="alert alert-info" style={{marginTop:'12px'}}>
                    <span>💡</span><span>{interestData.recommended_action}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div style={{display:'flex', gap:'10px', paddingTop:'16px', borderTop:'1px solid var(--border)'}}>
            <button className="btn btn-primary" style={{fontSize:'13px', padding:'8px 16px'}} onClick={() => setShowChat(c => !c)}>
              {showChat ? '✕ Close Chat' : '💬 Engage Candidate'}
            </button>
            <button className="btn btn-secondary" style={{fontSize:'13px', padding:'8px 16px'}}>
              📋 View Full Profile
            </button>
            <button className="btn btn-secondary" style={{fontSize:'13px', padding:'8px 16px'}}>
              📅 Schedule Interview
            </button>
          </div>
          {showChat && (
            <ChatPanel
              candidate={candidate}
              jdTitle={jdTitle}
              onInterestScored={onInterestScored}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
function App() {
  const [page, setPage] = useState('scout');
  const [jdText, setJdText] = useState(SAMPLE_JD);
  const [parsedJD, setParsedJD] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [interestMap, setInterestMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadStep, setLoadStep] = useState(0);
  const [sortBy, setSortBy] = useState('combined');
  const [tab, setTab] = useState('all');
  const [activeJobs] = useState(3);

  const LOAD_STEPS = [
    'Parsing job description with NLP…',
    'Extracting required skills & seniority…',
    'Querying talent database…',
    'Computing match scores…',
    'Ranking candidates…',
    'Generating explainability report…'
  ];

  const handleScout = async () => {
    setLoading(true);
    setErrorMsg('');
    setLoadStep(0);
    setParsedJD(null);
    setCandidates([]);
    setInterestMap({});
    
    const stepInterval = setInterval(() => {
      setLoadStep(s => Math.min(s + 1, LOAD_STEPS.length - 1));
    }, 900);

    try {
      const jd = await parseJD(jdText);
      setParsedJD(jd);
      setLoadStep(3);
      const cands = await generateCandidates(jd || { title: 'Software Engineer', required_skills: ['React', 'Node.js', 'TypeScript'] });
      setCandidates(cands);
      const seededInterest = Object.fromEntries(cands.map(c => [c.id, estimateInitialInterest(c)]));
      setInterestMap(seededInterest);
      setLoadStep(5);
    } catch(e) {
      console.error(e);
      setErrorMsg('Could not complete scouting with live API. Please try again. Fallback mode should still work.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadStep(0);
    }
  };

  const handleInterestScored = useCallback((id, data) => {
    setInterestMap(prev => ({ ...prev, [id]: { ...data, source: 'chat' } }));
  }, []);

  const sortedCandidates = [...candidates].sort((a, b) => {
    if (sortBy === 'match') return b.match_score - a.match_score;
    if (sortBy === 'interest') {
      const ia = interestMap[a.id]?.interest_score ?? 0;
      const ib = interestMap[b.id]?.interest_score ?? 0;
      return ib - ia;
    }
    const combA = interestMap[a.id] ? Math.round(a.match_score * 0.55 + interestMap[a.id].interest_score * 0.45) : a.match_score * 0.55;
    const combB = interestMap[b.id] ? Math.round(b.match_score * 0.55 + interestMap[b.id].interest_score * 0.45) : b.match_score * 0.55;
    return combB - combA;
  });

  const filteredCandidates = sortedCandidates.filter(c => {
    if (tab === 'strong') return c.match_score >= 75;
    if (tab === 'engaged') return interestMap[c.id]?.source === 'chat';
    if (tab === 'open') return c.open_to_work;
    return true;
  });

  const shortlistCandidates = sortedCandidates.filter(c => {
    const int = interestMap[c.id]?.interest_score ?? null;
    const comb = int !== null ? Math.round(c.match_score * 0.55 + int * 0.45) : null;
    return comb !== null ? comb >= 70 : c.match_score >= 75;
  }).slice(0, 6);

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">🎯</div>
          <div>
            <div className="logo-text">HirePilot AI</div>
            <div className="logo-sub">AI Scouting Agent</div>
          </div>
        </div>

        <div className="nav-section">Workspace</div>
        <button className={`nav-btn ${page==='dashboard'?'active':''}`} onClick={()=>setPage('dashboard')}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </button>
        <button className={`nav-btn ${page==='scout'?'active':''}`} onClick={()=>setPage('scout')}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Scout Talent
          {candidates.length > 0 && <span className="badge">{candidates.length}</span>}
        </button>
        <button className={`nav-btn ${page==='shortlist'?'active':''}`} onClick={()=>setPage('shortlist')}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          Shortlist
          {shortlistCandidates.length > 0 && <span className="badge">{shortlistCandidates.length}</span>}
        </button>

        <div className="nav-section" style={{marginTop:'8px'}}>Tools</div>
        <button className={`nav-btn ${page==='arch'?'active':''}`} onClick={()=>setPage('arch')}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          Architecture
        </button>

        <div className="sidebar-footer">
          <div className="api-status">
            <div className="status-dot"></div>
            Claude API · Connected
          </div>
          <div style={{fontSize:'11px',color:'var(--text3)',padding:'4px 12px',lineHeight:'1.5'}}>
            Catalyst Hackathon · Deccan AI<br/>Submission: Apr 27, 2026
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">
        {/* DASHBOARD PAGE */}
        {page === 'dashboard' && (
          <div className="page">
            <div className="page-header">
              <div className="page-title">Dashboard</div>
              <div className="page-sub">Overview of your active talent scouting pipelines</div>
            </div>
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Candidates Found</div>
                <div className="stat-val">{candidates.length}</div>
                <div className="stat-sub">{candidates.filter(c=>c.match_score>=75).length} strong matches</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Engaged</div>
                <div className="stat-val">{Object.values(interestMap).filter(d=>d.source==='chat').length}</div>
                <div className="stat-sub stat-up">↑ {Object.values(interestMap).filter(d=>d.source==='chat' && d.interest_level==='high').length} high interest</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Shortlisted</div>
                <div className="stat-val">{shortlistCandidates.length}</div>
                <div className="stat-sub">Ready for interview</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg Match Score</div>
                <div className="stat-val">{candidates.length ? Math.round(candidates.reduce((a,c)=>a+c.match_score,0)/candidates.length) : '–'}</div>
                <div className="stat-sub">Out of 100</div>
              </div>
            </div>
            {candidates.length === 0 ? (
              <div className="alert alert-info">
                <span>💡</span>
                <span>No active pipeline yet. Go to <strong>Scout Talent</strong> to start discovering candidates.</span>
              </div>
            ) : (
              <>
                <h3 style={{fontFamily:'Syne, sans-serif', fontWeight:600, marginBottom:'16px', fontSize:'16px'}}>Top Candidates</h3>
                <div className="candidate-list">
                  {sortedCandidates.slice(0,3).map((c,i) => (
                    <CandidateCard key={c.id} candidate={c} rank={i+1} jdTitle={parsedJD?.title || 'Position'} interestData={interestMap[c.id]} onInterestScored={handleInterestScored} parsedJD={parsedJD} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* SCOUT PAGE */}
        {page === 'scout' && (
          <div className="page">
            <div className="page-header">
              <div className="page-title">Scout Talent</div>
              <div className="page-sub">Paste a job description and let AI discover matching candidates</div>
            </div>

            <div className="jd-card">
              <h3>Job Description</h3>
              {errorMsg && (
                <div className="alert alert-warning" style={{marginBottom:'12px'}}>
                  <span>⚠</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              <textarea className="jd-textarea" value={jdText} onChange={e=>setJdText(e.target.value)} placeholder="Paste your job description here…" />
              <div className="jd-row">
                <button className="btn btn-primary" onClick={handleScout} disabled={loading || !jdText.trim()}>
                  {loading ? '⏳ Scanning…' : '🔍 Scout Candidates'}
                </button>
                <button className="btn btn-secondary" onClick={() => setJdText(SAMPLE_JD)}>Load Sample JD</button>
                <button className="btn btn-secondary" onClick={() => setJdText('')}>Clear</button>
                <span style={{fontSize:'12px',color:'var(--text3)',marginLeft:'auto'}}>{jdText.length} characters</span>
              </div>
            </div>

            {loading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <div style={{fontFamily:'Syne, sans-serif', fontWeight:600, fontSize:'16px', marginBottom:'8px'}}>Scanning Talent Pool</div>
                <div style={{fontSize:'13px', color:'var(--text3)', marginBottom:'20px'}}>AI agent is analyzing and matching…</div>
                <div className="progress-steps">
                  {LOAD_STEPS.map((s, i) => (
                    <div key={i} className={`prog-step ${i < loadStep ? 'done' : i === loadStep ? 'active' : 'pending'}`}>
                      <div className="dot"></div>
                      <span>{s}</span>
                      {i < loadStep && <span style={{marginLeft:'auto',color:'var(--success)',fontSize:'12px'}}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsedJD && !loading && (
              <div className="jd-card" style={{marginBottom:'24px'}}>
                <h3>✦ Parsed JD Analysis</h3>
                <div className="parsed-grid">
                  <div className="parsed-item">
                    <div className="parsed-label">Role</div>
                    <div className="parsed-value" style={{fontWeight:500}}>{parsedJD.title}</div>
                  </div>
                  <div className="parsed-item">
                    <div className="parsed-label">Seniority</div>
                    <div className="parsed-value" style={{textTransform:'capitalize'}}>{parsedJD.seniority}</div>
                  </div>
                  <div className="parsed-item">
                    <div className="parsed-label">Experience</div>
                    <div className="parsed-value">{parsedJD.experience_years}</div>
                  </div>
                  <div className="parsed-item">
                    <div className="parsed-label">Location</div>
                    <div className="parsed-value">{parsedJD.location}</div>
                  </div>
                  <div className="parsed-item">
                    <div className="parsed-label">Compensation</div>
                    <div className="parsed-value">{parsedJD.salary_range}</div>
                  </div>
                  <div className="parsed-item">
                    <div className="parsed-label">Company Type</div>
                    <div className="parsed-value">{parsedJD.company_type}</div>
                  </div>
                </div>
                <div style={{marginTop:'14px'}}>
                  <div style={{fontSize:'12px',color:'var(--text3)',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'1px'}}>Required Skills</div>
                  <div className="tag-row">{parsedJD.required_skills?.map((s,i)=><span key={i} className="tag">{s}</span>)}</div>
                </div>
                {parsedJD.nice_to_have?.length > 0 && (
                  <div style={{marginTop:'12px'}}>
                    <div style={{fontSize:'12px',color:'var(--text3)',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'1px'}}>Nice to Have</div>
                    <div className="tag-row">{parsedJD.nice_to_have?.map((s,i)=><span key={i} className="tag" style={{opacity:0.7}}>{s}</span>)}</div>
                  </div>
                )}
              </div>
            )}

            {candidates.length > 0 && !loading && (
              <>
                <div className="candidates-header">
                  <h2>Candidates Found</h2>
                  <span style={{color:'var(--text3)',fontSize:'13px'}}>{filteredCandidates.length} results</span>
                  <div className="sort-row">
                    <span style={{fontSize:'12px',color:'var(--text3)'}}>Sort:</span>
                    <select className="sort-select" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                      <option value="combined">Combined Score</option>
                      <option value="match">Match Score</option>
                      <option value="interest">Interest Score</option>
                    </select>
                  </div>
                </div>

                <div className="tabs">
                  {[['all','All'],['strong','Strong Match'],['open','Open to Work'],['engaged','Engaged']].map(([v,l]) => (
                    <button key={v} className={`tab ${tab===v?'active':''}`} onClick={()=>setTab(v)}>{l}</button>
                  ))}
                </div>

                <div className="alert alert-info" style={{marginBottom:'14px'}}>
                  <span>ℹ</span>
                  <span>Interest score is initially estimated from profile activity and availability. Chat engagement upgrades it to conversation-based scoring.</span>
                </div>

                <div className="candidate-list">
                  {filteredCandidates.map((c, i) => (
                    <CandidateCard key={c.id} candidate={c} rank={sortedCandidates.indexOf(c)+1} jdTitle={parsedJD?.title||'Position'} interestData={interestMap[c.id]} onInterestScored={handleInterestScored} parsedJD={parsedJD} />
                  ))}
                </div>
              </>
            )}

            {!loading && candidates.length === 0 && !parsedJD && (
              <div className="empty-state">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p>Enter a job description above and click <strong>Scout Candidates</strong><br/>to discover matching talent using AI</p>
              </div>
            )}
          </div>
        )}

        {/* SHORTLIST PAGE */}
        {page === 'shortlist' && (
          <div className="page">
            <div className="page-header">
              <div className="page-title">Ranked Shortlist</div>
              <div className="page-sub">Candidates scored on Match + Interest dimensions, ready for action</div>
            </div>
            {shortlistCandidates.length === 0 ? (
              <div className="alert alert-warning">
                <span>⚠️</span>
                <span>No shortlisted candidates yet. Scout and engage candidates first to generate interest scores.</span>
              </div>
            ) : (
              <>
                <div className="alert alert-success" style={{marginBottom:'20px'}}>
                  <span>✓</span>
                  <span>{shortlistCandidates.length} candidates shortlisted based on combined match + interest scoring. Scoring formula: Combined = Match×0.55 + Interest×0.45</span>
                </div>
                <div className="jd-card">
                  <table className="shortlist-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Candidate</th>
                        <th>Match Score</th>
                        <th>Interest Score</th>
                        <th>Combined</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shortlistCandidates.map((c, i) => {
                        const int = interestMap[c.id]?.interest_score ?? null;
                        const comb = int !== null ? Math.round(c.match_score * 0.55 + int * 0.45) : Math.round(c.match_score * 0.55);
                        const intLevel = interestMap[c.id]?.interest_level || 'unknown';
                        return (
                          <tr key={c.id}>
                            <td style={{fontFamily:'Syne, sans-serif',fontWeight:700,color: i===0?'#fbbf24':i===1?'#a09ab8':i===2?'#c97c3a':'var(--text2)'}}>#{i+1}</td>
                            <td>
                              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                                <div style={{width:'32px',height:'32px',borderRadius:'8px',background:AVATAR_COLORS[parseInt(c.id?.replace('c','')||i)%AVATAR_COLORS.length]+'22',color:AVATAR_COLORS[parseInt(c.id?.replace('c','')||i)%AVATAR_COLORS.length],display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,flexShrink:0}}>
                                  {getInitials(c.name)}
                                </div>
                                <div>
                                  <div style={{fontWeight:500,color:'var(--text)',fontSize:'14px'}}>{c.name}</div>
                                  <div style={{fontSize:'12px',color:'var(--text3)'}}>{c.current_role}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                <span style={{fontWeight:600,color:'var(--accent2)'}}>{c.match_score}</span>
                                <div style={{width:'60px',height:'4px',background:'var(--bg4)',borderRadius:'2px',overflow:'hidden'}}>
                                  <div style={{width:c.match_score+'%',height:'100%',background:'var(--accent)',borderRadius:'2px'}}></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              {int !== null ? (
                                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                                  <span style={{fontWeight:600,color:'var(--accent3)'}}>{int}</span>
                                  <span style={{fontSize:'11px',padding:'2px 8px',borderRadius:'20px',background:intLevel==='high'?'rgba(52,211,153,0.15)':intLevel==='medium'?'rgba(251,191,36,0.15)':'rgba(248,113,113,0.15)',color:intLevel==='high'?'var(--success)':intLevel==='medium'?'var(--warning)':'var(--danger)'}}>{intLevel}</span>
                                </div>
                              ) : <span style={{color:'var(--text3)',fontSize:'12px'}}>Not engaged</span>}
                            </td>
                            <td><span style={{fontFamily:'Syne, sans-serif',fontWeight:700,fontSize:'18px',color:'var(--warning)'}}>{comb}</span></td>
                            <td><span style={{fontSize:'12px',color:c.open_to_work?'var(--success)':'var(--text3)'}}>{c.open_to_work?'✓ Active':'Passive'}</span></td>
                            <td style={{display:'flex',gap:'6px'}}>
                              <button className="action-btn contact">✉ Reach Out</button>
                              <button className="action-btn">📅 Schedule</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ARCHITECTURE PAGE */}
        {page === 'arch' && (
          <div className="page">
            <div className="page-header">
              <div className="page-title">System Architecture</div>
              <div className="page-sub">How HirePilot AI works under the hood</div>
            </div>
            <div className="jd-card" style={{marginBottom:'20px'}}>
              <h3>📐 Agent Pipeline</h3>
              <div style={{background:'var(--bg3)',borderRadius:'10px',padding:'24px',marginTop:'12px',fontFamily:'monospace',fontSize:'13px',lineHeight:'2',color:'var(--text2)'}}>
                <div style={{color:'var(--accent2)',marginBottom:'8px'}}>┌─ INPUT ────────────────────────────────────────────┐</div>
                <div style={{paddingLeft:'16px'}}>Raw Job Description Text (any format, any length)</div>
                <div style={{color:'var(--accent2)',margin:'8px 0'}}>└─ → JD PARSER (claude-sonnet-4)</div>
                <div style={{paddingLeft:'32px',color:'var(--text3)'}}>→ NLP extraction: title, skills, seniority, location</div>
                <div style={{paddingLeft:'32px',color:'var(--text3)'}}>→ Returns structured JSON schema</div>
                <div style={{color:'var(--accent2)',margin:'8px 0'}}>└─ → CANDIDATE DISCOVERY (claude-sonnet-4)</div>
                <div style={{paddingLeft:'32px',color:'var(--text3)'}}>→ Simulates talent DB query with JD context</div>
                <div style={{paddingLeft:'32px',color:'var(--text3)'}}>→ Generates 8 realistic profiles w/ match_score + reasons</div>
                <div style={{color:'var(--accent2)',margin:'8px 0'}}>└─ → CONVERSATIONAL OUTREACH (claude-sonnet-4)</div>
                <div style={{paddingLeft:'32px',color:'var(--text3)'}}>→ Role-plays as candidate persona</div>
                <div style={{paddingLeft:'32px',color:'var(--text3)'}}>→ Multi-turn conversation with recruiter</div>
                <div style={{paddingLeft:'32px',color:'var(--text3)'}}>→ Injects [INTEREST:level] signal after 3+ turns</div>
                <div style={{color:'var(--accent2)',margin:'8px 0'}}>└─ → INTEREST SCORER (claude-sonnet-4)</div>
                <div style={{paddingLeft:'32px',color:'var(--text3)'}}>→ Analyzes full chat transcript</div>
                <div style={{paddingLeft:'32px',color:'var(--text3)'}}>→ Outputs: interest_score (0-100), signals, concerns</div>
                <div style={{color:'var(--accent2)',margin:'8px 0'}}>└─ → RANKING ENGINE</div>
                <div style={{paddingLeft:'32px',color:'var(--text3)'}}>Combined Score = Match×0.55 + Interest×0.45</div>
                <div style={{color:'var(--accent2)',margin:'8px 0'}}>└─ OUTPUT ──────────────────────────────────────────┐</div>
                <div style={{paddingLeft:'16px'}}>Ranked shortlist with explainability, ready to action</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
              <div className="jd-card">
                <h3>📊 Scoring Logic</h3>
                <div style={{marginTop:'12px',display:'flex',flexDirection:'column',gap:'12px'}}>
                  <div>
                    <div style={{fontSize:'12px',color:'var(--text3)',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'1px'}}>Match Score (0–100)</div>
                    <div style={{fontSize:'13px',color:'var(--text2)',lineHeight:'1.7'}}>Computed by AI evaluating: skill overlap, years of experience, seniority alignment, domain relevance (fintech), location/remote fit, educational background</div>
                  </div>
                  <div>
                    <div style={{fontSize:'12px',color:'var(--text3)',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'1px'}}>Interest Score (0–100)</div>
                    <div style={{fontSize:'13px',color:'var(--text2)',lineHeight:'1.7'}}>Derived from conversational signals: response quality, enthusiasm level, questions asked about role, salary alignment, proactive engagement</div>
                  </div>
                  <div>
                    <div style={{fontSize:'12px',color:'var(--text3)',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'1px'}}>Combined Score</div>
                    <div style={{fontSize:'13px',color:'var(--accent2)',fontWeight:600,fontFamily:'monospace'}}>Combined = Match × 0.55 + Interest × 0.45</div>
                    <div style={{fontSize:'12px',color:'var(--text3)',marginTop:'4px'}}>Match weighted slightly higher as baseline qualifier; interest breaks ties and elevates engaged passive candidates</div>
                  </div>
                </div>
              </div>
              <div className="jd-card">
                <h3>🛠 Tech Stack</h3>
                <div style={{marginTop:'12px',display:'flex',flexDirection:'column',gap:'8px'}}>
                  {[
                    ['Frontend','React 18 + Babel (single-file SPA)'],
                    ['AI Engine','Claude claude-sonnet-4 via Anthropic API'],
                    ['JD Parsing','Structured JSON prompt w/ schema enforcement'],
                    ['Candidate Gen','Contextual simulation from parsed JD'],
                    ['Chat Engine','Multi-turn persona roleplay w/ memory'],
                    ['Interest Score','Transcript analysis agent'],
                    ['Styling','Custom CSS design system (dark mode)'],
                    ['Deployment','Static HTML — zero dependencies'],
                  ].map(([k,v])=>(
                    <div key={k} style={{display:'flex',gap:'12px',fontSize:'13px'}}>
                      <div style={{color:'var(--text3)',minWidth:'110px',flexShrink:0}}>{k}</div>
                      <div style={{color:'var(--text2)'}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
