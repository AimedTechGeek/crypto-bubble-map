# 🫧 Interactive Bubble Map Visualization

An interactive, scalable bubble chart application built with **Next.js**, **D3.js**, and **React**. This application visualizes data points as bubbles with dynamic sizing, colors, and navigation capabilities. Perfect for displaying financial data, geographic information, or any dataset where relationships and values need visual representation.

## 🌟 Features

- **Interactive Bubble Visualization**: Dynamic D3.js-powered bubble chart with zoom, pan, and collision detection
- **Multi-Data Source Support**: Built-in API integrations for cryptocurrencies, stocks, weather, and cities
- **Single-Click Functionality**: Click any bubble to copy data AND navigate to related website
- **Real-time Data Integration**: Extensible API service layer for connecting external data sources
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Type-Based Styling**: Different colors and visual styles based on bubble data type
- **Extensible Architecture**: Clean separation of concerns following SOLID principles

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd crypto-bubble-map

# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.local.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Architecture Overview

This application follows a **layered architecture** with clear separation of concerns, implementing **Single Responsibility Principle (SRP)** throughout:

```
┌─────────────────┐
│   UI Layer      │  ← Components, Pages, Styles
├─────────────────┤
│  Business Logic │  ← Custom Hooks, State Management
├─────────────────┤
│  Service Layer  │  ← API Integration, External Calls
├─────────────────┤
│  Utility Layer  │  ← Helpers, Interactions, Data Processing
├─────────────────┤
│   Data Layer    │  ← Constants, Configurations
└─────────────────┘
```

## 📁 Project Structure

```
crypto-bubble-map/
├── 📁 components/          # UI Components (Presentation Layer)
│   ├── BubbleChart.js      # D3.js visualization component
│   ├── Controls.js         # User interface controls
│   ├── ApiControls.js      # API integration controls
│   └── BubbleInstructions.js # User guidance component
│
├── 📁 hooks/               # Custom React Hooks (Business Logic)
│   ├── useBubbleState.js   # Bubble state management
│   ├── useExternalBubbleEvents.js # Event handling
│   └── useApiIntegration.js # API integration logic
│
├── 📁 services/            # External Service Integration
│   └── apiService.js       # API calls and data transformation
│
├── 📁 utils/               # Utility Functions
│   ├── bubbleApi.js        # Event broadcasting utilities
│   ├── bubbleInteractions.js # Click handling and feedback
│   └── dataGenerators.js   # Random data generation
│
├── 📁 constants/           # Application Constants
│   └── sampleData.js       # Static sample data
│
├── 📁 pages/               # Next.js Pages
│   ├── index.js            # Main application page
│   ├── _app.js             # App configuration
│   └── api/                # API routes
│
└── 📁 styles/              # Styling
    └── globals.css         # Global styles (Tailwind CSS)
```

## 🧩 Layer-by-Layer Architecture

### 1. **UI Layer** (`/components`)
**Responsibility**: Pure presentation components with minimal business logic

- **`BubbleChart.js`**: D3.js visualization engine
  - Handles SVG rendering, zoom/pan interactions
  - Manages bubble positioning with force simulation
  - Applies visual styling based on data types
  
- **`Controls.js`**: User interface for data manipulation
  - Form handling for manual bubble creation
  - Integration with API controls and instructions
  
- **`ApiControls.js`**: Interface for external data integration
  - Buttons for triggering different API calls
  - Loading states and error handling UI

### 2. **Business Logic Layer** (`/hooks`)
**Responsibility**: Application state management and business rules

- **`useBubbleState.js`**: Core bubble data management
  ```javascript
  // Usage example
  const { mapData, addOrUpdateBubble, clearBubbles } = useBubbleState([]);
  ```

- **`useExternalBubbleEvents.js`**: Event-driven bubble creation
  ```javascript
  // Usage example
  useExternalBubbleEvents(onAddBubble, [mapData]);
  ```

- **`useApiIntegration.js`**: API integration with error handling
  ```javascript
  // Usage example
  const { fetchCryptoData, isLoading, error } = useApiIntegration();
  ```

### 3. **Service Layer** (`/services`)
**Responsibility**: External API integration and data transformation

- **`apiService.js`**: Centralized API management
  ```javascript
  // Supports multiple data sources
  await apiService.fetchCryptoData(['bitcoin', 'ethereum']);
  await apiService.fetchStockData(['AAPL', 'GOOGL']);
  
  // Custom API integration
  await apiService.fetchAndAddBubble(url, transformerFunction);
  ```

### 4. **Utility Layer** (`/utils`)
**Responsibility**: Pure functions and interaction handling

- **`bubbleInteractions.js`**: Click handling and visual feedback
- **`dataGenerators.js`**: Random data generation utilities
- **`bubbleApi.js`**: Event broadcasting for external integration

