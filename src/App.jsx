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

// --- ปรับแต่ง CSS ให้ใช้ Google Font 'Inter' ทั้งหมด ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
    
    :root {
      color-scheme: dark;
    }

    /* บังคับใช้ Inter ในทุกองค์ประกอบ */
    * {
      font-family: 'Inter', sans-serif !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      margin: 0;
      background-color: #030712 !important;
      color: #f8fafc !important;
      overflow-x: hidden;
    }

    .glass-card {
      background: rgba(15, 23, 42, 0.6) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
    }

    /* Grid Layout */
    @media (min-width: 1024px) {
      .original-grid {
        display: grid !important;
        grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
        gap: 2rem !important;
      }
      .col-left { grid-column: span 4 / span 4 !important; }
      .col-right { grid-column: span 8 / span 8 !important; }
    }

    /* ตัวเลข Total แบบ Ultra Massive (ตัวตรง) */
    .total-amount-display {
      font-weight: 900;
      font-style: normal;
      line-height: 0.8;
      letter-spacing: -0.05em;
      filter: drop-shadow(0 15px 30px rgba(0,0,0,0.6));
      background: linear-gradient(to bottom, #ffffff 40%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: block;
    }

    /* สไตล์ช่องกรอกข้อมูล */
    .premium-input-wrapper {
      position: relative;
    }

    .premium-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.4) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 1.25rem !important;
      padding: 1.125rem 1.5rem !important;
      color: #fff !important;
      font-size: 1rem !important;
      font-weight: 700 !important;
      outline: none !important;
      transition: all 0.2s ease !important;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3) !important;
    }

    .premium-input:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.3) !important;
    }

    .input-unit-badge {
      position: absolute;
      right: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.05);
      padding: 0.25rem 0.75rem;
      border-radius: 0.75rem;
      font-size: 0.7rem;
      font-weight: 800;
      color: #64748b;
      pointer-events: none;
      text-transform: uppercase;
    }

    /* Slider styling */
    input[type="range"] {
      appearance: none;
      height: 6px;
      background: #1e293b;
      border-radius: 999px;
    }

    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border-radius: 50%;
      cursor: pointer;
      border: 3px solid #030712;
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
    }
  `}</style>
);

const App = () => {
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

  const handleReset = () => {
    setInputs({ initialCost: 0, powerRating: 0, operatingHours: 0, electricityCost: 0, maintenanceCost: 0, lifecycle: 1 });
  };

  const formatCurr = (v) => new Intl.NumberFormat('th-TH', { 
    style: 'currency', 
    currency: 'THB', 
    maximumFractionDigits: 0 
  }).format(v || 0);

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen relative overflow-x-hidden bg-[#030712]">
        
        {/* Background Decorative */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[600px] h-[600px] bg-indigo-600/5 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-10 relative z-10">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-center glass-card p-6 rounded-[2.5rem] mb-10 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Factory className="text-white w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-white uppercase leading-none">
                  PUMP TCO <span className="text-blue-500">MASTER</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-1">Industrial Intelligence Tool</p>
              </div>
            </div>
            
            <button 
              onClick={handleReset}
              className="mt-5 md:mt-0 flex items-center gap-2 px-8 py-4 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-2xl text-[11px] font-extrabold transition-all border border-red-500/20 active:scale-95 shadow-xl uppercase tracking-widest"
            >
              <RotateCcw size={16} /> Reset All Data
            </button>
          </header>

          <div className="original-grid space-y-8 md:space-y-0">
            
            {/* Input Panel (Left) */}
            <div className="col-left space-y-6">
              <div className="glass-card rounded-[3rem] p-8 md:p-10 shadow-2xl border border-white/5 h-full">
                <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-5">
                  <LayoutDashboard size={18} className="text-blue-400" />
                  <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Parameter Setup</h2>
                </div>

                <div className="space-y-8">
                  <InputBox label="ราคาจัดซื้อปั๊ม (CapEx)" name="initialCost" value={inputs.initialCost} onChange={handleInputChange} unit="บาท" />
                  
                  <div className="grid grid-cols-2 gap-5">
                    <InputBox label="มอเตอร์ (kW)" name="powerRating" value={inputs.powerRating} onChange={handleInputChange} unit="kW" />
                    <InputBox label="รัน (ชม./ปี)" name="operatingHours" value={inputs.operatingHours} onChange={handleInputChange} unit="Hr" />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <InputBox label="ค่าไฟ (฿/Unit)" name="electricityCost" value={inputs.electricityCost} onChange={handleInputChange} unit="฿/u" />
                    <InputBox label="บำรุงรักษา/ปี" name="maintenanceCost" value={inputs.maintenanceCost} onChange={handleInputChange} unit="บาท" />
                  </div>

                  <div className="bg-gradient-to-br from-black/60 to-black/30 p-8 rounded-[2rem] border border-white/5 mt-6 shadow-inner">
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">อายุโครงการ</span>
                      <span className="text-blue-400 font-black text-2xl">{inputs.lifecycle} <span className="text-xs text-slate-600 font-bold">ปี</span></span>
                    </div>
                    <input 
                      type="range" name="lifecycle" min="1" max="25" 
                      value={inputs.lifecycle} onChange={handleInputChange} 
                      className="w-full" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Display Panel (Right) */}
            <div className="col-right space-y-8">
              
              {/* Main Total Card - ULTRA MASSIVE FONT */}
              <div className="bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950 rounded-[3.5rem] p-12 md:p-20 text-white shadow-3xl relative overflow-hidden group border border-white/10">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-[4.5] pointer-events-none transition-transform duration-1000">
                  <Calculator size={140} />
                </div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-10">
                    <Activity size={12} className="text-blue-400" /> Life Cycle Total Cost
                  </div>
                  
                  {/* ขนาดตัวเลขใหญ่พิเศษ แบบตัวตรง ฟอนต์ Inter */}
                  <div className="mb-14">
                    <h2 className="total-amount-display text-[clamp(4.5rem,13vw,10rem)]">
                      {formatCurr(results.totalTCO)}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 pt-12 border-t border-white/10">
                    <DisplayItem label="ค่าพลังงานสะสม" value={formatCurr(results.totalEnergyCost)} />
                    <DisplayItem label="บำรุงรักษาสะสม" value={formatCurr(results.totalMaintenanceCost)} />
                    <DisplayItem label="เฉลี่ยต้นทุน/ปี" value={formatCurr(results.averageYearlyCost)} highlight />
                  </div>
                </div>
              </div>

              {/* Analytics Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card rounded-[3rem] p-10 shadow-xl border border-white/5">
                  <h3 className="text-[10px] font-black text-slate-500 mb-10 uppercase tracking-[0.2em] flex items-center gap-2">
                    <PieChartIcon size={16} className="text-blue-500" /> Cost Distribution
                  </h3>
                  <div className="space-y-9">
                    <BarProgress label="ต้นทุนการจัดซื้อ (CapEx)" p={results.percentages.initial} color="#475569" />
                    <BarProgress label="ค่าพลังงานสะสม (OpEx)" p={results.percentages.energy} color="#3b82f6" />
                    <BarProgress label="ค่าซ่อมบำรุง (Maintenance)" p={results.percentages.maintenance} color="#10b981" />
                  </div>
                </div>

                <div className="bg-blue-600/5 border border-blue-500/10 rounded-[3rem] p-10 flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute top-8 right-8 text-blue-500/10 scale-150 group-hover:scale-[1.8] transition-transform duration-700">
                    <Info size={40} />
                  </div>
                  <h4 className="text-xl font-extrabold text-white mb-4 tracking-tight uppercase">Technical Verdict</h4>
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
    </>
  );
};

// --- Custom Components ---

const InputBox = ({ label, name, value, onChange, unit }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] block ml-1">{label}</label>
    <div className="premium-input-wrapper group">
      <input 
        type="text" name={name} 
        value={value === 0 ? '' : new Intl.NumberFormat().format(value)} 
        placeholder="0"
        onChange={onChange} inputMode="decimal"
        className="premium-input"
      />
      <div className="input-unit-badge">
        {unit}
      </div>
    </div>
  </div>
);

const DisplayItem = ({ label, value, highlight }) => (
  <div className="min-w-0">
    <p className="text-[10px] text-blue-200/40 uppercase font-black tracking-[0.2em] mb-3">{label}</p>
    <p className={`text-xl md:text-2xl font-black truncate ${highlight ? 'text-emerald-400' : 'text-white'}`}>
      {value}
    </p>
  </div>
);

const BarProgress = ({ label, p, color }) => (
  <div className="space-y-3">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
      <span className="text-slate-500">{label}</span>
      <span className="text-white font-mono font-bold">{p.toFixed(1)}%</span>
    </div>
    <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 p-[1.5px]">
      <div 
        style={{ width: `${p}%`, backgroundColor: color }} 
        className={`h-full rounded-full transition-all duration-1000`} 
      />
    </div>
  </div>
);

export default App;