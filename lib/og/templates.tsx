import React from 'react';
import { defineTemplate } from '@ogify/core';
import { getLocalFont } from './renderer';

export const getBrutalistWorkTemplate = async () => {
  const ganhFont = await getLocalFont('fonts/Ganh Type - Regular.woff2');

  return defineTemplate({
    fonts: [
      {
        name: 'Be Vietnam Pro',
        weight: 700,
        style: 'normal',
      },
      {
        name: 'Ganh Type',
        data: ganhFont,
        weight: 400,
        style: 'normal',
      },
    ],
    render: ({ title, subtitle, brandName = 'Đồng ngôn', accentColor = '#D4A155' }: any) => (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          padding: '80px',
          border: '24px solid #000000',
          fontFamily: 'Be Vietnam Pro',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 60,
            fontSize: 32,
            fontWeight: 'bold',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: 'Ganh Type',
          }}
        >
          {brandName}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '40px',
            maxWidth: '1000px',
          }}
        >
          {subtitle && (
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: '#000000',
                color: '#FFFFFF',
                fontSize: 24,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
              }}
            >
              {subtitle}
            </div>
          )}

          <div
            style={{
              fontSize: title.length > 20 ? 80 : 110,
              fontWeight: 900,
              lineHeight: 1.1,
              color: '#000000',
              textAlign: 'center',
              textTransform: 'capitalize',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 80,
            right: 80,
            padding: '15px 40px',
            backgroundColor: accentColor,
            color: '#000000',
            fontSize: 20,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            border: '6px solid #000000',
            boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)',
          }}
        >
          Vạn kiếp hồi thanh
        </div>
      </div>
    ),
  });
};
