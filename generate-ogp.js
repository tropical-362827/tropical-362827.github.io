#!/usr/bin/env node
/**
 * OGP画像生成スクリプト（Node.js版）
 * tropical-362827.github.ioのサイト背景をベースにしたOGP画像をSVGで生成し、PlaywrightでPNGに変換する
 */

const fs = require('fs');
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const seedrandom = require('seedrandom');

// ======== マジックナンバー（調整可能なパラメータ） ========

// 画像サイズ
const WIDTH = 1200;
const HEIGHT = 630;

// 背景色
const BACKGROUND_COLOR = "#000000"; // 黒色

// 星の設定
const STAR_CONFIG = {
    // O型主系列星
    bright_o: {
        count: 5,
        size_min: 2.0,
        size_max: 2.2,
        opacity_min: 0.6,
        opacity_max: 1.0,
        color: "blue"
    },
    // 明るい星（大きめ）
    bright: {
        count: 100,
        size_min: 1.2,
        size_max: 1.8,
        opacity_min: 0.6,
        opacity_max: 1.0,
        color: "white"
    },
    // 中程度の星
    medium: {
        count: 500,
        size_min: 1.0,
        size_max: 1.2,
        opacity_min: 0.5,
        opacity_max: 0.7,
        color: "white"
    },
    // 小さい星（数多く）
    small: {
        count: 1200,
        size_min: 0.7,
        size_max: 0.9,
        opacity_min: 0.2,
        opacity_max: 0.5,
        color: "white"
    }
};

// テキスト設定
const TEXT_CONFIG = {
    text: "tropical-362827",
    font_size: 90,
    font_family: "'Source Code Pro', monospace",
    google_fonts_url: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200;1,200&display=swap",
    color: "#ffffff",
    stroke_color: "#ffffff",
    stroke_width: 1,
    opacity: 0.9,
    x: WIDTH - 50,
    y: HEIGHT - 50
};

// 出力ファイル名
const OUTPUT_SVG_FILE = "ogp-image-generated.svg";
const OUTPUT_PNG_FILE = "ogp-image.png";

// ======== Git関数 ========

/**
 * 最新コミットハッシュ（短縮版）を取得する
 * @param {string} fallback フォールバック値
 * @returns {string} コミットハッシュまたはフォールバック値
 */
function getCommitHash(fallback = 'dev') {
    try {
        const hash = execSync('git rev-parse --short HEAD', { 
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'] // stderrを無視
        }).trim();
        return hash;
    } catch (error) {
        console.warn('Gitコミットハッシュの取得に失敗しました。フォールバック値を使用:', fallback);
        return fallback;
    }
}

// SVGテンプレート
const SVG_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="{{width}}" height="{{height}}" viewBox="0 0 {{width}} {{height}}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Google Fonts のインポート -->
    <style>
      @import url('{{font_url}}');
    </style>
    <!-- ネオンのグロー効果 -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- 縦分割の色相帯（24分割） -->
  {{color_strips}}
  
  <!-- 星フィールド -->
  {{stars}}
  
  <!-- テキストの背景 -->
  <rect width="{{width}}" height="{{text_bg_height}}" y="{{text_bg_y}}" fill="#2a2b2e" opacity="0.8" />

  <!-- 中央のテキスト -->
  <text x="{{text_x}}" y="{{text_y}}" 
        font-family="{{text_font_family}}" 
        font-size="{{text_font_size}}" 
        fill="{{text_color}}" 
        stroke="{{text_stroke_color}}" 
        stroke-width="{{text_stroke_width}}" 
        opacity="{{text_opacity}}" 
        text-anchor="end" 
        dominant-baseline="text-bottom">{{text_content}}</text>

  <!-- コミットハッシュ（左下） -->
  <text x="{{commit_x}}" y="{{commit_y}}" 
        font-family="{{commit_font_family}}" 
        font-size="{{commit_font_size}}" 
        fill="{{commit_color}}" 
        opacity="{{commit_opacity}}" 
        text-anchor="start" 
        dominant-baseline="text-bottom">commit: {{commit_hash}}</text>
  
