import { Routes, Route } from "react-router-dom";
import DeparturesList from "./pages/DeparturesList";
import BookingConfirmation from "./pages/BookingConfirmation";
import TripView from "./pages/TripView";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DeparturesList />} />
      <Route path="/booking/:tripUid" element={<BookingConfirmation />} />
      <Route path="/trip/:tripUid" element={<TripView />} />
    </Routes>
  );
}
