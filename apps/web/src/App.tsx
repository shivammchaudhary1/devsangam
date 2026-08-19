import { Route, Routes } from 'react-router';

import { AppShell } from '@/components/layout/AppShell';
import { PlaceholderPage } from '@/components/shared/PlaceholderPage';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          path="/"
          element={
            <PlaceholderPage
              title="Dashboard"
              description="Your daily spiritual practice."
            />
          }
        />

        <Route
          path="/practice"
          element={
            <PlaceholderPage
              title="Start Practice"
              description="Choose a mantra and begin your Sadhana."
            />
          }
        />

        <Route
          path="/insights"
          element={
            <PlaceholderPage
              title="Insights & Progress"
              description="Track consistency and chanting progress."
            />
          }
        />

        <Route
          path="/library"
          element={
            <PlaceholderPage
              title="Sadhana Library"
              description="Explore sacred mantras."
            />
          }
        />

        <Route
          path="/profile"
          element={
            <PlaceholderPage
              title="Profile"
              description="Manage your DevSangam experience."
            />
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
