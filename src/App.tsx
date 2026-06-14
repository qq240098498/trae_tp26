import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GarmentList from "@/pages/GarmentList";
import GarmentDetail from "@/pages/GarmentDetail";
import AddEditGarment from "@/pages/AddEditGarment";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GarmentList />} />
        <Route path="/garment/:id" element={<GarmentDetail />} />
        <Route path="/add" element={<AddEditGarment />} />
        <Route path="/edit/:id" element={<AddEditGarment />} />
      </Routes>
    </Router>
  );
}
