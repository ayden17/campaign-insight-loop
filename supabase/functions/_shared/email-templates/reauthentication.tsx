/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your AngelFlows verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandSection}>
          <Text style={brand}>AngelFlows</Text>
        </Section>
        <Hr style={hr} />
        <Heading style={h1}>Confirm reauthentication</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const brandSection = { padding: '0 0 16px' }
const brand = { fontSize: '18px', fontWeight: 'bold' as const, color: '#171717', letterSpacing: '-0.02em', margin: '0' }
const hr = { borderColor: '#e5e5e5', margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#171717', margin: '0 0 16px', letterSpacing: '-0.01em' }
const text = { fontSize: '14px', color: '#737373', lineHeight: '1.6', margin: '0 0 24px' }
const codeStyle = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '28px', fontWeight: 'bold' as const, color: '#171717', letterSpacing: '0.1em', margin: '0 0 32px', padding: '16px 20px', backgroundColor: '#f5f5f5', borderRadius: '8px', textAlign: 'center' as const }
const footer = { fontSize: '12px', color: '#a3a3a3', margin: '32px 0 0', lineHeight: '1.5' }
