import { createGlobalStyle, ThemeProvider } from "styled-components";
import { AppProps } from "next/app";
import { Goldman, Itim, Varela_Round } from "next/font/google";

const varelaRound = Varela_Round({ subsets: ['latin'], weight: '400', style: 'normal' });
const goldman = Goldman({ subsets: ['latin'], weight: '400', style: 'normal' });
const itim = Itim({ subsets: ['latin'], weight: '400', style: 'normal' });

const GlobalStyle = createGlobalStyle`
html{
  box-sizing: border-box;
  background: #dedede;
  display:block;
  height: 100%;
  color: #565656;
  margin:15px auto;
  padding: 15px;
}

body{
  background-color:#fff;
  min-height:100vh;
  padding: 1rem;
  margin-top:0;
  font-family: ${varelaRound.style.fontFamily}, sans-serif;
}

h1{
  font-family: ${goldman.style.fontFamily}, sans-serif;
}

h2{
  font-family: ${itim.style.fontFamily}, sans-serif;
}
`;

const theme = {
  colors: {
    primary: "#aaa",
  },
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;