import { Level3Chips } from './ui/Level3Chips';
import { PatientAlert } from '../types/alerts';

export interface PatientHeaderProps {
  id?: string;
  name: string;
  age?: number | string;
  diagnosis?: string;
  cid?: string;
  specialty: string;
  status?: string;
  alerts?: PatientAlert[];
}

export function PatientHeader({
  id,
  name,
  age,
  diagnosis,
  cid,
  specialty,
  status = 'Pendente',
  alerts = [],
}: PatientHeaderProps) {
  return (
    <div className="bg-[#1B6CA8] rounded-2xl p-5 mb-5 text-white flex justify-between items-center shadow-sm">
      <div>
        <div className="text-sm font-semibold opacity-90 mb-1">{id}</div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {name}
          </h2>
          <Level3Chips alerts={alerts} />
        </div>
        <div className="text-sm opacity-90">
          {age ? `${age} anos` : ''} 
          {age && diagnosis ? ' · ' : ''} 
          {diagnosis || ''} 
          {diagnosis && cid ? ' · ' : ''} 
          {cid ? `CID ${cid}` : ''}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-bold shadow-sm backdrop-blur-sm">
          {specialty}
        </span>
        {status === 'Pendente' ? (
          <span className="bg-white text-[#D97706] px-4 py-1 rounded-full text-sm font-bold shadow-sm">
            {status}
          </span>
        ) : (
          <span className="bg-white text-[#2DB5A3] px-4 py-1 rounded-full text-sm font-bold shadow-sm">
            {status}
          </span>
        )}
      </div>
    </div>
  );
}
