import {createGlobalStyle, ThemeProvider} from "styled-components";
import {AppProps} from "next/app";
import {Goldman, Itim, Varela_Round} from "next/font/google";
import {config} from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import '../react-dat-gui.css';

config.autoAddCss = false

const varelaRound = Varela_Round({subsets: ['latin'], weight: '400', style: 'normal'});
const goldman = Goldman({subsets: ['latin'], weight: '400', style: 'normal'});
const itim = Itim({subsets: ['latin'], weight: '400', style: 'normal'});

const GlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
    background: #dedede;
    display: block;
    height: 100%;
    color: #565656;
    margin: 10px auto;
    padding: 10px;
  }

  body {
    background-color: #fff;
    min-height: 100vh;
    padding: 1rem;
    margin-top: 0;
    font-family: ${varelaRound.style.fontFamily}, sans-serif;
  }

  h1 {
    font-family: ${goldman.style.fontFamily}, sans-serif;
  }

  h2 {
    font-family: ${goldman.style.fontFamily}, sans-serif;
  }

  h3 {
    font-family: ${goldman.style.fontFamily}, sans-serif;
  }
`;


const theme = {
  colors: {
    primary: "#aaa",
  },
};

function MyApp({Component, pageProps}: AppProps) {
  return (
    <>
      <GlobalStyle/>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;