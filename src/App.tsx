import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GarmentList from "@/pages/GarmentList";
import GarmentDetail from "@/pages/GarmentDetail";
import AddEditGarment from "@/pages/AddEditGarment";
import LaundryBatchList from "@/pages/LaundryBatchList";
import CreateLaundryBatch from "@/pages/CreateLaundryBatch";
import DryCleaningList from "@/pages/DryCleaningList";
import CreateDryCleaning from "@/pages/CreateDryCleaning";
import RateDryCleaning from "@/pages/RateDryCleaning";
import SeasonalStorage from "@/pages/SeasonalStorage";

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
        <Route path="/dry-cleaning" element={<DryCleaningList />} />
        <Route path="/dry-cleaning/create" element={<CreateDryCleaning />} />
        <Route path="/dry-cleaning/edit/:id" element={<CreateDryCleaning />} />
        <Route path="/dry-cleaning/rate/:id" element={<RateDryCleaning />} />
        <Route path="/seasonal-storage" element={<SeasonalStorage />} />
      </Routes>
    </Router>
  );
}
