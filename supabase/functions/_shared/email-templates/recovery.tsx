/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your AngelFlows password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandSection}>
          <Text style={brand}>AngelFlows</Text>
        </Section>
        <Hr style={hr} />
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your AngelFlows password. Click the
          button below to choose a new one.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={confirmationUrl}>
            Reset password
          </Button>
        </Section>
        <Text style={footer}>
          If you didn't request a password reset, you can safely ignore this
          email — your password will not be changed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const brandSection = { padding: '0 0 16px' }
const brand = { fontSize: '18px', fontWeight: 'bold' as const, color: '#171717', letterSpacing: '-0.02em', margin: '0' }
const hr = { borderColor: '#e5e5e5', margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#171717', margin: '0 0 16px', letterSpacing: '-0.01em' }
const text = { fontSize: '14px', color: '#737373', lineHeight: '1.6', margin: '0 0 24px' }
const buttonContainer = { margin: '0 0 24px' }
const button = { backgroundColor: '#171717', color: '#ffffff', fontSize: '14px', fontWeight: '500' as const, borderRadius: '8px', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#a3a3a3', margin: '32px 0 0', lineHeight: '1.5' }
