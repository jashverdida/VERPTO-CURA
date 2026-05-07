# 🚨 CURA

> **Multi-hazard Emergency Coordination & Dispatch Platform**  
> *Empowering First Responders. Coordinating Chaos. Saving Lives.*

[![DevKada Hackathon](https://img.shields.io/badge/DevKada%20Online-Hackathon%202026-blue?style=for-the-badge)](https://devkada.com)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-4.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Hackathon%20Edition-brightgreen?style=flat-square)](#)

---

## 🎯 Overview

CURA is a cutting-edge emergency coordination platform designed for modern first responders. Built during the **DevKada Online Hackathon** (May 3-5, 2026), CURA seamlessly coordinates multi-agency responses across **medical emergencies, fire incidents, rescue operations, and disaster management**.

Whether coordinating a traffic accident or managing a large-scale disaster, CURA provides real-time incident tracking, AI-powered triage, and intelligent unit dispatch—all from an elegant, intuitive interface.

**👥 Designed for:** Emergency Responders | Station Commanders | Dispatch Centers | Citizens  
**🛠️ Built by:** VERPTO (Jashmine Verdida, Eijay Pepito & Lord Christian Beligaño)

---

## ✨ Key Features

### 🎛️ Command Center Dashboard
- **Real-time incident overview** with interactive mapping
- **Active triage queue** for immediate situational awareness
- **Live unit tracking** and deployment status
- **System health monitoring** with edge AI node status
- **Emergency statistics** including response times and unit availability

### 📍 Multi-Hazard Incident Management
- **Medical Emergencies** – Code responses, trauma assessments, patient tracking
- **Fire Incidents** – Structure fires, hazmat responses, fire prevention
- **Road Accidents** – Traffic incidents, vehicle extraction, multi-casualty coordination
- **Rescue Operations** – Water rescue, cliff rescue, confined space operations
- **Disaster Management** – Floods, earthquakes, and large-scale events

### 🤖 AI-Powered Intelligence
- **Voice Transcription & NLP Triage** – Automated severity assessment from voice reports
- **Image Analysis** – AI-verified scene documentation and hazard detection
- **Intelligent Alerts** – Priority-based notifications for dispatch centers
- **Automated Citizen Reports** – Direct emergency reporting from the public

### 🏥 Patient Care Records (PCR)
- **Digital medical tracking** with vital signs and patient history
- **Treatment logging** with timestamps and provider notes
- **AI-assisted care decisions** based on protocols and patient data
- **Secure patient data** management

### 📞 Communication Hub
- **Unified chat system** for multi-agency coordination
- **Voice and text integration** for seamless communication
- **Real-time notifications** across all emergency types

### 🏢 Station Management
- **Multi-station coordination** for large-scale incidents
- **Resource allocation** and unit management
- **Personnel tracking** and shift management
- **Comprehensive incident logging**

### 📱 Cross-Platform
- **Web Application** – Responsive React dashboard for command centers
- **Mobile Application** – React Native app for field responders
- **Adaptive UI** – Works seamlessly on desktop, tablet, and smartphone

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2** – Modern UI framework with hooks
- **Vite 4.3** – Next-generation build tool for rapid development
- **Tailwind CSS 3.3** – Utility-first styling for sleek interfaces
- **React Router 6** – Client-side routing
- **Leaflet & React-Leaflet** – Interactive mapping
- **HeroIcons & Lucide React** – Beautiful icon libraries

### Mobile
- **React Native** – Native mobile applications
- **Expo** – Development platform and build service
- **React Navigation** – Navigation patterns for mobile

### Utilities
- **date-fns** – Modern date manipulation
- **PostCSS & Autoprefixer** – Advanced CSS processing

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd CURA

# Install dependencies
npm install

# Start development server
npm run dev
```

Your application will be available at **http://localhost:5173** ✨

---

### 🔐 Web Login Credentials

**Demo accounts for testing:**

| Role | Email | Password |
|------|-------|----------|
| Command Center Admin | `admin@gmail.com` | `admin123` |
| Station Operator | `station@gmail.com` | `station123` |

Use these credentials to access different dashboard views and test various user roles.

---

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Mobile Development

```bash
cd mobile

# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run web version
npm run web
```

---

## 📂 Project Architecture

```
CURA/
├── 📄 index.html                 # Entry point
├── 📦 package.json               # Dependencies & scripts
├── ⚙️  vite.config.js            # Vite configuration
├── 🎨 tailwind.config.js         # Tailwind CSS setup
├── 📍 postcss.config.js          # PostCSS plugins
│
├── 📁 public/                    # Static assets (images, icons)
│
├── 📁 src/
│   ├── 🎨 App.jsx               # Main app component with routing
│   ├── 🎨 main.jsx              # React entry point
│   ├── 🎯 index.css             # Global styles & Tailwind imports
│   │
│   ├── 📁 components/           # Reusable UI components
│   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   ├── MapContainer.jsx     # Interactive incident map
│   │   ├── HeatmapOverlay.jsx   # Heatmap visualization
│   │   ├── IncidentCard.jsx     # Incident display cards
│   │   └── QuickStats.jsx       # Dashboard statistics
│   │
│   ├── 📁 pages/                # Page components
│   │   ├── Dashboard.jsx        # Main command center
│   │   ├── FireIncidents.jsx    # Fire incident management
│   │   ├── MedicalEmergencies.jsx # Medical calls
│   │   ├── RoadAccidents.jsx    # Traffic incidents
│   │   ├── RescueOperations.jsx # Rescue coordination
│   │   ├── PCRLog.jsx           # Patient care records
│   │   ├── SystemStatus.jsx     # Edge node monitoring
│   │   ├── StationManagement.jsx # Station operations
│   │   ├── CuraChat.jsx         # Communication hub
│   │   ├── UserSettings.jsx     # User preferences
│   │   ├── Landing.jsx          # Landing page
│   │   ├── Login.jsx            # Authentication
│   │   └── StationDashboard.jsx # Station-specific view
│   │
│   ├── 📁 constants/
│   │   └── dummyData.js         # Mock emergency data
│   │
│   ├── 📁 data/
│   │   └── mockData.js          # Additional test data
│   │
│   ├── 📁 styles/
│   │   └── leaflet-overrides.css # Leaflet customization
│   │
│   └── 📁 utils/                # Helper functions
│
└── 📁 mobile/                    # React Native mobile app
    ├── 📦 package.json
    ├── 📄 App.js
    ├── ⚙️  babel.config.js
    ├── 📁 screens/              # Mobile pages
    ├── 📁 components/           # Mobile components
    ├── 📁 constants/            # Mobile constants
    └── 📁 android/              # Android native code

```

---

## 🎮 Application Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/login` | User authentication |
| `/dashboard` | Main command center |
| `/fire` | Fire incidents tracking |
| `/medical` | Medical emergencies |
| `/accidents` | Road accidents & traffic |
| `/rescue` | Rescue operations |
| `/system` | System status & monitoring |
| `/stations` | Station management |
| `/chat` | Communication hub |
| `/settings` | User preferences |
| `/station` | Station operator dashboard |

---

## 📊 Incident Types & Priority Levels

### Incident Categories
- 🏥 **Medical** – Emergencies, trauma, health crises
- 🔥 **Fire** – Structure fires, wildfires, hazmat
- 🌊 **Flood** – Water-related disasters
- 🚗 **Traffic** – Road accidents, vehicle incidents
- 🏢 **Structural** – Building collapse, structural hazards
- 🆘 **Rescue** – High-angle, water, confined space

### Priority Levels
- 🔴 **CRITICAL** – Immediate life threat, multiple casualties
- 🟠 **HIGH** – Serious injuries or significant threat
- 🟡 **MEDIUM** – Moderate injuries or stable situation
- 🟢 **LOW** – Minor injuries or non-urgent calls

---

## 📈 Project Status

**Latest Update:** May 2026 - Post Hackathon Release  
✅ **Core Features:** All primary features completed and tested  
✅ **Web Dashboard:** Full command center with real-time incident tracking  
✅ **Mobile App:** Complete React Native app with field responder capabilities  
✅ **AI Integration:** Voice transcription and image analysis functional  
✅ **Cross-Platform:** Web, iOS, and Android support ready  

**Currently Implemented:**
- Multi-hazard incident management
- Real-time mapping and unit tracking
- AI-powered triage system
- Patient care records (PCR) management
- Inter-agency communication hub
- Station management dashboards
- Corporate and station-level analytics

---

## 🧪 Demo & Testing

CURA comes pre-populated with realistic emergency scenarios for testing and QA:

- **Active incidents** with multiple emergency types
- **AI-verified scene data** with image analysis results
- **Voice transcription samples** for NLP triage assessment
- **Emergency units** with real-time status updates
- **Patient records** with vital signs and treatment logs
- **System monitoring data** for edge AI nodes

All test data is located in `src/constants/dummyData.js` and can be easily customized.

---

## 💡 Design Philosophy

CURA's interface is built on a principle of **clarity in chaos**:

- ✅ **Clean, professional aesthetic** with clinical color palette
- ✅ **Intuitive information hierarchy** for rapid decision-making
- ✅ **Responsive design** that works on any device
- ✅ **Accessibility-first** with semantic HTML and ARIA labels
- ✅ **Dark mode ready** with Tailwind's extensible theming

### Color Palette
- **Clinical Blue** – Primary actions and positive status
- **Critical Red** – High-priority incidents and warnings
- **Warning Amber** – Medium-priority alerts
- **Success Green** – Resolved incidents and available units
- **Neutral Slate** – Clean backgrounds and borders

---

## 🤝 Contributing

This project was created for the **DevKada Online Hackathon 2026**. We welcome feedback, feature suggestions, and improvements!

### Team
- **Jashmine Verdida** – Full-stack development
- **Eijay Pepito** – Full-stack development
- **Lord Christian Beligaño** – Full-stack development

---

## 📋 Available Scripts

```bash
# Development
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build

# Code Quality
npm run lint       # Run ESLint
npm run format     # Format with Prettier
```

---

## 📜 License

MIT License © 2026 VERPTO. See LICENSE file for details.

---

## 🙏 Acknowledgments

- **DevKada Online Hackathon** – For the opportunity and platform
- **React Community** – For amazing libraries and tools
- **First Responders Everywhere** – The heroes this platform serves

---

## 📞 Support & Feedback

Have questions or suggestions? We'd love to hear from you!

---

<div align="center">

**Built with ❤️ for emergency responders everywhere**

*Making emergency coordination smarter, faster, and more coordinated.*

</div>

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