# IoT Workshop Mobile App

A modern React Native mobile application built with Expo for managing IoT channels, readings, and workflows.

## Features

- 📱 **Cross-platform**: Runs on iOS, Android, and Web
- 📊 **Real-time Data**: Auto-refreshing sensor readings
- 📈 **Charts**: Interactive Victory charts for data visualization
- ⚙️ **Workflows**: Create webhook-based automation
- 💾 **Persistence**: Local storage of channels with AsyncStorage
- 🎨 **Modern UI**: Clean and intuitive interface

## Technology Stack

- **Expo SDK 52** - Latest stable release
- **Expo Router 4** - File-based navigation
- **TanStack Query v5** - Data fetching and caching
- **Victory Native** - Chart library
- **Axios** - HTTP client
- **TypeScript** - Type safety

## Prerequisites

- Node.js 20.19.4 or higher
- npm or yarn
- Expo Go app (for physical device testing)

## Installation

```bash
cd mobile
npm install
```

## Configuration

Update the API URL in `app/config.ts`:

```typescript
export const API_BASE_URL = 'http://localhost:8080';
```

For physical devices, use your computer's local IP address or ngrok:

- iOS Simulator: `http://localhost:8080`
- Android Emulator: `http://10.0.2.2:8080`
- Physical Device: `http://YOUR_LOCAL_IP:8080`

## Running the App

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Project Structure

```
mobile/
├── app/
│   ├── _layout.tsx         # Root layout with providers
│   ├── index.tsx           # Home screen (channel creation)
│   ├── config.ts           # API configuration
│   ├── workflows.tsx       # Workflows screen
│   ├── services/
│   │   └── api.ts          # API client and types
│   └── channel/
│       └── [id].tsx        # Channel detail screen
├── __tests__/              # Test files
└── package.json
```

## Features Guide

### Creating a Channel

1. Enter channel name and description
2. Specify allowed fields (comma-separated)
3. Tap "Create Channel"
4. Channel ID and API key will be generated

### Viewing Data

1. Select a channel from the list
2. View latest readings in real-time
3. Select fields to chart
4. Pull to refresh

### Creating Workflows

1. Tap "Manage Workflows" from channel detail
2. Define rule (field, operator, value)
3. Enter webhook URL
4. Tap "Create Workflow"

## API Integration

The app integrates with the IoT Workshop backend API:

- `POST /api/channels` - Create channel
- `GET /api/channels/:id` - Get channel details
- `POST /api/channels/:id/keys` - Generate API key
- `GET /api/readings/latest` - Get latest reading
- `GET /api/charts/series` - Get chart data
- `POST /api/workflows` - Create workflow
- `GET /api/workflows` - List workflows

## Troubleshooting

### Cannot connect to API

- Ensure backend is running on the correct port
- Check firewall settings
- For physical devices, ensure they're on the same network
- Consider using ngrok for remote testing

### Dependencies Issues

```bash
# Clear cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
```

### Metro bundler issues

```bash
# Reset Metro bundler
npx expo start -c
```

## Building for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

Refer to [Expo documentation](https://docs.expo.dev/build/introduction/) for detailed build instructions.
