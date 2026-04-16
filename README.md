# Skin Disease Detector UI

A React-based frontend for the Skin Disease Detector application that uses AI models for skin lesion analysis.

## Features

- **Image Upload & Capture**: Upload skin lesion images or capture using camera
- **AI Analysis**: YOLO detection + EfficientNetB3 classification
- **Symptom Checker**: Interactive chatbot for symptom verification
- **Doctor Finder**: Locate nearby dermatologists
- **Multi-language Support**: Support for multiple languages
- **Responsive Design**: Works on desktop and mobile devices

## Setup

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

The app connects to the backend API at:
```
https://kalai4114-skin-server.hf.space
```

You can override this with environment variable:
```bash
REACT_APP_API_URL=http://your-api-url npm start
```

### Running Locally

```bash
npm start
```

The app will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates an optimized build in the `build/` folder.

## Project Structure

```
src/
├── components/        # React components
│   ├── CameraCapture.js
│   ├── ChatbotAnalysis.js
│   ├── FAQ.js
│   ├── Header.js
│   ├── ResultsSection.js
│   └── ...
├── context/          # React context for state management
├── utils/            # Utility functions
├── App.js            # Main app component
└── index.js          # Entry point
```

## Technologies

- React 18
- Axios for API calls
- Tailwind CSS for styling
- React Hooks for state management

## API Endpoints

- `POST /api/predict` - Analyze skin lesion image
- `POST /api/chatbot/get-questions` - Get symptom questions
- `POST /api/chatbot/final-prediction` - Get final diagnosis
- `GET /api/faq` - Get FAQ data
- `POST /api/nearby-dermatologists` - Find nearby doctors

## License

MIT