</svg>`;

// ======== 星生成関数 ========

/**
 * 指定された設定で星を生成する（確定的）
 * @param {Object} config 星の設定辞書
 * @param {function} rng シード固定された乱数生成器
 * @param {string} configName 設定名（乱数シードの多様性のため）
 * @returns {Array} 星のデータ配列
 */
function generateStars(config, rng, configName) {
    const stars = [];
    for (let i = 0; i < config.count; i++) {
        // 確定的なランダム位置
        const x = rng() * WIDTH;
        const y = rng() * HEIGHT;
        
        // 確定的なランダムサイズ
        const radius = rng() * (config.size_max - config.size_min) + config.size_min;
        
        // 確定的なランダム透明度
        const opacity = rng() * (config.opacity_max - config.opacity_min) + config.opacity_min;
        
        stars.push({
            x: x,
            y: y,
            radius: radius,
            opacity: opacity,
            color: config.color
        });
    }
    return stars;
}

// ======== テンプレート処理関数 ========

/**
 * 簡単なテンプレート置換（Jinja2風）
 * @param {string} template テンプレート文字列
 * @param {Object} data 置換データ
 * @returns {string} 置換後の文字列
 */
function renderTemplate(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
}

/**
 * HTMLエスケープ
 * @param {string} text エスケープ対象文字列
 * @returns {string} エスケープ後文字列
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ======== SVG生成関数 ========

/**
 * SVGコードを生成する
 * @param {string} commitHash コミットハッシュ（オプション）
 * @returns {string} SVGコード
 */
function generateSvg(commitHash = null) {
    // コミットハッシュを取得（引数で指定されていない場合）
    let actualCommitHash = commitHash || getCommitHash();
    
    // ハッシュが長い場合は短縮版に切り捨て（7文字）
    if (actualCommitHash && actualCommitHash.length > 7) {
        actualCommitHash = actualCommitHash.substring(0, 7);
    }
    
    // コミットハッシュをシードとして乱数生成器を初期化
    const rng = seedrandom(actualCommitHash);
    
    // 全ての星を生成（確定的）
    const allStars = [];
    for (const [configName, config] of Object.entries(STAR_CONFIG)) {
        const stars = generateStars(config, rng, configName);
        allStars.push(...stars);
    }
    
    // 星のSVG要素を生成
    const starsHtml = allStars.map(star => 
        `<circle cx="${star.x.toFixed(1)}" cy="${star.y.toFixed(1)}" r="${star.radius.toFixed(1)}" fill="${star.color}" opacity="${star.opacity.toFixed(2)}" />`
    ).join('\n  ');
    
    // 24分割の色相帯を生成
    const stripCount = 12;
    const stripWidth = WIDTH / stripCount;
    const colorStrips = [];
    
    for (let i = 0; i < stripCount; i++) {
        const x = stripWidth * i;
        const hue = (360 / stripCount) * i; // 15度ずつ
        colorStrips.push(
            `<rect x="${x}" y="0" width="${stripWidth}" height="${HEIGHT}" fill="hsl(${hue}, 60%, 20%)" />`
        );
    }
    
    // テンプレートデータを準備
    const templateData = {
        width: WIDTH,
        height: HEIGHT,
        background_color: BACKGROUND_COLOR,
        font_url: escapeHtml(TEXT_CONFIG.google_fonts_url),
        stars: starsHtml,
        // 24分割の色相帯
        color_strips: colorStrips.join('\n  '),
        // テキスト背景設定
        text_bg_height: HEIGHT / 4,
        text_bg_y: HEIGHT - (HEIGHT / 4),
        text_x: TEXT_CONFIG.x,
        text_y: TEXT_CONFIG.y,
        text_font_family: TEXT_CONFIG.font_family,
        text_font_size: TEXT_CONFIG.font_size,
        text_color: TEXT_CONFIG.color,
        text_stroke_color: TEXT_CONFIG.stroke_color,
        text_stroke_width: TEXT_CONFIG.stroke_width,
        text_opacity: TEXT_CONFIG.opacity,
        text_content: TEXT_CONFIG.text,
        // コミットハッシュ設定
        commit_x: WIDTH - 220,
        commit_y: HEIGHT - 5,
        commit_font_family: "'Source Code Pro', monospace",
        commit_font_size: 24,
        commit_color: "#888888",
        commit_opacity: 0.7,
        commit_hash: actualCommitHash
    };
    
    // テンプレートを使ってSVGを生成
    return renderTemplate(SVG_TEMPLATE, templateData);
}

// ======== PNG変換関数 ========

/**
 * PlaywrightでSVGをPNGに変換する
 * @param {string} svgFile SVGファイルパス
 * @param {string} pngFile PNGファイルパス
 */
async function convertSvgToPng(svgFile, pngFile) {
    try {
        console.log('Playwrightでブラウザを起動中...');
        const browser = await chromium.launch();
        const page = await browser.newPage();
        
        // ビューポートサイズを設定
        await page.setViewportSize({ width: WIDTH, height: HEIGHT });
        
        // SVGファイルを読み込んでHTMLに埋め込み
        const svgContent = fs.readFileSync(svgFile, 'utf8');
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; padding: 0; background: black; }
        svg { display: block; }
    </style>
</head>
<body>
${svgContent}
</body>
</html>`;
        
        await page.setContent(htmlContent);
        
        // フォントの読み込みを待つ
        await page.waitForTimeout(2000);
        
        // スクリーンショットを撮影
        await page.screenshot({ 
            path: pngFile,
            clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT }
        });
        
        await browser.close();
        console.log(`PNG画像を生成しました: ${pngFile}`);
        return true;
    } catch (error) {
        console.error('PNG変換に失敗しました:', error);
        return false;
    }
}

