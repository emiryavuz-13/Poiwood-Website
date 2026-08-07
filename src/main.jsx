import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // E-ticaret için pencere değiştikçe tekrar çekmesin
      retry: 1, // Hata olursa sadece 1 kere tekrar denesin
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);

// Uygulama ilk kez boyandıktan sonra açılış yükleme ekranını yumuşakça kaldır
const appLoader = document.getElementById('app-loader');
if (appLoader) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      appLoader.classList.add('app-loader--hidden');
      appLoader.addEventListener('transitionend', () => appLoader.remove(), { once: true });
    })
  );
}