import { useState, useRef, useEffect } from 'react'
import { Html } from '@react-three/drei'

interface LinkItem {
  title: string
  url?: string
  description: { ja: string; en: string }
  iconSvg: string
  type: 'website' | 'github' | 'social' | 'text'
}

interface Translations {
  header: { ja: string; en: string }
  toggle: { ja: string; en: string }
}

const translations: Translations = {
  header: { ja: 'tropical-362827', en: 'tropical-362827' },
  toggle: { ja: 'EN', en: 'JA' }
}

const linkData: LinkItem[] = [
  {
    title: 'tropical-trove',
    url: 'https://tropical-362827.github.io/gallery/',
    description: {
      ja: 'シーンとキャラデータを置くギャラリーサイト',
      en: 'Gallery site for scenes and character data'
    },
    iconSvg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    type: 'website'
  },
  {
    title: 'github/tropical-362827',
    url: 'https://github.com/tropical-362827',
    description: {
      ja: '機械学習とその他趣味のプログラム',
      en: 'Programs related to machine learning and my interests'
    },
    iconSvg: '<svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
    type: 'github'
  },
  {
    title: 'github/great-majority', 
    url: 'https://github.com/great-majority',
    description: {
      ja: 'コイカツ/ハニカムにまつわるプログラム',
      en: 'Programs related to Koikatsu/HoneyCome'
    },
    iconSvg: '<svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
    type: 'github'
  },
  {
    title: 'kk-snippets',
    url: 'https://kk-snippets.streamlit.app/',
    description: {
      ja: 'ブラウザ上で動くコイカツ/ハニカムのプログラム集',
      en: 'Koikatsu/HoneyCome programs running in browser'
    },
    iconSvg: '<svg viewBox="0 0 301 165" fill="currentColor"><path d="m150.731 101.547-52.592-27.8-91.292-48.25c-.084-.083-.25-.083-.334-.083-3.333-1.584-6.75 1.75-5.5 5.083L47.53 149.139l.008.025c.05.117.092.233.142.35 1.909 4.425 6.075 7.158 10.609 8.233.383.084.657.159 1.117.251.459.102 1.1.241 1.65.283.09.008.174.008.266.016h.067c.066.009.133.009.2.017h.091c.059.008.125.008.184.008h.108c.067.009.133.009.2.009a817.728 817.728 0 0 0 177.259 0c.708 0 1.4-.034 2.066-.1l.634-.075c.025-.009.058-.009.083-.017.142-.017.283-.042.425-.067.208-.025.417-.066.625-.108.417-.092.606-.158 1.172-.353.565-.194 1.504-.534 2.091-.817.588-.283.995-.555 1.487-.863a26.566 26.566 0 0 0 1.774-1.216c.253-.194.426-.318.609-.493l-.1-.058-99.566-52.617Z"/><path d="M294.766 25.498h-.083l-91.326 48.25 50.767 75.609 46.4-118.859v-.167c1.167-3.5-2.416-6.666-5.758-4.833"/><path d="M155.598 2.556c-2.334-3.409-7.417-3.409-9.667 0L98.139 73.748l52.592 27.8 99.667 52.674c.626-.613 1.128-1.21 1.658-1.841a20.98 20.98 0 0 0 2.067-3.025l-50.767-75.608-47.758-71.192Z"/></svg>',
    type: 'website'
  },
  {
    title: 'tropical_362827',
    description: {
      ja: 'Discordのハンドルネーム',
      en: 'Discord handle'
    },
    iconSvg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/></svg>',
    type: 'text'
  },
  {
    title: 'tropical-362827',
    url: 'https://twitter.com/tropical_362827',
    description: {
      ja: 'フォローお待ちしております！',
      en: 'Follow me on Twitter/X!'
    },
    iconSvg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    type: 'social'
  }
]

function LinkCard({ link, language }: { link: LinkItem; language: 'ja' | 'en' }) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: 'clamp(12px, 3vw, 16px) 0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    opacity: isHovered ? 0.8 : 1,
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  }

  const iconContainerStyle: React.CSSProperties = {
    width: 'clamp(40px, 8vw, 48px)',
    height: 'clamp(40px, 8vw, 48px)',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 'clamp(12px, 3vw, 16px)',
    flexShrink: 0
  }

  const iconStyle: React.CSSProperties = {
    width: 'clamp(20px, 4vw, 24px)',
    height: 'clamp(20px, 4vw, 24px)',
    color: '#ffffff'
  }

  const contentStyle: React.CSSProperties = {
    flex: 1
  }

  const titleStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: 'clamp(14px, 3.5vw, 16px)',
    fontWeight: 'bold',
    marginBottom: 'clamp(2px, 1vw, 4px)',
    fontFamily: 'Arial, sans-serif'
  }

  const descriptionStyle: React.CSSProperties = {
    color: '#cccccc',
    fontSize: 'clamp(12px, 3vw, 14px)',
    lineHeight: '1.4',
    fontFamily: 'Arial, sans-serif'
  }

  const handleClick = () => {
    if (link.url) {
      window.open(link.url, '_blank')
    }
  }

  return (
    <div
      ref={cardRef}
      style={{
        ...itemStyle,
        cursor: link.url ? 'pointer' : 'default'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div style={iconContainerStyle}>
        <div 
          style={iconStyle}
          dangerouslySetInnerHTML={{ __html: link.iconSvg }}
        />
      </div>
      <div style={contentStyle}>
        <div style={titleStyle}>{link.title}</div>
        <div style={descriptionStyle}>{link.description[language]}</div>
      </div>
    </div>
  )
}

interface LinkSectionProps {
  currentBgColor: string
}


// ブラウザの言語設定を検出する関数
function detectBrowserLanguage(): 'ja' | 'en' {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en'
  return browserLang.startsWith('ja') ? 'ja' : 'en'
}

export default function LinkSection({ }: LinkSectionProps) {
  const [language, setLanguage] = useState<'ja' | 'en'>('ja')

  // 初回マウント時にブラウザの言語設定を検出
  useEffect(() => {
    const detectedLanguage = detectBrowserLanguage()
    setLanguage(detectedLanguage)
  }, [])
  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(450px, 90vw)',
    maxWidth: '450px',
    backgroundColor: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '0px',
    padding: 'clamp(16px, 4vw, 28px)',
    zIndex: 1000,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    boxSizing: 'border-box'
  }

  const headerStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: 'clamp(18px, 4vw, 20px)',
    fontWeight: 'bold',
    marginBottom: 'clamp(16px, 4vw, 20px)',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    paddingBottom: 'clamp(8px, 2vw, 12px)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  const toggleButtonStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#ffffff',
    padding: '4px 8px',
    fontSize: '12px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    fontFamily: 'Arial, sans-serif'
  }

  return (
    <Html fullscreen>
      <div style={panelStyle}>
        <div style={headerStyle}>
          <span>{translations.header[language]}</span>
          <button 
            style={toggleButtonStyle}
            onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
          >
            {translations.toggle[language]}
          </button>
        </div>
        {linkData.map((link, index) => (
          <LinkCard key={index} link={link} language={language} />
        ))}
      </div>
    </Html>
  )
}