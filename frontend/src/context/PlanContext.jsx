import { createContext, useContext, useState, useCallback } from 'react';
import * as planService from '../services/planService';

export const PlanContext = createContext(null);

export const PlanProvider = ({ children }) => {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await planService.getPlans();
      setPlans(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPlan = (plan) =>
    setPlans(prev => [plan, ...prev]);

  const updatePlan = (updated) =>
    setPlans(prev => prev.map(p => p._id === updated._id ? updated : p));

  const removePlan = (id) =>
    setPlans(prev => prev.filter(p => p._id !== id));

  return (
    <PlanContext.Provider value={{ plans, loading, fetchPlans, addPlan, updatePlan, removePlan }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlans = () => useContext(PlanContext);