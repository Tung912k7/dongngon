import React from "react";
import { defineTemplate, objectToStyle } from "@ogify/core";
import { getLocalFont } from "./renderer";

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

export const getBrutalistWorkTemplate = async () => {
  // const ganhFont = await getLocalFont('fonts/Ganh Type - Regular.woff2');

  return defineTemplate({
    fonts: [
      {
        name: "Be Vietnam Pro",
        weight: 700,
        style: "normal",
      },
      /* {
        name: 'Ganh Type',
        data: ganhFont,
        weight: 400,
        style: 'normal',
      }, */
    ],
    renderer: ({ params }: { params: WorkTemplateParams }) => {
      const { title, subtitle, brandName = "Đồng ngôn", accentColor = "#D4A155" } = params;

      return `
        <div style="${objectToStyle({
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
          padding: "80px",
          border: "24px solid #000000",
          fontFamily: "Be Vietnam Pro",
        })}">
          <div style="${objectToStyle({
            position: "absolute",
            top: "60px",
            left: "60px",
            fontSize: "32px",
            fontWeight: "bold",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "Be Vietnam Pro",
          })}">
            ${brandName}
          </div>

          <div style="${objectToStyle({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "40px",
            maxWidth: "1000px",
          })}">
            ${
              subtitle
                ? `
              <div style="${objectToStyle({
                padding: "12px 24px",
                backgroundColor: "#000000",
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              })}">
                ${subtitle}
              </div>
            `
                : ""
            }

            <div style="${objectToStyle({
              fontSize: title.length > 20 ? "80px" : "110px",
              fontWeight: 900,
              lineHeight: 1.1,
              color: "#000000",
              textAlign: "center",
              textTransform: "capitalize",
              letterSpacing: "-0.02em",
            })}">
              ${title}
            </div>
          </div>
        </div>
      `;
    },
  });
};

export const getBrutalistQuoteTemplate = async () => {
  return defineTemplate({
    fonts: [
      {
        name: "Be Vietnam Pro",
        weight: 700,
        style: "normal",
      },
      {
        name: "Be Vietnam Pro",
        weight: 900,
        style: "normal",
      },
    ],
    renderer: ({ params }: { params: QuoteTemplateParams }) => {
      const { text, author, brandName = "Đồng ngôn", accentColor = "#D4A155" } = params;

      // Calculate font size based on text length to avoid overflow
      let fontSize = "72px";
      if (text.length > 250) fontSize = "42px";
      else if (text.length > 150) fontSize = "50px";
      else if (text.length > 80) fontSize = "60px";

      return `
        <div style="${objectToStyle({
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
          padding: "100px 80px",
          border: "24px solid #000000",
          fontFamily: "Be Vietnam Pro",
        })}">
          <!-- Brand -->
          <div style="${objectToStyle({
            position: "absolute",
            top: "60px",
            left: "60px",
            fontSize: "32px",
            fontWeight: "bold",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          })}">
            ${brandName}
          </div>

          <!-- Quote Content -->
          <div style="${objectToStyle({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "900px",
            flex: 1,
            marginTop: "40px",
          })}">
            <div style="${objectToStyle({
              fontSize: fontSize,
              fontWeight: 700,
              lineHeight: 1.4,
              color: "#000000",
              textAlign: "center",
              fontStyle: "italic",
            })}">
              "${text}"
            </div>
          </div>

          <!-- Author Box -->
          <div style="${objectToStyle({
            position: "absolute",
            bottom: "80px",
            right: "80px",
            display: "flex",
            alignItems: "center",
          })}">
             <div style="${objectToStyle({
               padding: "12px 30px",
               backgroundColor: accentColor,
               color: "#000000",
               fontSize: "24px",
               fontWeight: "bold",
               textTransform: "uppercase",
               letterSpacing: "0.1em",
               border: "6px solid #000000",
               boxShadow: "10px 10px 0px 0px rgba(0,0,0,1)",
             })}">
              ${author}
            </div>
          </div>
        </div>
      `;
    },
  });
};
