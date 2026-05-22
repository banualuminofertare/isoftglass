/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Codul tău de verificare - IsoftGlass ERP</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={logoContainer}>
          <div style={logo}>iG</div>
        </div>
        <Heading style={h1}>Cod de verificare</Heading>
        <Text style={text}>Folosește codul de mai jos pentru a-ți confirma identitatea:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Acest cod va expira în curând. Dacă nu ai solicitat acest cod, poți ignora acest email.
        </Text>
        <Text style={footerBrand}>© IsoftGlass ERP</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { padding: '40px 25px', maxWidth: '500px', margin: '0 auto' }
const logoContainer = { textAlign: 'center' as const, marginBottom: '24px' }
const logo = {
  display: 'inline-block',
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #171d2d, #2563eb)',
  color: '#f5f8fc',
  fontSize: '20px',
  fontWeight: 'bold' as const,
  lineHeight: '48px',
  textAlign: 'center' as const,
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#171d2d',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}
const text = { fontSize: '14px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 20px' }
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#171d2d',
  margin: '0 0 30px',
  textAlign: 'center' as const,
  letterSpacing: '4px',
}
const footer = { fontSize: '12px', color: '#9ca3af', margin: '30px 0 0' }
const footerBrand = { fontSize: '12px', color: '#d1d5db', margin: '8px 0 0', textAlign: 'center' as const }
