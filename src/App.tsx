import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GarmentList from "@/pages/GarmentList";
import GarmentDetail from "@/pages/GarmentDetail";
import AddEditGarment from "@/pages/AddEditGarment";
import LaundryBatchList from "@/pages/LaundryBatchList";
import CreateLaundryBatch from "@/pages/CreateLaundryBatch";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GarmentList />} />
        <Route path="/garment/:id" element={<GarmentDetail />} />
        <Route path="/add" element={<AddEditGarment />} />
        <Route path="/edit/:id" element={<AddEditGarment />} />
        <Route path="/laundry" element={<LaundryBatchList />} />
        <Route path="/laundry/create" element={<CreateLaundryBatch />} />
      </Routes>
    </Router>
  );
}
