// @flow
import { authRequest } from './fetch';
import { getAuthRequestUri, getRefreshTokenUri } from './uriGenerator';

const { BrowserWindow } = require('electron').remote;

export function googleAuth(): void {
  const authWindow = new BrowserWindow({
    width: 500,
    height: 562,
    webPreferences: {
      nodeIntegration: false
    }
  });

  const uri = getAuthRequestUri();

  authWindow.loadURL(uri);

  authWindow.on('page-title-updated', (event, title) => {
    if (title.includes('code') || title.includes('error')) {
      getCodeFromTitle(title);
      authWindow.destroy();
    }
  });
}

function getCodeFromTitle(title: string): void {
  const rawCode = /code=([^&]*)/.exec(title) || null;
  const code = (rawCode && rawCode.length > 1) ? rawCode[1] : null;
  exchangeCode(code);
}

function exchangeCode(code: ?string): void {
  if (!code) {
    return;
  }
  requestTokens(code)
    .then(json => {
      storeRefreshToken(json);
      location.hash = '/home';
    });
}

function requestTokens(code: string): Promise<any> {
  const uri = getRefreshTokenUri(code);
  return authRequest(uri);
}

function storeRefreshToken(json: any): void {
  localStorage.setItem('refreshToken', json.refresh_token);
}

export function requireAuthorization(): void {
  const isAuthorized = localStorage.getItem('refreshToken');
  location.hash = isAuthorized ? '/home' : '/';
}
