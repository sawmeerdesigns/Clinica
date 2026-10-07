import { createRoot } from 'react-dom/client';
import './styles.css';
import { S, render, runLater } from './core.jsx';
import { Shell, boot, start, jumpTo, showCases } from './app.jsx';
import './booking.jsx';
import './health.jsx';
import './ask.jsx';
import './care.jsx';
import './meds.jsx';
import './more.jsx';
import { switchPhone, showApp, drStatus, drToday, DR_PATIENTS } from './doctor.jsx';
import './desk.jsx';
import './staff.jsx';

runLater(); // every module has registered its screens; now the setup that spans modules
boot();
createRoot(document.getElementById('root')).render(<Shell />);

// For check.cjs, which drives the prototype from outside.
Object.defineProperty(window, 'S', { get: () => S });
Object.assign(window, { render, start, jumpTo, showCases, switchPhone, showApp, drStatus, drToday, DR_PATIENTS });
