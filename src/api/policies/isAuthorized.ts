/**
 * isAuthorized
 *
 * @description :: Policy to check if user is authorized with JSON web token
 */

import { Request, Response, NextFunction } from 'express';
import AuthService from '../../common/services/AuthService';

declare const axel: any;

export default function isAuthorized(req: Request, res: Response, next: NextFunction) {
  let token;
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
        token = credentials;
      }
    } else {
      return res.status(401).json({
        errors: ['error_no_authorization_wrong_format'],
        message: 'error_no_authorization_wrong_format',
      });
    }
  } else if (req.query.token) {
    token = req.query.token;
    // We delete the token from param to not mess with blueprints
    delete req.query.token;
  } else {
    return res.status(401).json({
      message: 'error_no_authorization_header',
      errors: ['error_no_authorization_header'],
    });
  }
  if (!token || typeof token !== 'string') {
    return res.status(401).json({
      errors: ['error_authorization_token_wrong_format'],
      message: 'error_authorization_token_wrong_format',
    });
  }

  AuthService.verify(token, (error: any, decryptedToken: object | undefined) => {
    if (error) {
      axel.logger.verbose('[ISAUTHORIZED]', error.message || error);
      return res.status(401).json({
        errors: ['error_invalid_token'],
        message: 'error_invalid_token',
      });
    }

    req.user = <UserAsToken>decryptedToken; // This is the decrypted token or the payload you provided
    next();
  });
}
