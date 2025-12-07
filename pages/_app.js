// pages/_app.js
import '../styles/globals.css'; // <- critical: path from pages/
export default function App({ Component, pageProps }) {
    return <Component {...pageProps} />
}
