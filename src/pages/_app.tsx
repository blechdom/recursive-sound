import { createGlobalStyle, ThemeProvider } from "styled-components";
import { AppProps } from "next/app";

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
  font-family:"Roboto Light", sans-serif;
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