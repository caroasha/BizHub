import { createContext, useState, useEffect } from 'react';
import { getSiteSettings, getModules, getFAQs, getTestimonials } from '../api/public/site';
import { getPlans } from '../api/public/plans';

export const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [modules, setModules] = useState([]);
  const [plans, setPlans] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [siteRes, modulesRes, plansRes, faqsRes, testimonialsRes] = await Promise.all([
          getSiteSettings(),
          getModules(),
          getPlans(),
          getFAQs(),
          getTestimonials(),
        ]);
        setSettings(siteRes?.data || siteRes || {});
        setModules(modulesRes?.data || modulesRes || []);
        setPlans(plansRes?.data || plansRes || []);
        setFaqs(faqsRes?.data || faqsRes || []);
        setTestimonials(testimonialsRes?.data || testimonialsRes || []);
      } catch (err) {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <SiteContext.Provider value={{ settings, modules, plans, faqs, testimonials, loading }}>
      {children}
    </SiteContext.Provider>
  );
}