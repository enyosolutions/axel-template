const bcrypt = require('bcrypt');
// @ts-ignore
import { google } from 'googleapis';

declare const axel: any;

/** ******* */
/** MAIN  GOOGLE API* */
/** ******* */
const defaultScope = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/userinfo.email',
  'email',
];

function createConnection() {
  return new google.auth.OAuth2(
    axel.config.google.clientId,
    axel.config.google.clientSecret,
    axel.config.google.redirectUrl,
  );
}

function getConnectionUrl(auth: any) {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope,
  });
}

function getPeopleApi(auth: any) {
  return google.people('v1');
}

function getGoogleUrl() {
  const auth = createConnection();
  google.options({ auth });
  const url = getConnectionUrl(auth);
  return url;
}

async function getGoogleAccountFromToken(token: string) {
  const auth = createConnection();
  auth.setCredentials({
    access_token: token,
  });
  google.options({ auth });
  const peopleApi = getPeopleApi(auth);

  const me = await peopleApi.people.get({
    resourceName: 'people/me',
    personFields: 'emailAddresses,names,photos',
  });

  if (!me || !me.data) {
    throw new Error('error_wrong_google_token');
  }

  const nameData = me.data.names && me.data.names && me.data.names[0];
  const email =
    me.data.emailAddresses && me.data.emailAddresses[0] && me.data.emailAddresses[0].value;

  return {
    googleId:
      nameData && nameData.metadata && nameData.metadata.source && nameData.metadata.source.id,
    email,
    firstName: nameData && nameData.givenName,
    lastName: nameData && nameData.familyName,
  };
}

export default {
  getGoogleUrl,
  getGoogleAccountFromToken,
};
