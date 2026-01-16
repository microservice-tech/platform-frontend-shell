import { Shell } from './Shell'
import type { FeatureModule } from './types'

function LandingPage() {
  return (
    <div style={{ padding: '48px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Platform Frontend Shell</h1>
      <p>Welcome to the Platform Frontend Shell. This is a public landing page.</p>
      <p>To access protected features, please log in.</p>
    </div>
  )
}

function DashboardPage() {
  return (
    <div>
      <h2>Dashboard</h2>
      <p>This is the protected dashboard view.</p>
    </div>
  )
}

const exampleModule: FeatureModule = {
  id: 'dashboard',
  name: 'Dashboard',
  requiredCapabilities: [],
  routes: [
    {
      index: true,
      element: <DashboardPage />,
    },
  ],
  menuItems: [
    {
      label: 'Dashboard',
      path: '/app',
    },
  ],
  lazy: async () => ({ default: DashboardPage }),
}

function App() {
  return (
    <Shell
      modules={[exampleModule]}
      publicRoutes={[
        {
          index: true,
          element: <LandingPage />,
        },
      ]}
      title="Platform"
    />
  )
}

export default App
