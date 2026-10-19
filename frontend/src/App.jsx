import { Routes, Route } from 'react-router-dom';

function Placeholder({ title }) {
  return <div className="p-8 text-xl font-semibold">{title}</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder title="Dashboard" />} />
      <Route path="/login" element={<Placeholder title="Login" />} />
      <Route path="/register" element={<Placeholder title="Register" />} />
      <Route path="*" element={<Placeholder title="Not found" />} />
    </Routes>
  );
}
