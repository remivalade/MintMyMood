import { createBrowserRouter, Navigate } from 'react-router-dom';
import { WritingInterface } from './components/WritingInterface';
import { Gallery } from './components/Gallery';
import { MoodSelection } from './components/MoodSelection';
import { MintPreview } from './components/MintPreview';
import { ThoughtDetail } from './components/ThoughtDetail';

/**
 * React Router Configuration
 *
 * Routes:
 * / - Writing interface (home)
 * /gallery - Thought gallery
 * /mood - Mood selection
 * /preview - Mint preview
 * /thought/:id - Thought detail view
 */

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/write" replace />,
  },
  {
    path: '/write',
    element: <div>Writing</div>, // Will be rendered by App component
  },
  {
    path: '/gallery',
    element: <div>Gallery</div>, // Will be rendered by App component
  },
  {
    path: '/mood',
    element: <div>Mood</div>, // Will be rendered by App component
  },
  {
    path: '/preview',
    element: <div>Preview</div>, // Will be rendered by App component
  },
  {
    path: '/thought/:id',
    element: <div>Detail</div>, // Will be rendered by App component
  },
]);
