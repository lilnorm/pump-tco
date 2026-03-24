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
  Calculator
} from 'lucide-react';

const App = () => {
  // ตั้งค่าเริ่มต้นให้เป็น 0 ทั้งหมดตามคำขอ
  const zeroValues = {
    initialCost: 0,
    powerRating: 0,
    operatingHours: 0,
    electricityCost: 0,
    maintenanceCost: 0,
    lifecycle: 1 // ขั้นต่ำ 1 ปีเพื่อไม่ให้การคำนวณผิดพลาด
  };

  // เริ่มต้นด้วยค่าตัวอย่าง (เพื่อให้เห็นภาพก่อน) แต่กด Reset แล้วจะเป็น 0
  const [inputs, setInputs] = useState({
    initialCost: 150000,
    powerRating: 22,
    operatingHours: 6000,
    electricityCost: 4.50,
    maintenanceCost: 15000,
    lifecycle: 10
  });

  // ส่วนของการคำนวณ (ใช้ useMemo เพื่อประสิทธิภาพ)
  const results = useMemo(() => {
    const pwr = parseFloat(inputs.powerRating) || 0;
    const hrs = parseFloat(inputs.operatingHours) || 0;
    const cost = parseFloat(inputs.electricityCost) || 0;
    const life = parseFloat(inputs.lifecycle) || 1;
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
    // ลบ comma และจัดการเฉพาะตัวเลข
    const cleanValue = value.replace(/,/g, '');
    if (cleanValue !== '' && !/^\d*\.?\d*$/.test(cleanValue)) return;
    
    // บันทึกค่า (ถ้าว่างให้เป็น 0)
    setInputs(prev => ({ 
      ...prev, 
      [name]: cleanValue === '' ? 0 : Number(cleanValue) 
    }));
  };

  // ฟังก์ชันล้างข้อมูลให้เป็น 0
  const handleResetToZero = () => {
    setInputs(zeroValues);
  };

  const formatCurr = (v) => new Intl.NumberFormat('th-TH', { 
    style: 'currency', 
    currency: 'THB', 
    maximumFractionDigits: 0 
  }).format(v || 0);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans p-4 md:p-10 selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Navigation Bar */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Factory className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">
                PUMP TCO <span className="text-blue-500">MASTER</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Precision Calculation Tool</p>
            </div>
          </div>
          <button 
            onClick={handleResetToZero}
            className="group flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl text-xs font-black transition-all border border-red-500/20 active:scale-95 shadow-lg shadow-red-500/5"
          >
            <RotateCcw size={14} className="group-hover:rotate-[-120deg] transition-transform" /> 
            ล้างข้อมูลเป็น 0
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-4">
                <LayoutDashboard size={16} className="text-blue-400" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">กรอกข้อมูลวิศวกรรม</h2>
              </div>

              <div className="space-y-6">
                <InputGroup label="ราคาจัดซื้อปั๊ม (CapEx)" name="initialCost" value={inputs.initialCost} onChange={handleInputChange} unit="฿" />
                
                <div className="grid grid-cols-2 gap-4">
                   <InputGroup label="มอเตอร์ (kW)" name="powerRating" value={inputs.powerRating} onChange={handleInputChange} unit="kW" />
                   <InputGroup label="ชั่วโมงรัน/ปี" name="operatingHours" value={inputs.operatingHours} onChange={handleInputChange} unit="Hr" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="ค่าไฟ (฿/Unit)" name="electricityCost" value={inputs.electricityCost} onChange={handleInputChange} unit="฿" />
                  <InputGroup label="ค่าบำรุงรักษา/ปี" name="maintenanceCost" value={inputs.maintenanceCost} onChange={handleInputChange} unit="฿" />
                </div>

                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 mt-4 group">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ระยะเวลาใช้งาน</span>
                    <span className="text-blue-400 font-black text-lg">{inputs.lifecycle} ปี</span>
                  </div>
                  <input 
                    type="range" name="lifecycle" min="1" max="25" 
                    value={inputs.lifecycle} onChange={handleInputChange} 
                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Main Result Card */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-900 to-[#030712] rounded-[3.5rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-10 opacity-5 scale-[2] -rotate-12 transition-transform duration-1000 group-hover:rotate-0">
                <Calculator size={140} />
              </div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-blue-200 mb-8">
                  <Zap size={10} className="fill-blue-400 animate-pulse" /> ผลลัพธ์ต้นทุนรวม (TCO)
                </div>
                
                <h2 className="text-[clamp(2rem,7.5vw,5.5rem)] font-black tracking-tighter leading-none mb-4 text-white drop-shadow-2xl">
                  {formatCurr(results.totalTCO)}
                </h2>
                <div className="h-1.5 w-24 bg-blue-500 rounded-full mb-14 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pt-10 border-t border-white/10">
                  <ResultItem label="ค่าพลังงานรวม" val={formatCurr(results.totalEnergyCost)} />
                  <ResultItem label="ค่าซ่อมบำรุงรวม" val={formatCurr(results.totalMaintenanceCost)} />
                  <ResultItem label="เฉลี่ยต้นทุน/ปี" val={formatCurr(results.averageYearlyCost)} highlight />
                </div>
              </div>
            </div>

            {/* Analysis Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-md">
                <h3 className="text-[10px] font-black text-slate-500 mb-8 uppercase tracking-widest flex items-center gap-2">
                  <PieChartIcon size={14} className="text-blue-500" /> สัดส่วนต้นทุนสะสม
                </h3>
                <div className="space-y-8">
                  <ProgressBar label="ต้นทุนจัดซื้อ (CapEx)" p={results.percentages.initial} color="bg-slate-700" />
                  <ProgressBar label="ค่าพลังงานสะสม" p={results.percentages.energy} color="bg-blue-600" />
                  <ProgressBar label="ค่าบำรุงรักษา" p={results.percentages.maintenance} color="bg-emerald-600" />
                </div>
              </div>

              <div className="bg-blue-600/5 border border-blue-500/10 rounded-[2.5rem] p-10 flex flex-col justify-center relative group">
                <div className="absolute top-6 right-6 text-blue-500/10 group-hover:scale-110 transition-transform"><Info size={48} /></div>
                <h4 className="text-lg font-black text-white mb-4 italic tracking-tight">Technical Verdict</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {results.totalTCO === 0 ? "กรุณากรอกข้อมูลเพื่อเริ่มการวิเคราะห์เชิงเทคนิค" :
                   results.percentages.energy > 80 
                    ? "ค่าไฟสูงกว่า 80% ของต้นทุนทั้งหมด! แนะนำให้เปลี่ยนเป็นปั๊มประสิทธิภาพสูง (Premium Efficiency) จะช่วยลดต้นทุนรวมได้อย่างมหาศาล" 
                    : "สัดส่วนต้นทุนอยู่ในเกณฑ์ปกติ ควรเน้นการทำบำรุงรักษาเชิงป้องกันเพื่อยืดอายุการใช้งานให้นานที่สุด"}
                </p>
                <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest cursor-pointer hover:text-blue-400 transition-colors">
                  Engineering Insights <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const InputGroup = ({ label, name, value, onChange, unit }) => (
  <div className="space-y-2.5">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">
      {label}
    </label>
    <div className="relative group">
      <input 
        type="text" name={name} 
        value={value === 0 ? '' : new Intl.NumberFormat().format(value)} 
        placeholder="0"
        onChange={onChange} inputMode="decimal"
        className="w-full bg-black/50 border border-slate-800 rounded-2xl py-4 px-5 text-base font-bold text-white focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all pr-14 group-hover:border-slate-700"
      />
      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-600 uppercase tracking-tighter select-none">
        {unit}
      </div>
    </div>
  </div>
);

const ResultItem = ({ label, val, highlight }) => (
  <div className="min-w-0">
    <p className="text-[9px] text-blue-200/40 uppercase font-black tracking-widest mb-2.5">{label}</p>
    <p className={`text-xl md:text-2xl font-black truncate ${highlight ? 'text-emerald-400' : 'text-white'}`}>
      {val}
    </p>
  </div>
);

const ProgressBar = ({ label, p, color }) => (
  <div className="space-y-3">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="text-white font-mono">{p.toFixed(1)}%</span>
    </div>
    <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 p-[1px]">
      <div 
        style={{ width: `${p}%` }} 
        className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.2)]`} 
      />
    </div>
  </div>
);

export default App;