import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Salaries from "./pages/Salaries";
import Experience from "./pages/Experience";
import Remote from "./pages/Remote";
import Countries from "./pages/Countries";
import Compare from "./pages/Compare";
import CareerMatch from "./pages/CareerMatch";
import AICoach from "./pages/AICoach";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:title" element={<JobDetail />} />
        <Route path="/salaries" element={<Salaries />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/remote" element={<Remote />} />
        <Route path="/countries" element={<Countries />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/career-match" element={<CareerMatch />} />
        <Route path="/ai-coach" element={<AICoach />} />
      </Route>
    </Routes>
  );
}
