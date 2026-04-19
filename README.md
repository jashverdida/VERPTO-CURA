# CURA - Emergency Coordination Web Prototype

**Multi-hazard Emergency Coordination and Dispatch Platform**

A professional React web application prototype designed for multi-agency first responders (Ambulance, Fire, DRRMO) built with modern web technologies and a corporate design system.

## 🚀 Features

- **Dashboard & Command Center**: Live region view with interactive map placeholder and active triage queue
- **Incident Management**: Comprehensive emergency incident tracking and unit coordination
- **AI-Powered Notifications**: Edge AI alerts, voice transcription, and automated citizen reports
- **Patient Care Records (PCR)**: Digital medical records with AI-assisted care tracking
- **System Monitoring**: Real-time edge node status and system health monitoring
- **Responsive Design**: Mobile-friendly interface built for React Native portability

## 🎨 Design System

- **Primary Colors**: Clean white (#FFFFFF) and light gray (#F8F9FA) backgrounds
- **Status Colors**: Clinical Blue, Critical Red, Warning Amber, Success Green
- **Typography**: Inter font family with clear hierarchical weights
- **Styling**: Tailwind CSS for rapid, maintainable styling
- **Theme**: Corporate, professional, and trustworthy aesthetic

## 📦 Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Setup Steps

1. **Clone or download the project files**
   ```bash
   # If using git
   git clone <your-repository-url>
   cd CURA

   # Or extract the files to a folder called CURA
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open the application**
   - Navigate to `http://localhost:3000` in your web browser
   - The application will automatically reload when you make changes

## 🏗️ Project Structure

```
CURA/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Sidebar.jsx    # Navigation sidebar
│   │   ├── MapContainer.jsx   # Interactive map placeholder
│   │   ├── IncidentCard.jsx   # Emergency incident cards
│   │   └── QuickStats.jsx     # Dashboard statistics
│   ├── pages/             # Main application pages
│   │   ├── Dashboard.jsx  # Main dashboard view
│   │   ├── Incidents.jsx  # Incident management
│   │   ├── Notifications.jsx # AI alerts and comms
│   │   ├── PCRLog.jsx     # Patient care records
│   │   └── SystemStatus.jsx  # Edge node monitoring
│   ├── constants/
│   │   └── dummyData.js   # Realistic emergency data
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles and Tailwind
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.js        # Vite build configuration
└── README.md            # This file
```

## 📊 Dummy Data

The application includes comprehensive mock data for:

- **Active Incidents**: Realistic emergency scenarios (MVA, fires, floods, rescues)
- **Emergency Units**: Ambulances, fire trucks, rescue teams with real-time status
- **Notifications**: AI-generated alerts, voice transcripts, edge node updates
- **Patient Care Records**: Medical data with vital signs and treatment logs
- **Edge Nodes**: System monitoring data for AI nodes across regions

All dummy data is located in `src/constants/dummyData.js` for easy QA testing and customization.

## 🧪 QA Testing Guide

### Testing Different Data Scenarios

1. **Modify Dummy Data**:
   - Edit `src/constants/dummyData.js`
   - Add new incidents, change priorities, or update unit status
   - The UI will automatically reflect changes

2. **Test Responsive Design**:
   - Resize browser window to test mobile/tablet layouts
   - Use browser dev tools to simulate different devices

3. **Component Testing**:
   - Navigate between different pages using the sidebar
   - Click on incident markers in the map placeholder
   - Filter notifications and incidents using sidebar controls

### Data Structures for QA

```javascript
// Example incident structure
{
  id: 'INC-2026-001',
  type: 'medical|fire|flood|traffic|structural|rescue',
  title: 'Descriptive emergency title',
  priority: 'critical|high|medium|low',
  status: 'active|pending_verification|resolved',
  location: 'Specific address or area',
  reportedAt: Date object,
  assignedUnits: ['UNIT-01', 'UNIT-02'],
  aiVerified: true|false,
  // ... additional fields
}
```

## 🚀 Build for Production

```bash
npm run build
# or
yarn build
```

This creates a `dist/` folder with optimized production files.

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📱 React Native Migration Notes

The codebase is structured for easy React Native portability:

- **Modular Components**: Pure functional components with minimal web-specific code
- **Tailwind Classes**: Can be mapped to React Native StyleSheet
- **Data Layer**: Completely separated in constants files
- **Navigation**: Uses React Router patterns easily convertible to React Navigation

## 🎯 Key Features for Demo

1. **Professional Sidebar**: Collapsible navigation with emergency hotline and system status
2. **Interactive Dashboard**: Map placeholder with incident markers and live triage queue
3. **AI Notifications**: Realistic edge AI alerts with confidence scores and language detection
4. **Emergency Data**: Comprehensive incident cards with NLP triage and image verification
5. **System Monitoring**: Edge node status with battery levels and SMS fallback indicators

## 🚨 Emergency Hotline Integration

The sidebar includes a prominent emergency hotline (911) display, emphasizing the life-critical nature of the platform.

## 💡 Customization

- **Colors**: Modify `tailwind.config.js` to change the color scheme
- **Data**: Update `src/constants/dummyData.js` for different scenarios
- **Components**: Add new pages by creating components in `src/pages/` and updating routing in `App.jsx`

## 📧 Support

For questions about the CURA prototype:
- Review the component documentation in JSX files
- Check the dummy data structure for integration guidance
- Test different scenarios using the QA guidelines above

Built with ❤️ for emergency first responders in Southeast Asia.