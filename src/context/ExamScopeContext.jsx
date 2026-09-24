import { createContext, useContext, useState, useRef } from 'react';
import { getExamScope, setExamScope } from '../services/examScope';
const Context = createContext(null);
export function ExamScopeProvider({ children }) {
  const [scope, setScope] = useState(getExamScope);
  const views = useRef({});
  function update(patch) {
    const next = { ...getExamScope(), ...patch };
    setExamScope(next);
    setScope(next);
  }
  return <Context.Provider value={{ views, ...scope, setStream: stream => update({ stream }), setBranch: branch => update({ branch, stream: 'JEE' }) }}>{children}</Context.Provider>;
}
export const useExamScope = () => useContext(Context);

// Preserve navigation when branch changes remount analytics to discard stale responses.
export function useScopeViewState(key, initialValue) {
  const { views } = useExamScope();
  const [value, setValue] = useState(() => key in views.current ? views.current[key] : (typeof initialValue === 'function' ? initialValue() : initialValue));
  function update(next) {
    setValue(previous => {
      const result = typeof next === 'function' ? next(previous) : next;
      views.current[key] = result;
      return result;
    });
  }
  return [value, update];
}
