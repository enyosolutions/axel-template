import _ from 'lodash';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { VerifyCallback, VerifyErrors, sign, verify as jverify } from 'jsonwebtoken';

declare const axel: any;

const primaryKey: string = (axel.config.framework && axel.config.framework.primaryKey) || 'id';
const saltRounds = 10;

export const issue = (payload: string | Buffer | object, expiry = '7d') =>
  sign(
    payload,
    axel.config.tokenSecret, // Token Secret that we sign it with
    {
      expiresIn: expiry, // Token Expire time
    },
  );

// @fixme only id should be inserted in the token. The rest should fetched from the database / cache  with each request
export const generateFor = (user: any) =>
  issue({
    [primaryKey]: user[primaryKey],
    username: user.username,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    roles: user.roles,
  });

// Verifies token on a request
export function verify(token: string, callback: VerifyCallback) {
  return jverify(
    token, // The token to be verified
    axel.config.tokenSecret, // Same token we used to sign
    {}, // No Option,
    // for more see https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
    callback, // Pass errors or decoded token to callback
  );
}

export function beforeCreate(user: any) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(user.password, saltRounds, (error: Error, hash: string) => {
      if (error) {
        return reject(error);
      }
      user.encryptedPassword = hash;
      delete user.password;
      delete user.cPassword;
      delete user.confirmPassword;
      resolve(user);
    });
  });
}

export function beforeUpdate(user: any) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, (err: Error, salt: string) => {
      if (err) return reject(err);
      if (user.password) {
        bcrypt.hash(user.password, salt, (err2: Error, hash: string) => {
          if (err2) {
            return reject(err2);
          }
          user.encryptedPassword = hash;
          delete user.password;
          delete user.cPassword;
          delete user.confirmPassword;
          resolve(true);
        });
      } else {
        resolve(true);
      }
    });
  });
}

export function comparePassword(password: string, user: any) {
  return new Promise((resolve, reject) => {
    if (!user || !user.encryptedPassword) {
      reject(new Error('error_invalid_credentials'));
    }
    bcrypt.compare(password, user.encryptedPassword, (err: Error, match: boolean) => {
      if (err) resolve(err);
      if (match) {
        resolve(true);
      } else {
        reject(new Error('error_invalid_credentials'));
      }
    });
  });
}

// @todo add support for injection of roles checking methods
export function tokenDecryptMiddleware(req: Request, res: Response, next: NextFunction) {
  let hasHeader = false;
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.indexOf('Bearer') > -1
  ) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2) {
      const scheme = parts[0];
      const credentials = parts[1];
      if (/^Bearer$/i.test(scheme)) {
        const token = credentials;
        hasHeader = true;
        verify(token, (err: VerifyErrors | null, decryptedToken: object | undefined) => {
          if (!err) {
            req.user = decryptedToken; // This is the decrypted token or the payload you provided
            // App.session.token = decryptedToken;
            // This is the decrypted token or the payload you provided
            // You should add more validation here
            // >> token is not blacklisted
            // >> user still exists and is still allowed to use the api.
            // get the user from the database
          }
          next();
        });
      }
    }
  }
  // TODO add support for api_key in the query params

  // if there is no token
  if (!hasHeader) {
    next();
  }
}

export function getExtendedRoles(role: string) {
  let myRoles: string[] = [];
  if (
    axel.config.framework.roles[role] &&
    axel.config.framework.roles[role].inherits &&
    Array.isArray(axel.config.framework.roles[role].inherits)
  ) {
    myRoles = myRoles.concat(axel.config.framework.roles[role].inherits);
    axel.config.framework.roles[role].inherits.forEach((r: string) => {
      myRoles = myRoles.concat(getExtendedRoles(r));
    });
  }
  return _.uniq(myRoles);
}

export function hasRole(user: { roles?: string[] }, role: string) {
  return user && user.roles && user.roles.indexOf(role) > -1;
}

export function hasAnyRole(user: { roles?: string[] }, _requiredRoles: string[] | string) {
  if (!user || !user.roles) {
    return false;
  }
  let requiredRoles = [];
  if (typeof _requiredRoles === 'string') {
    requiredRoles = [_requiredRoles];
  } else {
    requiredRoles = _requiredRoles;
  }
  let myRoles = (user && user.roles) || user;
  // Check if role exists
  for (let i = 0; i < requiredRoles.length; i++) {
    const role = requiredRoles[i];
    if (!axel.config.framework.roles[role]) {
      axel.logger.warn(
        'ACTION REQUIRES AN EXISTING ROLE',
        role,
        Object.keys(axel.config.framework.roles),
      );
      return false;
    }
  }

  myRoles.forEach((role: string) => {
    myRoles = myRoles.concat(getExtendedRoles(role));
  });
  let canAccess = false;
  for (let i = 0; i < requiredRoles.length; i++) {
    const role = requiredRoles[i];
    if (myRoles.indexOf(role) > -1) {
      canAccess = true;
      break;
    }
  }

  return canAccess;
}

export default {
  issue,
  generateFor,
  verify,
  comparePassword,
  beforeCreate,
  beforeUpdate,
  hasRole,
  hasAnyRole,
};