// ======== メイン処理 ========

async function main() {
    console.log("OGP画像を生成中...");
    
    // 引数からコミットハッシュを取得（オプション）
    const args = process.argv.slice(2);
    const commitHashArg = args.find(arg => arg.startsWith('--commit='));
    const commitHash = commitHashArg ? commitHashArg.split('=')[1] : null;
    
    // SVGを生成
    const svgContent = generateSvg(commitHash);
    
    // 実際に使用されたコミットハッシュを取得（短縮版）
    let actualCommitHash = commitHash || getCommitHash();
    if (actualCommitHash && actualCommitHash.length > 7) {
        actualCommitHash = actualCommitHash.substring(0, 7);
    }
    
    // SVGファイルに保存
    fs.writeFileSync(OUTPUT_SVG_FILE, svgContent, 'utf8');
    console.log(`SVG画像を生成しました: ${OUTPUT_SVG_FILE}`);
    
    // PNGに変換
    const success = await convertSvgToPng(OUTPUT_SVG_FILE, OUTPUT_PNG_FILE);
    
    if (success) {
        // 統計情報を表示
        const totalStars = Object.values(STAR_CONFIG).reduce((sum, config) => sum + config.count, 0);
        console.log(`生成された星の総数: ${totalStars}`);
        console.log(`背景色: ${BACKGROUND_COLOR}`);
        console.log(`画像サイズ: ${WIDTH}x${HEIGHT}px`);
        console.log(`コミットハッシュ: ${actualCommitHash}`);
        
        console.log("\n📝 OGP使用について:");
        console.log(`・SVGファイル: ${OUTPUT_SVG_FILE}`);
        console.log(`・PNGファイル: ${OUTPUT_PNG_FILE}`);
    }
}

// スクリプトとして実行された場合のみmainを呼び出し
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { generateSvg, convertSvgToPng };