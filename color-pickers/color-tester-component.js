class ColorTesterComponent extends HTMLElement {
    constructor() {
      super();
  
      // Shadow DOMを作成し、カプセル化
      const shadow = this.attachShadow({ mode: 'open' });
  
      // --------------------------------------------------
      // 1. スタイルの定義 (元のCSSをShadow DOM内で適用)
      // --------------------------------------------------
      const style = document.createElement('style');
      style.textContent = `
        :host {
          /* Web Component自体（<color-tester-component>）のスタイル */
          display: flex; /* コンポーネント自体をflexアイテムとして扱う */
          justify-content: center;
          align-items: center;
          min-height: 100vh; /* 必要に応じて調整 */
          margin: 0;
          font-family: "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", Meiryo, メイリオ, Osaka, "ＭＳ Ｐゴシック", "MS PGothic", sans-serif;
          font-weight: bold;
          font-size: 1em; /* デフォルトのフォントサイズ */
          transition: color 0.3s ease-in-out; /* 文字色変更のトランジション */
        }
  
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 80%;
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 20px;
          aspect-ratio: 16 / 9;
          box-sizing: border-box;
          /* 背景色をコンポーネント内で管理 */
          background-color: #f0f0f0; 
        }
  
        .color-picker-area {
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          width: 100%;
          margin-bottom: 20px;
          box-sizing: border-box;
        }
  
        .color-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          padding: 15px;
          width: 45%;
          box-sizing: border-box;
        }
  
        .color-info {
          text-align: center;
        }
  
        input[type="color"] {
          width: 80%;
          height: auto;
          border: none;
          cursor: pointer;
          aspect-ratio: 16 / 9;
          box-sizing: border-box;
        }
  
        h3 {
          font-size: 1.5em;
          margin-bottom: 10px;
        }
  
        p {
          font-size: 1em;
          margin: 5px 0;
        }
  
        #swapColorsButton {
          cursor: pointer;
          border-radius: 50%;
          border: 3px solid black;
          background-color: white;
          width: 10%;
          aspect-ratio: 1 / 1;
        }
  
        .copy-button {
          margin-left: 10px;
          padding: 5px 10px;
          font-size: 0.8em;
          cursor: pointer;
          border: 1px solid #000000;
          border-radius: 5px;
          background-color: #ffffff;
        }
  
        .copy-button:hover {
          background-color: #000000;
          border: 2px solid rgb(255, 255, 255);
          color: white;
        }
      `;
      shadow.appendChild(style);
  
      // --------------------------------------------------
      // 2. HTML構造の定義 (元のdiv#resizableContainerの内容)
      // --------------------------------------------------
      const containerDiv = document.createElement('div');
      containerDiv.className = 'container'; // 元のCSSクラスを維持
      containerDiv.innerHTML = `
        <div class="color-picker-area">
          <div class="color-section left-section">
            <h3>背景色</h3>
            <input type="color" id="backgroundColorPicker" value="#f0f0f0">
            <div class="color-info">
              <p>カラーコード: <span id="backgroundHexCode">#f0f0f0</span> <button class="copy-button" data-copy-target="backgroundHexCode">コピー</button></p>
              <p>RGB: <span id="backgroundRgbValue">rgb(240, 240, 240)</span> <button class="copy-button" data-copy-target="backgroundRgbValue">コピー</button></p>
            </div>
          </div>
          <div class="color-section">
            <h3>文字色</h3>
            <input type="color" id="textColorPicker" value="#000000">
            <div class="color-info">
              <p>カラーコード: <span id="textHexCode">#000000</span> <button class="copy-button" data-copy-target="textHexCode">コピー</button></p>
              <p>RGB: <span id="textRgbValue">rgb(0, 0, 0)</span> <button class="copy-button" data-copy-target="textRgbValue">コピー</button></p>
            </div>
          </div>
        </div>
        <button id="swapColorsButton"><img src="img/ireko.png" width="90%" height="90%"></button>
      `;
      shadow.appendChild(containerDiv);
  
      // --------------------------------------------------
      // 3. 要素への参照取得 (Shadow DOM内から)
      // --------------------------------------------------
      this.backgroundColorPicker = shadow.getElementById('backgroundColorPicker');
      this.backgroundHexCodeSpan = shadow.getElementById('backgroundHexCode');
      this.backgroundRgbValueSpan = shadow.getElementById('backgroundRgbValue');
  
      this.textColorPicker = shadow.getElementById('textColorPicker');
      this.textHexCodeSpan = shadow.getElementById('textHexCode');
      this.textRgbValueSpan = shadow.getElementById('textRgbValue');
  
      this.containerElement = containerDiv; // .container divへの参照
      this.swapColorsButton = shadow.getElementById('swapColorsButton');
      this.copyButtons = shadow.querySelectorAll('.copy-button');
  
      // --------------------------------------------------
      // 4. イベントリスナーとロジックの定義
      // --------------------------------------------------
  
      // フォントサイズ調整関数
      // コンポーネントの幅に応じて内部のフォントサイズを調整します
      this.adjustFontSize = () => {
        const componentWidth = this.containerElement.offsetWidth; // コンポーネントの幅を取得
        const baseWidth = 1200; // 基準となる幅
        const scaleFactor = Math.max(0.5, componentWidth / baseWidth); // 最小サイズを設定
  
        // コンポーネント内の要素のフォントサイズを調整
        this.containerElement.style.fontSize = scaleFactor + 'em';
      };
  
      // ヘルパー関数: HEXをRGBに変換
      this.hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
      };
  
      // 背景色ピッカーの処理
      this.backgroundColorPicker.addEventListener('input', () => {
        const hex = this.backgroundColorPicker.value;
        this.backgroundHexCodeSpan.textContent = hex;
        this.backgroundRgbValueSpan.textContent = this.hexToRgb(hex);
        this.containerElement.style.backgroundColor = hex; // コンポーネントの背景色を変更
      });
  
      // 文字色ピッカーの処理
      this.textColorPicker.addEventListener('input', () => {
        const hex = this.textColorPicker.value;
        this.textHexCodeSpan.textContent = hex;
        this.textRgbValueSpan.textContent = this.hexToRgb(hex);
        this.containerElement.style.color = hex; // コンポーネント内の文字色を変更
      });
  
      // 入れ替えボタンの処理
      this.swapColorsButton.addEventListener('click', () => {
        const currentBackgroundColor = this.backgroundColorPicker.value;
        const currentTextColor = this.textColorPicker.value;
  
        // 背景色と文字色の値を入れ替える
        this.backgroundColorPicker.value = currentTextColor;
        this.textColorPicker.value = currentBackgroundColor;
  
        // 各要素の表示を更新し、スタイルを適用
        this.backgroundColorPicker.dispatchEvent(new Event('input')); // inputイベントを発火させて更新
        this.textColorPicker.dispatchEvent(new Event('input')); // inputイベントを発火させて更新
      });
  
      // コピーボタンの処理
      this.copyButtons.forEach(button => {
        button.addEventListener('click', () => {
          const targetId = button.dataset.copyTarget;
          const textToCopy = shadow.getElementById(targetId).textContent; // Shadow DOM内から要素を取得
          navigator.clipboard.writeText(textToCopy)
            .then(() => {
              alert(`「${textToCopy}」をコピーしました`); // コピー成功のフィードバック
            })
            .catch(err => {
              console.error('クリップボードへの書き込みに失敗しました', err);
            });
        });
      });
    }
  
    // 要素がDOMに追加されたときに呼ばれるライフサイクルコールバック
    connectedCallback() {
      // 初期表示の更新
      this.backgroundColorPicker.dispatchEvent(new Event('input'));
      this.textColorPicker.dispatchEvent(new Event('input'));
  
      // フォントサイズ調整の初期実行とリサイズイベントリスナーの追加
      this.adjustFontSize();
      window.addEventListener('resize', this.adjustFontSize);
    }
  
    // 要素がDOMから削除されたときに呼ばれるライフサイクルコールバック
    disconnectedCallback() {
      // イベントリスナーのクリーンアップ
      window.removeEventListener('resize', this.adjustFontSize);
    }
  }
  
  // カスタム要素を定義
  customElements.define('color-tester', ColorTesterComponent);