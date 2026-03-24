import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { 
  Settings, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Factory,
  Save,
  History,
  Trash2,
  Loader2,
  Eraser,
  WifiOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// --- [จุดสำคัญ] ตรวจสอบ Config ของคุณให้ถูกต้อง ---
const firebaseConfig = {
  apiKey: "AIzaSyDzXTKNRMMZv8p0hl8np_kC86YmnlenIt0",
  authDomain: "pump-tco-calculator.firebaseapp.com",
  projectId: "pump-tco-calculator",
  storageBucket: "pump-tco-calculator.firebasestorage.app",
  messagingSenderId: "697088863146",
  appId: "1:697088863146:web:2b8eefe8b060ba80c919d3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'pump-tco-calculator';

const App = () => {
  const [user, setUser] = useState(null);
  const [savedRecords, setSavedRecords] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [recordName, setRecordName] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  const [inputs, setInputs] = useState({
    initialCost: 150000,
    powerRating: 22,
    operatingHours: 6000,
    electricityCost: 4.50,
    maintenanceCost: 15000,
    lifecycle: 10
  });

  // ฟังก์ชันสำหรับพยายามเชื่อมต่อใหม่เมื่อเกิด Network Error
  const signInWithRetry = async (retries = 5, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        setConnectionStatus('connecting');
        await signInAnonymously(auth);
        setErrorMessage('');
        return; // สำเร็จแล้วให้ออกลูป
      } catch (err) {
        console.error(`Auth Attempt ${i + 1} failed:`, err.message);
        if (i === retries - 1) {
          setConnectionStatus('error');
          setErrorMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตหรือ Config');
        } else {
          // รอเพิ่มขึ้นเรื่อยๆ (Exponential backoff)
          await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
        }
      }
    }
  };

  useEffect(() => {
    signInWithRetry();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setConnectionStatus('connected');
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // ป้องกันการ Query ถ้ายังไม่ได้ Login
    if (!user) return;

    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'calculations');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedRecords(docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    }, (error) => {
      console.error("Firestore Error:", error);
      // ถ้าเกิดปัญหาเรื่อง Permission หรือ Network ใน Firestore
      if (error.code === 'unavailable') {
        setConnectionStatus('error');
      }
    });
    return () => unsubscribe();
  }, [user]);

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

  const saveCalculation = async () => {
    if (!user || !recordName.trim()) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'calculations'), {
        name: recordName,
        inputs,
        results,
        createdAt: serverTimestamp()
      });
      setRecordName('');
    } catch (e) { 
      console.error("Save failed:", e);
      setErrorMessage("บันทึกข้อมูลไม่สำเร็จ");
    } finally { 
      setIsSaving(false); 
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="min-h-screen bg-[#050510] text-slate-200 p-4 md:p-6 lg:p-8 font-sans">
      {/* แจ้งเตือนข้อผิดพลาดแบบลอย */}
      {errorMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <AlertCircle size={20} />
          <span className="text-sm font-bold">{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="ml-2 hover:opacity-50">×</button>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Pump TCO Engine <span className="text-blue-500">Pro</span></h1>
              <p className="text-xs text-slate-500">วิเคราะห์ต้นทุนพลังงานและจุดคุ้มทุน</p>
            </div>
          </div>
          <div className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-colors ${
            connectionStatus === 'connected' 
            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' 
            : connectionStatus === 'error'
            ? 'border-red-500/30 text-red-400 bg-red-500/5'
            : 'border-blue-500/30 text-blue-400 animate-pulse bg-blue-500/5'
          }`}>
            {connectionStatus === 'connected' ? (
              <span className="flex items-center gap-1.5"><CheckCircle2 size={10} /> CLOUD STORAGE ACTIVE</span>
            ) : connectionStatus === 'error' ? (
              <span className="flex items-center gap-1.5"><WifiOff size={10} /> OFFLINE MODE / ERROR</span>
            ) : (
              <span className="flex items-center gap-1.5"><Loader2 size={10} className="animate-spin" /> CONNECTING...</span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Inputs & History */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0f1120] border border-white/5 rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Settings className="w-3.5 h-3.5" /> ตั้งค่าตัวแปร</h2>
                <button onClick={() => setInputs({initialCost:0, powerRating:0, operatingHours:0, electricityCost:0, maintenanceCost:0, lifecycle:1})} className="text-[10px] text-slate-500 hover:text-red-400 transition-colors"><Eraser className="w-3 h-3 inline mr-1" /> ล้าง</button>
              </div>

              <div className="space-y-4">
                <InputField label="ราคาเครื่อง + ติดตั้ง" name="initialCost" value={inputs.initialCost} onChange={handleInputChange} unit="บาท" />
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="กำลัง (kW)" name="powerRating" value={inputs.powerRating} onChange={handleInputChange} unit="kW" />
                  <InputField label="ชม. ใช้งาน/ปี" name="operatingHours" value={inputs.operatingHours} onChange={handleInputChange} unit="ชม." />
                </div>
                <InputField label="ค่าไฟ/หน่วย" name="electricityCost" value={inputs.electricityCost} onChange={handleInputChange} unit="บาท" />
                <InputField label="บำรุงรักษา/ปี" name="maintenanceCost" value={inputs.maintenanceCost} onChange={handleInputChange} unit="บาท" />
                
                <div className="pt-2">
                  <div className="flex justify-between text-[10px] font-bold mb-2">
                    <span className="text-slate-500 uppercase">อายุการใช้งาน</span>
                    <span className="text-blue-400">{inputs.lifecycle} ปี</span>
                  </div>
                  <input type="range" name="lifecycle" min="1" max="25" value={inputs.lifecycle} onChange={handleInputChange} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>

                <div className="pt-4 flex gap-2">
                  <input type="text" placeholder="ชื่อบันทึก..." value={recordName} onChange={(e) => setRecordName(e.target.value)} className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white" />
                  <button onClick={saveCalculation} disabled={isSaving || !recordName || !user} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-20 p-2 rounded-lg transition-all text-white shadow-lg shadow-blue-900/20">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1120] border border-white/5 rounded-2xl p-5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><History className="w-3.5 h-3.5" /> ประวัติบันทึก</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {savedRecords.length === 0 ? (
                  <p className="text-[10px] text-slate-600 text-center py-4">ไม่มีรายการบันทึก</p>
                ) : (
                  savedRecords.map(rec => (
                    <div key={rec.id} className="group bg-white/5 border border-white/5 p-3 rounded-xl flex justify-between items-center hover:border-blue-500/30 transition-all">
                      <button onClick={() => setInputs(rec.inputs)} className="text-left flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-300 truncate">{rec.name}</p>
                        <p className="text-[10px] text-blue-500 font-mono">{formatCurrency(rec.results.totalTCO)}</p>
                      </button>
                      <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'calculations', rec.id))} className="text-slate-600 hover:text-red-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Main Display */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Factory size={120} /></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              
              <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Total Cost of Ownership</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 break-all leading-none">
                {formatCurrency(results.totalTCO)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <StatBox label="ต้นทุนพลังงาน" value={formatCurrency(results.totalEnergyCost)} />
                <StatBox label="ค่าบำรุงรักษา" value={formatCurrency(results.totalMaintenanceCost)} />
                <StatBox label="เฉลี่ยต่อปี" value={formatCurrency(results.averageYearlyCost)} color="text-emerald-300" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0f1120] border border-white/5 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest flex items-center gap-2"><PieChartIcon className="w-3.5 h-3.5" /> สัดส่วนค่าใช้จ่าย</h3>
                <div className="space-y-5">
                  <Progress label="ค่าเครื่อง" percent={results.percentages.initial} color="bg-slate-500" />
                  <Progress label="ค่าไฟฟ้า" percent={results.percentages.energy} color="bg-blue-500" />
                  <Progress label="ซ่อมบำรุง" percent={results.percentages.maintenance} color="bg-emerald-500" />
                </div>
              </div>

              <div className="bg-[#0f1120] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 text-emerald-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="text-white font-bold mb-2">บทวิเคราะห์</h4>
                <p className="text-xs text-slate-400 leading-relaxed px-4">
                  ต้นทุนหลัก ({results.percentages.energy > 50 ? 'ค่าไฟ' : 'ค่าเครื่อง'}) คิดเป็น {Math.max(results.percentages.energy, results.percentages.initial).toFixed(1)}% 
                  {results.percentages.energy > 70 ? " การเพิ่มประสิทธิภาพเพียง 5% จะประหยัดเงินได้มหาศาล" : " ควรเน้นไปที่ความทนทานและการรับประกัน"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, unit }) => (
  <div>
    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">{label}</label>
    <div className="relative">
      <input type="text" name={name} value={new Intl.NumberFormat().format(value || 0)} onChange={onChange} inputMode="decimal" className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:border-blue-500/50 outline-none" />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-600">{unit}</span>
    </div>
  </div>
);

const StatBox = ({ label, value, color = "text-white" }) => (
  <div>
    <p className="text-[9px] text-blue-100/40 uppercase font-bold mb-1">{label}</p>
    <p className={`text-lg font-bold truncate ${color}`}>{value}</p>
  </div>
);

const Progress = ({ label, percent, color }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] font-bold">
      <span className="text-slate-500 uppercase">{label}</span>
      <span className="text-white">{percent.toFixed(1)}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
      <div style={{ width: `${percent}%` }} className={`h-full ${color} transition-all duration-700`} />
    </div>
  </div>
);

export default App;