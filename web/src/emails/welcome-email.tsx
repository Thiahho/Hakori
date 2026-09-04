import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const COLORS = {
  cream: "#efeee9",
  ink: "#14140f",
  inkSoft: "#1c1b17",
  accent: "#7c2222",
};

export type WelcomeEmailProps = {
  siteUrl: string;
  unsubscribeUrl: string;
};

export default function WelcomeEmail({
  siteUrl = "https://hakori.co",
  unsubscribeUrl = "https://hakori.co/cancelar-suscripcion",
}: WelcomeEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Estás en la lista de espera del Drop 001.</Preview>
      <Body
        style={{
          backgroundColor: COLORS.cream,
          fontFamily: "Arial, Helvetica, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px" }}>
          <Section
            style={{
              backgroundColor: COLORS.inkSoft,
              padding: "16px 24px",
              textAlign: "center" as const,
            }}
          >
            <Text
              style={{
                color: COLORS.cream,
                fontSize: 10,
                letterSpacing: 3,
                textTransform: "uppercase" as const,
                margin: 0,
              }}
            >
              Drop 001 · Japón · Edición limitada
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: COLORS.ink,
              padding: "40px 32px",
              textAlign: "center" as const,
            }}
          >
            <Heading
              as="h1"
              style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                color: COLORS.cream,
                fontSize: 28,
                lineHeight: 1.3,
                margin: 0,
              }}
            >
              Estás en la lista.
            </Heading>
            <Text
              style={{
                color: "rgba(239,238,233,0.7)",
                fontSize: 14,
                lineHeight: 1.6,
                marginTop: 16,
              }}
            >
              Te avisamos por acá, primero que a nadie, en cuanto abra el
              Drop 001: cuatro símbolos inspirados en Japón, edición limitada
              de 50 unidades por diseño.
            </Text>
          </Section>

          <Section style={{ padding: "32px 8px" }}>
            <Text
              style={{
                color: COLORS.ink,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              Mientras tanto, podés recorrer la colección y conocer la
              historia detrás de cada pieza.
            </Text>
            <Section style={{ textAlign: "center" as const, marginTop: 24 }}>
              <Link
                href={siteUrl}
                style={{
                  display: "inline-block",
                  backgroundColor: COLORS.ink,
                  color: COLORS.cream,
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: "uppercase" as const,
                  textDecoration: "none",
                  padding: "14px 28px",
                }}
              >
                Ver la colección
              </Link>
            </Section>
          </Section>

          <Hr style={{ borderColor: "rgba(20,20,15,0.1)", margin: "0 8px" }} />

          <Section style={{ padding: "24px 8px 0" }}>
            <Text
              style={{
                color: "rgba(20,20,15,0.5)",
                fontSize: 11,
                lineHeight: 1.6,
                textAlign: "center" as const,
              }}
            >
              Buenos Aires · Argentina · © 2026 Hakori.co
              <br />
              <Link
                href={`${siteUrl}/politicas/privacidad`}
                style={{ color: "rgba(20,20,15,0.5)", textDecoration: "underline" }}
              >
                Política de Privacidad
              </Link>
              {" · "}
              <Link
                href={unsubscribeUrl}
                style={{ color: "rgba(20,20,15,0.5)", textDecoration: "underline" }}
              >
                Cancelar suscripción
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
