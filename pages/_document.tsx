import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <link rel='manifest' href='/manifest.json' />
        <link rel='apple-touch-icon' href='/icon.png'></link>
        <meta name='theme-color' content='#fff' />
      </Head>
      <body>
        <script src='https://code.responsivevoice.org/responsivevoice.js?key=hvqP4o08'></script>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
