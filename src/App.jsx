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

const App = () => {
  // Initial state with empty strings or default values for smooth typing
  const [inputs, setInputs] = useState({
    initialCost: "150000",
    powerRating: "22",
    operatingHours: "6000",
    electricityCost: "4.50",
    maintenanceCost: "15000",
    lifecycle: "10"
  });

  // Dynamic calculation logic triggered on any input change
  const results = useMemo(() => {
    const pwr = parseFloat(inputs.powerRating) || 0;
    const hrs = parseFloat(inputs.operatingHours) || 0;
    const cost = parseFloat(inputs.electricityCost) || 0;
    const life = Math.max(parseFloat(inputs.lifecycle) || 0, 0);
    const init = parseFloat(inputs.initialCost) || 0;
    const maint = parseFloat(inputs.maintenanceCost) || 0;

    const annualEnergy = pwr * hrs * cost;
    const totalEnergy = annualEnergy * life;
    const totalMaint = maint * life;
    const totalTCO = init + totalEnergy + totalMaint;

    return {
      totalEnergyCost: totalEnergy,
      totalMaintenanceCost: totalMaint,
      totalTCO: totalTCO || 0,
      averageYearlyCost: life > 0 ? totalTCO / life : 0,
      percentages: {
        initial: totalTCO > 0 ? (init / totalTCO) * 100 : 0,
        energy: totalTCO > 0 ? (totalEnergy / totalTCO) * 100 : 0,
        maintenance: totalTCO > 0 ? (totalMaint / totalTCO) * 100 : 0
      }
    };
  }, [inputs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = value.replace(/,/g, '');
    if (cleanValue !== '' && !/^\d*\.?\d*$/.test(cleanValue)) return;
    setInputs(prev => ({ ...prev, [name]: cleanValue }));
  };

  const handleReset = () => {
    // Reset to empty strings for immediate typing without deleting '0'
    setInputs({ 
      initialCost: "", 
      powerRating: "", 
      operatingHours: "", 
      electricityCost: "", 
      maintenanceCost: "", 
      lifecycle: "1" 
    });
  };

  const formatCurr = (v) => new Intl.NumberFormat('th-TH', { 
    style: 'currency', 
    currency: 'THB', 
    maximumFractionDigits: 0 
  }).format(v || 0);

  return (
    <div className="min-h-screen bg-[#030712] text-[#f8fafc] font-sans selection:bg-blue-500/30">
      
      {/* Visual background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[600px] h-[600px] bg-indigo-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-10 relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] mb-10 border border-white/10 shadow-2xl transition-all">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
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
            className="mt-5 md:mt-0 flex items-center gap-2 px-8 py-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl text-[11px] font-extrabold transition-all border border-red-500/20 uppercase tracking-widest cursor-pointer active:scale-95 shadow-xl"
          >
            <RotateCcw size={16} /> Reset All Data
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Input Parameters */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white/5">
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

                <div className="bg-linear-to-br from-black/60 to-black/30 p-8 rounded-[2rem] border border-white/5 mt-6 shadow-inner">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">อายุโครงการ</span>
                    <span className="text-blue-400 font-black text-2xl">{inputs.lifecycle || 0} <span className="text-xs text-slate-600 font-bold">ปี</span></span>
                  </div>
                  <input 
                    type="range" name="lifecycle" min="1" max="25" 
                    value={inputs.lifecycle || 1} onChange={handleInputChange} 
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results & Dashboard */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Massive Hero Result Card */}
            <div className="bg-linear-to-br from-blue-700 via-blue-900 to-slate-950 rounded-[3rem] p-10 md:p-16 text-white shadow-3xl relative overflow-hidden group border border-white/10">
              <div className="absolute top-0 right-0 p-12 opacity-[0.05] scale-[4] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                <Calculator size={140} />
              </div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-8">
                  <Activity size={12} className="text-blue-400" /> Life Cycle Total Cost
                </div>
                
                <div className="mb-12">
                  {/* EXTRA LARGE DYNAMIC NUMBER */}
                  <div className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-tight text-white transition-all duration-300 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    {formatCurr(results.totalTCO)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 border-t border-white/10">
                  <DisplayItem label="ค่าพลังงานสะสม" value={formatCurr(results.totalEnergyCost)} />
                  <DisplayItem label="บำรุงรักษาสะสม" value={formatCurr(results.totalMaintenanceCost)} />
                  <DisplayItem label="เฉลี่ยต้นทุน/ปี" value={formatCurr(results.averageYearlyCost)} highlight />
                </div>
              </div>
            </div>

            {/* Bottom Grid: Distribution & Verdict */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-xl border border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 mb-10 uppercase tracking-[0.2em] flex items-center gap-2">
                  <PieChartIcon size={16} className="text-blue-500" /> Cost Distribution
                </h3>
                <div className="space-y-9">
                  <BarProgress label="ต้นทุนการจัดซื้อ (CapEx)" p={results.percentages.initial} color="#475569" />
                  <BarProgress label="ค่าพลังงานสะสม (OpEx)" p={results.percentages.energy} color="#3b82f6" />
                  <BarProgress label="ค่าซ่อมบำรุง (Maintenance)" p={results.percentages.maintenance} color="#10b981" />
                </div>
              </div>

              <div className="bg-blue-600/5 border border-blue-500/10 rounded-[2.5rem] p-10 flex flex-col justify-center transition-all hover:bg-blue-600/10">
                <h4 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">Technical Verdict</h4>
                <p className="text-base text-slate-400 leading-relaxed font-medium">
                  {results.totalTCO <= 0 ? "กรุณากรอกข้อมูลเพื่อเริ่มการวิเคราะห์..." :
                   results.percentages.energy > 80 
                    ? "ค่าไฟสูงถึง 80%+ ของต้นทุนทั้งหมด! แนะนำปั๊มรุ่น Premium Efficiency เพื่อคืนทุนรวดเร็ว" 
                    : "โครงสร้างต้นทุนมีความสมดุล แนะนำให้พิจารณาแผนบำรุงรักษาเชิงป้องกันเพื่อลดความเสี่ยง"}
                </p>
                <div className="mt-10 flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] border-t border-blue-500/10 pt-6">
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

// --- Sub-components for better maintainability ---

const InputBox = ({ label, name, value, onChange, unit }) => {
  const displayValue = useMemo(() => {
    if (value === '' || value === undefined) return '';
    const strVal = String(value);
    const parts = strVal.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  }, [value]);

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] block ml-1">{label}</label>
      <div className="relative group">
        <input 
          type="text" name={name} 
          value={displayValue} 
          placeholder="0"
          onChange={onChange} inputMode="decimal"
          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-800 text-lg"
        />
        <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/5 px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-500 uppercase pointer-events-none group-focus-within:text-blue-400 transition-colors">
          {unit}
        </div>
      </div>
    </div>
  );
};

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
    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
      <span className="text-slate-500">{label}</span>
      <span className="text-white font-mono">{p.toFixed(1)}%</span>
    </div>
    <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 p-[1px]">
      <div 
        style={{ width: `${p}%`, backgroundColor: color }} 
        className="h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
      />
    </div>
  </div>
);

export default App;