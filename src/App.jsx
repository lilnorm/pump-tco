import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Factory,
  Save,
  History,
  Trash2,
  Eraser,
  Zap,
  Info,
  CheckCircle2
} from 'lucide-react';

const App = () => {
  // สถานะสำหรับข้อมูลที่กรอก
  const [inputs, setInputs] = useState({
    initialCost: 150000,
    powerRating: 22,
    operatingHours: 6000,
    electricityCost: 4.50,
    maintenanceCost: 15000,
    lifecycle: 10
  });

  // สถานะสำหรับประวัติการบันทึก (เก็บใน LocalStorage)
  const [savedRecords, setSavedRecords] = useState([]);
  const [recordName, setRecordName] = useState('');
  const [showToast, setShowToast] = useState(false);

  // โหลดข้อมูลจาก LocalStorage เมื่อเปิดแอป
  useEffect(() => {
    const localData = localStorage.getItem('pump_tco_history');
    if (localData) {
      try {
        setSavedRecords(JSON.parse(localData));
      } catch (e) {
        console.error("Failed to load local data", e);
      }
    }
  }, []);

  // บันทึกลง LocalStorage ทุกครั้งที่ savedRecords เปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem('pump_tco_history', JSON.stringify(savedRecords));
  }, [savedRecords]);

  // คำนวณผลลัพธ์ (Logic เดิมที่ถูกต้อง)
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
    const cleanValue = value.replace(/,/g, '');
    if (cleanValue !== '' && !/^\d*\.?\d*$/.test(cleanValue)) return;
    setInputs(prev => ({ ...prev, [name]: cleanValue === '' ? 0 : cleanValue }));
  };

  const saveRecord = () => {
    if (!recordName.trim()) return;
    const newRecord = {
      id: Date.now(),
      name: recordName,
      inputs: { ...inputs },
      results: { ...results },
      date: new Date().toLocaleDateString('th-TH')
    };
    setSavedRecords([newRecord, ...savedRecords]);
    setRecordName('');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const deleteRecord = (id) => {
    setSavedRecords(savedRecords.filter(r => r.id !== id));
  };

  const formatCurrency = (val) => new Intl.NumberFormat('th-TH', { 
    style: 'currency', 
    currency: 'THB', 
    maximumFractionDigits: 0 
  }).format(val || 0);

  return (
    <div className="min-h-screen bg-[#020410] text-slate-200 p-4 md:p-8 font-sans antialiased">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">บันทึกข้อมูลเรียบร้อยแล้ว</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Factory className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight italic">PUMP TCO <span className="text-blue-500">OFFLINE</span></h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-wider">Local Storage Mode • No Firebase Required</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-[#0b1026] border border-white/5 rounded-[2rem] p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-500" /> ข้อมูลตัวแปร
                </h2>
                <button 
                  onClick={() => setInputs({initialCost:0, powerRating:0, operatingHours:0, electricityCost:0, maintenanceCost:0, lifecycle:1})} 
                  className="text-[10px] text-slate-500 hover:text-red-400 transition-all font-bold"
                >
                  <Eraser className="w-3 h-3 inline mr-1" /> ล้างค่า
                </button>
              </div>

              <div className="space-y-5">
                <InputField label="ราคาเครื่อง + ติดตั้ง" name="initialCost" value={inputs.initialCost} onChange={handleInputChange} unit="บาท" />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="กำลังมอเตอร์" name="powerRating" value={inputs.powerRating} onChange={handleInputChange} unit="kW" />
                  <InputField label="รันเครื่อง/ปี" name="operatingHours" value={inputs.operatingHours} onChange={handleInputChange} unit="ชม." />
                </div>
                <InputField label="อัตราค่าไฟฟ้า" name="electricityCost" value={inputs.electricityCost} onChange={handleInputChange} unit="฿/หน่วย" />
                <InputField label="ค่าซ่อมบำรุง/ปี" name="maintenanceCost" value={inputs.maintenanceCost} onChange={handleInputChange} unit="บาท" />
                
                <div className="pt-4">
                  <div className="flex justify-between text-[11px] font-black mb-3 text-slate-500 uppercase">
                    <span>ระยะเวลาการใช้งาน</span>
                    <span className="text-blue-400 font-mono text-xs">{inputs.lifecycle} ปี</span>
                  </div>
                  <input 
                    type="range" 
                    name="lifecycle" 
                    min="1" 
                    max="25" 
                    value={inputs.lifecycle} 
                    onChange={handleInputChange} 
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                  />
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-3">
                  <input 
                    type="text" 
                    placeholder="ตั้งชื่อบันทึก..." 
                    value={recordName} 
                    onChange={(e) => setRecordName(e.target.value)} 
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none text-white" 
                  />
                  <button 
                    onClick={saveRecord} 
                    disabled={!recordName.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 px-5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <Save className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </section>

            {/* History Section */}
            <section className="bg-[#0b1026] border border-white/5 rounded-[2rem] p-6">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-500" /> ประวัติการคำนวณในเครื่อง
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {savedRecords.map(rec => (
                  <div key={rec.id} className="group bg-white/[0.03] border border-white/[0.05] p-4 rounded-2xl flex justify-between items-center hover:bg-white/[0.05] transition-all cursor-pointer">
                    <div onClick={() => setInputs(rec.inputs)} className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-200 truncate">{rec.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-blue-400">{formatCurrency(rec.results.totalTCO)}</span>
                        <span className="text-[9px] text-slate-600 font-bold tracking-tighter">{rec.date}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteRecord(rec.id)} className="text-slate-700 hover:text-red-500 p-2 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {savedRecords.length === 0 && (
                  <div className="text-center py-10 opacity-30">
                    <Info className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No data saved</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Side: Results */}
          <div className="lg:col-span-8 space-y-8">
            {/* Total TCO Card */}
            <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Factory size={220} /></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-[100px]"></div>
              
              <div className="relative z-10">
                <div className="px-3 py-1 bg-white/10 rounded-full inline-block text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 mb-6">
                  Estimate Total Cost of Ownership
                </div>
                {/* Responsive Typography */}
                <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-12 leading-none drop-shadow-2xl">
                  {formatCurrency(results.totalTCO)}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 border-t border-white/10">
                  <StatItem label="ค่าพลังงานสะสม" value={formatCurrency(results.totalEnergyCost)} icon={<Zap size={14}/>} />
                  <StatItem label="ค่าซ่อมบำรุงสะสม" value={formatCurrency(results.totalMaintenanceCost)} />
                  <StatItem label="ค่าใช้จ่ายเฉลี่ยต่อปี" value={formatCurrency(results.averageYearlyCost)} highlight />
                </div>
              </div>
            </div>

            {/* Analysis Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#0b1026] border border-white/5 rounded-[2.5rem] p-8">
                <h3 className="text-xs font-black text-slate-400 mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-blue-500" /> สัดส่วนค่าใช้จ่ายจริง
                </h3>
                <div className="space-y-6">
                  <PercentageBar label="Capex (ค่าเครื่อง)" percent={results.percentages.initial} color="bg-slate-400" />
                  <PercentageBar label="Energy (ค่าไฟ)" percent={results.percentages.energy} color="bg-blue-500" />
                  <PercentageBar label="Opex (ค่าบำรุงรักษา)" percent={results.percentages.maintenance} color="bg-emerald-500" />
                </div>
              </div>

              <div className="bg-[#0b1026] border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center relative">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-400 rotate-3 group-hover:rotate-0 transition-transform">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-white mb-3 italic tracking-tight">AI Analysis</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  {results.percentages.energy > 65 
                    ? `ค่าไฟฟ้าคิดเป็น ${results.percentages.energy.toFixed(0)}% ของต้นทุนทั้งหมด การใช้ปั๊มประสิทธิภาพสูง (High Efficiency) จะช่วยประหยัดเงินได้สูงสุด` 
                    : `สัดส่วนค่าเครื่อง (${results.percentages.initial.toFixed(0)}%) ค่อนข้างสูง แนะนำให้เปรียบเทียบราคาและเงื่อนไขการรับประกันให้รอบคอบ`}
                </p>
                <div className="mt-6 flex gap-2">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase text-slate-500 tracking-widest">Optimized</span>
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase text-slate-500 tracking-widest">LCC Standard</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Sub-components
const InputField = ({ label, name, value, onChange, unit }) => (
  <div className="group">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block group-focus-within:text-blue-500 transition-colors">{label}</label>
    <div className="relative">
      <input 
        type="text" 
        name={name} 
        value={new Intl.NumberFormat().format(value || 0)} 
        onChange={onChange} 
        inputMode="decimal" 
        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-blue-500 focus:outline-none transition-all pr-14" 
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-700 uppercase">{unit}</span>
    </div>
  </div>
);

const StatItem = ({ label, value, highlight, icon }) => (
  <div>
    <p className="text-[10px] text-blue-100/30 uppercase font-black tracking-widest mb-1 flex items-center gap-1.5">{icon} {label}</p>
    <p className={`text-xl font-black tracking-tight ${highlight ? 'text-emerald-400' : 'text-white'} truncate`}>{value}</p>
  </div>
);

const PercentageBar = ({ label, percent, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
      <span className="text-slate-500">{label}</span>
      <span className="text-white">{percent.toFixed(1)}%</span>
    </div>
    <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
      <div 
        style={{ width: `${percent}%` }} 
        className={`h-full ${color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]`} 
      />
    </div>
  </div>
);

export default App;