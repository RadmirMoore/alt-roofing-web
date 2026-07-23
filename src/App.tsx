import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AnalyticsView } from "./pages/admin/AnalyticsView";
import { ActivityView } from "./pages/admin/ActivityView";
import { LeadsView } from "./pages/admin/LeadsView";
import { ChatsView } from "./pages/admin/ChatsView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AnalyticsView />} />
          <Route path="activity" element={<ActivityView />} />
          <Route path="leads" element={<LeadsView />} />
          <Route path="chats" element={<ChatsView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
