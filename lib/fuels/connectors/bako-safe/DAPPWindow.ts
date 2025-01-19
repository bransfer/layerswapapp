import { WINDOW } from './constants';

type PopupConfig = {
  appUrl: string;
  height: number;
  width: number;
  sessionId: string;
  request_id: string;
};

export class DAppWindow {
  isMobile: boolean = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  isSafariBrowser: boolean = /^((?!chrome|android).)*safari/i.test(
    navigator.userAgent,
  );
  request_id: string;
  isOpen = false;
  opned: Window | null = null;

  constructor(private config: PopupConfig) {
    this.request_id = config.request_id;
  }

  private get popupConfig() {
    const { height, width } = this.config;
    return {
      top: WINDOW.innerHeight / 2 - height / 2,
      left: WINDOW.innerWidth / 2 - width / 2,
      width,
      height:
        !this.isMobile && WINDOW.innerHeight >= height
          ? height
          : WINDOW.innerHeight,
    };
  }

  open(method: string, reject: (e: Error) => void) {
    if (this.isOpen) reject(new Error('Window is already open'));

    if (!this.isSafariBrowser) {
      // if is not safari, we can use popup for both cases
      this.makePopup(method);
    }
    // if (this.isSafariBrowser && isConnection) {
    //   // to use webauthn, we need a new WINDOW
    //   this.makeLink(method);
    // }
    if (this.isSafariBrowser) {
      // && !isConnection) {
      // to confirm tx, we need a new popup
      this.makeFrame(method, true);
    }

    return;
  }

  close() {
    const frame = document.getElementById(`${this.config.sessionId}-iframe`);
    const backdrop = document.getElementById(
      `${this.config.sessionId}-backdrop`,
    );
    if (frame) document.body.removeChild(frame);
    if (backdrop) document.body.removeChild(backdrop);
    if (this.opned) this.opned.close();
    this.isOpen = false;
  }

  makeLink(method: string) {
    const link = `${this.config.appUrl}${method}${this.queryString}`;
    const a = document.createElement('a');
    a.setAttribute('href', link);
    a.setAttribute('target', '_blank');
    a.click();
    this.isOpen = true;
  }

  makeFrame(method: string, isSafari = false) {
    const w = this.small;
    //bako frame
    const frame = document.createElement('iframe');
    frame.id = `${this.config.sessionId}-iframe`;
    frame.src = `${this.config.appUrl}${method}${this.queryString}${
      isSafari ? '&byConnector=true' : ''
    }`;
    frame.style.position = 'fixed';
    frame.style.zIndex = '99999999';
    frame.style.top = `${w.top}`;
    frame.style.left = `${w.left}`;
    frame.style.width = w.width;
    frame.style.height = w.height;
    frame.style.borderRadius = '16px';

    //backdrop
    const backdrop = document.createElement('div');
    backdrop.id = `${this.config.sessionId}-backdrop`;
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100%';
    backdrop.style.height = '100%';
    backdrop.style.backgroundColor = 'rgba(0,0,0,0.5)';
    backdrop.style.zIndex = '99999998';
    backdrop.addEventListener('click', () => this.close()); // if user click on backdrop, close the frame

    document.body.appendChild(backdrop);
    document.body.appendChild(frame);
    this.isOpen = true;
  }

  makePopup(method: string) {
    const link = `${this.config.appUrl}${method}${this.queryString}`;
    const popup = WINDOW.open(
      link,
      'popup',
      `width=${this.popupConfig.width}, height=${this.popupConfig.height}, top=${this.popupConfig.top}, left=${this.popupConfig.left}`,
    );
    if (popup) this.opned = popup;
    this.isOpen = true;
    return popup;
  }

  private get queryString() {
    const { sessionId } = this.config;
    return `?sessionId=${sessionId}&origin=${WINDOW.location.origin}&name=${WINDOW.document.title}&request_id=${this.request_id}`;
  }

  private get small() {
    // todo: update this to calculate by screen size changes
    const breakponint = {
      md: {
        top: 0,
        left: 0,
        limit: 650,
        width: '100%',
        height: '100%',
      }, // 100%
      lg: {
        top: `${(WINDOW.innerHeight - WINDOW.innerHeight * 0.7) / 2}px`,
        left: `${(WINDOW.innerWidth - WINDOW.innerWidth * 0.5) / 2}px`,
        limit: 1024,
        width: '50%',
        height: '70%',
      }, // 75%
      xl: {
        top: `${(WINDOW.innerHeight - 650) / 2}px`,
        left: `${(WINDOW.innerWidth - 500) / 2}px`,
        limit: 1440,
        height: '650px',
        width: '500px',
      }, // 400px
    };
    return WINDOW.innerWidth < breakponint.md.limit
      ? breakponint.md
      : WINDOW.innerWidth < breakponint.lg.limit
        ? breakponint.lg
        : breakponint.xl;
  }
}