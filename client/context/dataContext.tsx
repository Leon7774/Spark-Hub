import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface DataContextType {
  customers: Customer[];
  plans: Plan[];
  sessions: Session[];
  loading: boolean;
}

const DataContext = createContext<DataContextType>({
  customers: [],
  plans: [],
  sessions: [],
  loading: true,
});

export const useDataContext = () => useContext(DataContext);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [customersRes, plansRes, sessionsRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/plan"),
          fetch("/api/session"),
        ]);
        const [customersData, plansData, sessionsData] = await Promise.all([
          customersRes.json(),
          plansRes.json(),
          sessionsRes.json(),
        ]);
        setCustomers(customersData);
        setPlans(plansData);
        setSessions(sessionsData);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ customers, plans, sessions, loading }}>
      {children}
    </DataContext.Provider>
  );
};
