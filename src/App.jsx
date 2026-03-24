import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Factory, 
  RotateCcw, 
  Zap, 
  LayoutDashboard, 
  Info, 
  ArrowRight,
  Calculator,
  Activity
} from 'lucide-react';

// --- STYLES BLOCK (บังคับ Theme ให้คงที่และสวยงาม) ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
    
    :root {
      color-scheme: dark;
    }

    body {
      margin: 0;
      font-family: 'Inter', -apple-system, sans-serif;
      background-color: #030712 !important; /* บังคับพื้นหลังมืด */
      color: #f8fafc !important;
      overflow-x: hidden;
    }

    .glass-card {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      z-index: 10;
    }

    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
      border: 2px solid white;
    }

    .text-gradient {
      background: linear-gradient(to bottom right, #ffffff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    @keyframes pulse-slow {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 0.4; }
    }
    
    .animate-pulse-slow {
      animation: pulse-slow 8s infinite;
    }

    /* ตรวจสอบว่าปุ่มอยู่บนสุดเสมอ */
    .btn-reset {
      cursor: pointer !important;
      position: relative;
      z-index: 100 !important;
      touch-action: manipulation;
    }
  `}</style>
);

const App = () => {
  // ค่าเริ่มต้นสำหรับ Reset
  const zeroValues = {
    initialCost: 0,
    powerRating: 0,
    operatingHours: 0,
    electricityCost: 0,
    maintenanceCost: 0,
    lifecycle: 1
  };

  const [inputs, setInputs] = useState({
    initialCost: 150000,
    powerRating: 22,
    operatingHours: 6000,
    electricityCost: 4.50,
    maintenanceCost: 15000,
    lifecycle: 10
  });

  const results = useMemo(() => {
    const pwr = parseFloat(inputs.powerRating) || 0;
    const hrs = parseFloat(inputs.operatingHours) || 0;
    const cost = parseFloat(inputs.electricityCost) || 0;
    const life = Math.max(parseFloat(inputs.lifecycle) || 1, 1);
    const init = parseFloat(inputs.initialCost) || 0;
    const maint = parseFloat(inputs.maintenanceCost) || 0;

    const annualEnergy = pwr * hrs * cost;
    const totalEnergy = annualEnergy * life;
    const totalMaint = maint * life;
    const totalTCO = init + totalEnergy + totalMaint;

    return {
      totalEnergyCost: totalEnergy,
      totalMaintenanceCost: totalMaint,
      totalTCO,
      averageYearlyCost: totalTCO / life,
      percentages: {
        initial: (init / (totalTCO || 1)) * 100,
        energy: (totalEnergy / (totalTCO || 1)) * 100,
        maintenance: (totalMaint / (totalTCO || 1)) * 100
      }
    };
  }, [inputs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = value.replace(/,/g, '');
    if (cleanValue !== '' && !/^\d*\.?\d*$/.test(cleanValue)) return;
    setInputs(prev => ({ ...prev, [name]: cleanValue === '' ? 0 : Number(cleanValue) }));
  };

  // ปรับปรุงฟังก์ชัน Reset ให้ทำงานทันทีโดยไม่ต้องรอ Confirm (เพื่อลดปัญหาบน Browser บางตัว)
  const handleReset = () => {
    setInputs(zeroValues);
  };

  const formatCurr = (v) => new Intl.NumberFormat('th-TH', { 
    style: 'currency', 
    currency: 'THB', 
    maximumFractionDigits: 0 
  }).format(v || 0);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 selection:bg-blue-500/30">
      <GlobalStyles />
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-10 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center glass-card p-6 rounded-[2.5rem] mb-10 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Factory className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">
                PUMP TCO <span className="text-blue-500">MASTER</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">Engineering Grade Analysis</p>
            </div>
          </div>
          
          <button 
            onClick={handleReset}
            className="btn-reset mt-5 md:mt-0 flex items-center gap-2 px-8 py-3.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-2xl text-xs font-black transition-all border border-red-500/20 active:scale-95 shadow-xl uppercase tracking-widest"
          >
            <RotateCcw size={16} /> Reset to Zero
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Input Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-[3rem] p-8 md:p-10 shadow-2xl">
              <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-5">
                <LayoutDashboard size={18} className="text-blue-400" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-gradient">Data Input</h2>
              </div>

              <div className="space-y-7">
                <InputBox label="ราคาจัดซื้อปั๊ม (CapEx)" name="initialCost" value={inputs.initialCost} onChange={handleInputChange} unit="฿" />
                <div className="grid grid-cols-2 gap-5">
                  <InputBox label="มอเตอร์ (kW)" name="powerRating" value={inputs.powerRating} onChange={handleInputChange} unit="kW" />
                  <InputBox label="รัน (ชม./ปี)" name="operatingHours" value={inputs.operatingHours} onChange={handleInputChange} unit="Hr" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <InputBox label="ค่าไฟ (฿/Unit)" name="electricityCost" value={inputs.electricityCost} onChange={handleInputChange} unit="฿" />
                  <InputBox label="บำรุงรักษา/ปี" name="maintenanceCost" value={inputs.maintenanceCost} onChange={handleInputChange} unit="฿" />
                </div>

                <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ระยะเวลาโครงการ</span>
                    <span className="text-blue-400 font-black text-xl">{inputs.lifecycle} ปี</span>
                  </div>
                  <input 
                    type="range" name="lifecycle" min="1" max="25" 
                    value={inputs.lifecycle} onChange={handleInputChange} 
                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Display Panel */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950 rounded-[3.5rem] p-10 md:p-16 text-white shadow-3xl relative overflow-hidden group border border-white/10">
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-[2.5] -rotate-12 pointer-events-none transition-transform duration-1000 group-hover:rotate-0">
                <Calculator size={140} />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-blue-200 mb-10">
                  <Zap size={12} className="fill-blue-400" /> Total Life Cycle Cost
                </div>
                <h2 className="text-[clamp(2.5rem,8vw,5.5rem)] font-black tracking-tighter leading-none mb-6 drop-shadow-2xl">
                  {formatCurr(results.totalTCO)}
                </h2>
                <div className="h-2.5 w-32 bg-blue-500 rounded-full mb-16 shadow-[0_0_30px_rgba(59,130,246,0.6)]" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pt-10 border-t border-white/10">
                  <DisplayItem label="ค่าพลังงานสะสม" value={formatCurr(results.totalEnergyCost)} />
                  <DisplayItem label="บำรุงรักษาสะสม" value={formatCurr(results.totalMaintenanceCost)} />
                  <DisplayItem label="เฉลี่ยต้นทุน/ปี" value={formatCurr(results.averageYearlyCost)} highlight />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card rounded-[3rem] p-10 shadow-xl">
                <h3 className="text-[10px] font-black text-slate-500 mb-10 uppercase tracking-[0.2em] flex items-center gap-2">
                  <PieChartIcon size={16} className="text-blue-500" /> Cost Distribution
                </h3>
                <div className="space-y-9">
                  <BarProgress label="ต้นทุนการจัดซื้อ (CapEx)" p={results.percentages.initial} color="#475569" />
                  <BarProgress label="ค่าพลังงานสะสม (OpEx)" p={results.percentages.energy} color="#3b82f6" />
                  <BarProgress label="ค่าซ่อมบำรุง (Maintenance)" p={results.percentages.maintenance} color="#10b981" />
                </div>
              </div>

              <div className="bg-blue-600/5 border border-blue-500/10 rounded-[3rem] p-10 flex flex-col justify-center">
                <h4 className="text-xl font-black text-white mb-4 italic tracking-tight uppercase">Technical Verdict</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  {results.totalTCO === 0 ? "กรุณากรอกข้อมูลเพื่อเริ่มการวิเคราะห์เชิงลึก..." :
                   results.percentages.energy > 80 
                    ? "ค่าไฟสูงถึง 80%+ ของต้นทุนทั้งหมด! การเลือกปั๊มรุ่น Premium Efficiency แม้ราคาจะสูงกว่าเดิม แต่จะคืนทุน (Payback) ได้รวดเร็วอย่างแน่นอน" 
                    : "โครงสร้างต้นทุนมีความสมดุล แนะนำให้พิจารณาแผนการดูแลรักษาเชิงป้องกัน (PM) เพื่อลดความเสี่ยงที่ปั๊มจะหยุดทำงานนอกแผน"}
                </p>
                <div className="mt-10 flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] border-t border-blue-500/10 pt-6">
                  Engineering Insights <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputBox = ({ label, name, value, onChange, unit }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">{label}</label>
    <div className="relative group">
      <input 
        type="text" name={name} 
        value={value === 0 ? '' : new Intl.NumberFormat().format(value)} 
        placeholder="0"
        onChange={onChange} inputMode="decimal"
        className="w-full bg-black/50 border border-slate-800 rounded-2xl py-4.5 px-6 text-base font-bold text-white focus:border-blue-500/60 outline-none transition-all pr-14 hover:border-slate-700"
      />
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-600 uppercase tracking-tighter pointer-events-none group-focus-within:text-blue-400">
        {unit}
      </div>
    </div>
  </div>
);

const DisplayItem = ({ label, value, highlight }) => (
  <div className="min-w-0">
    <p className="text-[9px] text-blue-200/40 uppercase font-black tracking-[0.2em] mb-3">{label}</p>
    <p className={`text-xl md:text-2xl font-black truncate ${highlight ? 'text-emerald-400' : 'text-white'}`}>
      {value}
    </p>
  </div>
);

const BarProgress = ({ label, p, color }) => (
  <div className="space-y-3">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
      <span className="text-slate-500">{label}</span>
      <span className="text-white font-mono">{p.toFixed(1)}%</span>
    </div>
    <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 p-[1.5px]">
      <div 
        style={{ width: `${p}%`, backgroundColor: color }} 
        className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.15)]`} 
      />
    </div>
  </div>
);

export default App;