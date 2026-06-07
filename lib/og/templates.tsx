import { defineTemplate, objectToStyle } from "@ogify/core";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

interface WorkTemplateParams {
  title: string;
  subtitle?: string;
  brandName?: string;
  accentColor?: string;
}

interface QuoteTemplateParams {
  text: string;
  author: string;
  brandName?: string;
  accentColor?: string;
}

// Helper to get local font as ArrayBuffer
async function getLocalFont(fontPath: string): Promise<ArrayBuffer> {
  const absolutePath = join(process.cwd(), "public", fontPath);
  const buffer = await readFile(absolutePath);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

export const getBrutalistWorkTemplate = async () => {
  const ganhFont = await getLocalFont("fonts/Ganh Type - Regular.woff2");

  return defineTemplate({
    fonts: [
      {
        name: "Ganh Type",
        data: ganhFont,
        weight: 400,
        style: "normal",
      },
      {
        name: "Be Vietnam Pro",
        weight: 700,
        style: "normal",
      },
    ],
    renderer: ({ params }: { params: WorkTemplateParams }) => {
      const { title, subtitle, brandName = "Đồng ngôn" } = params;

      return `
        <div style="${objectToStyle({
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FAF9F6", // Warm Bone
          padding: "70px 80px",
          fontFamily: "Be Vietnam Pro",
          position: "relative",
        })}">
          <!-- Fine Inner Border Frame -->
          <div style="${objectToStyle({
            position: "absolute",
            top: "30px",
            left: "30px",
            right: "30px",
            bottom: "30px",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            pointerEvents: "none",
          })}"></div>

          <!-- Top Bar -->
          <div style="${objectToStyle({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          })}">
            <div style="${objectToStyle({
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#111111",
            })}">
              ${brandName}
            </div>
            <div style="${objectToStyle({
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              color: "#787774",
            })}">
              KHO TÀNG VĂN HỌC VIỆT
            </div>
          </div>

          <!-- Center/Left Asymmetric Content -->
          <div style="${objectToStyle({
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "24px",
            maxWidth: "960px",
            marginTop: "40px",
            marginBottom: "40px",
          })}">
            ${
              subtitle
                ? `
              <div style="${objectToStyle({
                padding: "6px 14px",
                backgroundColor: "#EDF3EC", // Pale Green Pastel
                color: "#346538", // Deep Green text
                fontSize: "16px",
                fontWeight: 700,
                borderRadius: "4px",
                border: "1px solid rgba(52, 101, 56, 0.1)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              })}">
                ${subtitle}
              </div>
            `
                : ""
            }

            <div style="${objectToStyle({
              fontSize: title.length > 25 ? "72px" : "90px",
              fontWeight: 400,
              lineHeight: 1.15,
              color: "#111111",
              textAlign: "left",
              fontFamily: "Ganh Type",
              letterSpacing: "-0.02em",
            })}">
              ${title}
            </div>
          </div>

          <!-- Bottom Footer -->
          <div style="${objectToStyle({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            borderTop: "1px solid rgba(0, 0, 0, 0.06)",
            paddingTop: "24px",
          })}">
            <div style="${objectToStyle({
              fontSize: "14px",
              fontFamily: "monospace",
              color: "#787774",
            })}">
              dongngon.vercel.app
            </div>
            <div style="${objectToStyle({
              fontSize: "14px",
              fontWeight: 500,
              color: "#787774",
            })}">
              Trang 01 / 01
            </div>
          </div>
        </div>
      `;
    },
  });
};

export const getBrutalistQuoteTemplate = async () => {
  const ganhFont = await getLocalFont("fonts/Ganh Type - Regular.woff2");

  return defineTemplate({
    fonts: [
      {
        name: "Ganh Type",
        data: ganhFont,
        weight: 400,
        style: "normal",
      },
      {
        name: "Be Vietnam Pro",
        weight: 700,
        style: "normal",
      },
    ],
    renderer: ({ params }: { params: QuoteTemplateParams }) => {
      const { text, author, brandName = "Đồng ngôn", accentColor = "#D4A155" } = params;

      // Calculate font size based on text length to avoid overflow
      let fontSize = "72px";
      if (text.length > 250) fontSize = "38px";
      else if (text.length > 150) fontSize = "46px";
      else if (text.length > 80) fontSize = "56px";

      return `
        <div style="${objectToStyle({
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F7F6F3", // Bone
          padding: "70px 80px",
          fontFamily: "Be Vietnam Pro",
          position: "relative",
        })}">
          <!-- Fine Inner Border Frame -->
          <div style="${objectToStyle({
            position: "absolute",
            top: "30px",
            left: "30px",
            right: "30px",
            bottom: "30px",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            pointerEvents: "none",
          })}"></div>

          <!-- Top Bar -->
          <div style="${objectToStyle({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          })}">
            <div style="${objectToStyle({
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#111111",
            })}">
              ${brandName}
            </div>
            <div style="${objectToStyle({
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              color: "#787774",
            })}">
              TRÍCH DẪN HAY
            </div>
          </div>

          <!-- Main Quote (Left-aligned & elegant) -->
          <div style="${objectToStyle({
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "28px",
            maxWidth: "960px",
            marginTop: "30px",
            marginBottom: "30px",
          })}">
            <!-- Giant Quote Mark -->
            <div style="${objectToStyle({
              fontSize: "120px",
              fontFamily: "Ganh Type",
              color: "rgba(0, 0, 0, 0.08)",
              height: "40px",
              lineHeight: "40px",
              marginBottom: "-20px",
            })}">
              “
            </div>

            <div style="${objectToStyle({
              fontSize: fontSize,
              fontWeight: 400,
              lineHeight: 1.35,
              color: "#111111",
              textAlign: "left",
              fontFamily: "Ganh Type",
            })}">
              ${text}
            </div>
          </div>

          <!-- Author and Footer signature -->
          <div style="${objectToStyle({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            borderTop: "1px solid rgba(0, 0, 0, 0.06)",
            paddingTop: "24px",
          })}">
            <div style="${objectToStyle({
              display: "flex",
              alignItems: "center",
              gap: "12px",
            })}">
              <div style="${objectToStyle({
                width: "3px",
                height: "20px",
                backgroundColor: accentColor,
              })}"></div>
              <div style="${objectToStyle({
                fontSize: "16px",
                fontWeight: 700,
                color: "#111111",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              })}">
                ${author}
              </div>
            </div>
            
            <div style="${objectToStyle({
              fontSize: "14px",
              fontFamily: "monospace",
              color: "#787774",
            })}">
              dongngon.vercel.app
            </div>
          </div>
        </div>
      `;
    },
  });
};
