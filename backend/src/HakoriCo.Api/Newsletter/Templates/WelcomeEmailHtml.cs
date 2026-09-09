using System.Net;

namespace HakoriCo.Api.Newsletter.Templates;

/// <summary>
/// Plain-HTML port of web/src/emails/welcome-email.tsx (react-email has no .NET
/// equivalent, so this is a manual transcription kept visually identical).
/// </summary>
public static class WelcomeEmailHtml
{
    private const string Cream = "#efeee9";
    private const string Ink = "#14140f";
    private const string InkSoft = "#1c1b17";

    public static string Build(string siteUrl, string unsubscribeUrl)
    {
        var safeSiteUrl = WebUtility.HtmlEncode(siteUrl);
        var safeUnsubscribeUrl = WebUtility.HtmlEncode(unsubscribeUrl);

        return $"""
        <!doctype html>
        <html lang="es">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Estás en la lista de espera del Drop 001.</title>
          </head>
          <body style="background-color:{Cream};font-family:Arial, Helvetica, sans-serif;margin:0;padding:0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;padding:32px 24px;">
              <tr>
                <td style="background-color:{InkSoft};padding:16px 24px;text-align:center;">
                  <p style="color:{Cream};font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0;">
                    Drop 001 · Japón · Edición limitada
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color:{Ink};padding:40px 32px;text-align:center;">
                  <h1 style="font-family:Georgia, serif;font-style:italic;color:{Cream};font-size:28px;line-height:1.3;margin:0;">
                    Estás en la lista.
                  </h1>
                  <p style="color:rgba(239,238,233,0.7);font-size:14px;line-height:1.6;margin-top:16px;">
                    Te avisamos por acá, primero que a nadie, en cuanto abra el
                    Drop 001: cuatro símbolos inspirados en Japón, edición limitada
                    de 50 unidades por diseño.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 8px;">
                  <p style="color:{Ink};font-size:14px;line-height:1.6;">
                    Mientras tanto, podés recorrer la colección y conocer la
                    historia detrás de cada pieza.
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="text-align:center;margin-top:24px;">
                    <tr>
                      <td>
                        <a href="{safeSiteUrl}" style="display:inline-block;background-color:{Ink};color:{Cream};font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 28px;">
                          Ver la colección
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 8px;">
                  <hr style="border-color:rgba(20,20,15,0.1);margin:0;" />
                </td>
              </tr>
              <tr>
                <td style="padding:24px 8px 0;">
                  <p style="color:rgba(20,20,15,0.5);font-size:11px;line-height:1.6;text-align:center;">
                    Buenos Aires · Argentina · © 2026 Hakori.co
                    <br />
                    <a href="{safeSiteUrl}/politicas/privacidad" style="color:rgba(20,20,15,0.5);text-decoration:underline;">Política de Privacidad</a>
                    ·
                    <a href="{safeUnsubscribeUrl}" style="color:rgba(20,20,15,0.5);text-decoration:underline;">Cancelar suscripción</a>
                  </p>
                </td>
              </tr>
            </table>
          </body>
        </html>
        """;
    }
}
