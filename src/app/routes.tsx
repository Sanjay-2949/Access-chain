import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from '../components/Layout';
import Landing from '../ui-pages/Landing';
import Auth from '../ui-pages/Auth';
import Home from '../ui-pages/Home';
import JourneyNew from '../ui-pages/JourneyNew';
import MapView from '../ui-pages/MapView';
import JourneyRoadmap from '../ui-pages/JourneyRoadmap';
import FindAWay from '../ui-pages/FindAWay';
import TransportModification from '../ui-pages/TransportModification';
import FinalDashboard from '../ui-pages/FinalDashboard';
import ActiveJourney from '../ui-pages/ActiveJourney';
import SavedJourneys from '../ui-pages/SavedJourneys';
import Community from '../ui-pages/Community';
import Contacts from '../ui-pages/Contacts';
import Settings from '../ui-pages/Settings';
import Help from '../ui-pages/Help';
import OutageAlerts from '../ui-pages/OutageAlerts';
import Demo from '../ui-pages/Demo';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: 'home', element: <Home /> },
      { path: 'journey/new', element: <JourneyNew /> },
      { path: 'journey/map', element: <MapView /> },
      { path: 'journey/roadmap', element: <JourneyRoadmap /> },
      { path: 'journey/find-a-way', element: <FindAWay /> },
      { path: 'journey/transport', element: <TransportModification /> },
      { path: 'journey/final', element: <FinalDashboard /> },
      { path: 'journey/active', element: <ActiveJourney /> },
      { path: 'saved-journeys', element: <SavedJourneys /> },
      { path: 'community', element: <Community /> },
      { path: 'contacts', element: <Contacts /> },
      { path: 'settings', element: <Settings /> },
      { path: 'help', element: <Help /> },
      { path: 'outages', element: <OutageAlerts /> },
      { path: 'demo', element: <Demo /> },
      { path: '*', element: <Navigate to="/home" replace /> },
    ],
  },
]);
