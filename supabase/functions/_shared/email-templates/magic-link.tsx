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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your AngelFlows login link</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandSection}>
          <Text style={brand}>AngelFlows</Text>
        </Section>
        <Hr style={hr} />
        <Heading style={h1}>Sign in to AngelFlows</Heading>
        <Text style={text}>
          Click the button below to log in. This link will expire shortly.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={confirmationUrl}>
            Sign in
          </Button>
        </Section>
        <Text style={footer}>
          If you didn't request this link, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