### 5. **Data Layer** (`/constants`)
**Responsibility**: Static data and configuration

- **`sampleData.js`**: Default dataset for initialization

## 🔌 Adding New Data Sources

### Example: Adding Weather Data Integration

#### 1. **Extend the API Service** (`/services/apiService.js`)

```javascript
// Add new method to apiService.js
async fetchWeatherData(cities = ['London', 'Tokyo', 'NewYork']) {
    try {
        const promises = cities.map(city => 
            this.fetchSingleWeather(city)
        );
        
        const weatherData = await Promise.all(promises);
        
        weatherData.forEach(weather => {
            if (weather) {
                const bubbleData = this.transformWeatherToBubble(weather);
                triggerAddBubble(bubbleData);
            }
        });
        
        return weatherData;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

async fetchSingleWeather(city) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`
    );
    return response.json();
}

transformWeatherToBubble(weather) {
    return {
        name: weather.name,
        value: Math.round(weather.main.temp), // Temperature as bubble size
        type: 'weather',
        url: `https://weather.com/weather/today/l/${weather.coord.lat},${weather.coord.lon}`,
        metadata: {
            temperature: weather.main.temp,
            humidity: weather.main.humidity,
            description: weather.weather[0].description,
            country: weather.sys.country
        }
    };
}
```

#### 2. **Add UI Controls** (`/components/ApiControls.js`)

```javascript
const handleFetchWeather = async () => {
    setIsLoading(true);
    try {
        await apiService.fetchWeatherData(['London', 'Tokyo', 'Mumbai']);
        setLastApiCall('Weather data fetched and bubbles added!');
    } catch (error) {
        setLastApiCall(`Error: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
};

// Add button in JSX
<button
    onClick={handleFetchWeather}
    disabled={isLoading}
    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md"
>
    {isLoading ? 'Loading...' : 'Fetch Weather Data'}
</button>
```

#### 3. **Update Visual Styling** (`/components/BubbleChart.js`)

```javascript
// Add weather color scheme in getColorScale function
case 'weather':
    return d3.scaleSequential(d3.interpolateCool).domain([d3.max(data, d => d.value), 0]);

// Add weather stroke color
case 'weather': return '#0ea5e9'; // Sky blue
```

#### 4. **Add Environment Variables** (`.env.local`)

```bash
NEXT_PUBLIC_WEATHER_API_KEY=your_openweather_api_key_here
NEXT_PUBLIC_WEATHER_API_URL=https://api.openweathermap.org/data/2.5
```

### 🚀 Adding Any New Service

Follow this pattern for any new data source:

1. **API Integration**: Add methods to `apiService.js`
2. **Data Transformation**: Create `transform[Service]ToBubble()` function
3. **UI Controls**: Add buttons/forms in `ApiControls.js`
4. **Visual Styling**: Update color schemes and styles
5. **Environment Config**: Add necessary API keys
6. **Type Support**: Update tooltips and instructions

## 🎨 Bubble Data Format

All bubbles follow this standardized format:

```javascript
{
    name: "Display Name",           // Required: Bubble label
    value: 50,                      // Required: Determines bubble size
    type: "crypto|stock|city|weather|custom", // Determines visual styling
    url: "https://example.com",     // Optional: Click destination
    metadata: {                     // Optional: Additional information
        price: 45000,
        change24h: 2.5,
        description: "Additional info"
    }
}
```

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎯 Key Design Patterns

### 1. **Single Responsibility Principle**
Each module has one clear purpose and reason to change.

### 2. **Event-Driven Architecture**
Components communicate through custom events, enabling loose coupling.

### 3. **Factory Pattern**
API service uses factory methods for different data transformations.

### 4. **Observer Pattern**
External modules can trigger bubble creation through event broadcasting.

### 5. **Strategy Pattern**
Different visual styling strategies based on bubble type.

## 🌐 API Integration Examples

### Cryptocurrency Integration
```javascript
// CoinGecko API integration
await apiService.fetchCryptoData(['bitcoin', 'ethereum', 'cardano']);
```

### Stock Market Integration
```javascript
// Stock API integration
await apiService.fetchStockData(['AAPL', 'GOOGL', 'MSFT']);
```

### Custom API Integration
```javascript
// Any REST API
await apiService.fetchAndAddBubble(
    'https://your-api.com/data',
    (data) => ({
        name: data.title,
        value: data.score,
        type: 'custom',
        url: data.link
    })
);
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Visualization**: D3.js 7
- **State Management**: React Hooks, Custom Hooks
- **HTTP Client**: Fetch API
- **Development**: ESLint, PostCSS

## 📱 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the established architecture patterns
4. Ensure all layers remain decoupled
5. Add appropriate tests
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using modern web technologies and clean architecture principles**
