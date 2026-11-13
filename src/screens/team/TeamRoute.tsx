import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useLab } from '../../store/useLab';

/** `#/team` is a deep link into the Trip Lab's Calculator. */
export default function TeamRoute() {
  useEffect(() => {
    const s = useLab.getState();
    if (s.panelTab === 'story') s.setPanelTab('calculator');
    s.setView('lab');
  }, []);
  return <Navigate to="/profile" replace />;
}
